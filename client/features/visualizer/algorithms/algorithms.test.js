import { describe, expect, it } from "vitest";
import { ALGORITHMS } from "@shared/algorithms";
import { ALGORITHM_KINDS, ALGORITHM_RUNNERS, runAlgorithm } from "./index.js";
import { ARRAY_PRESETS, generateGraphEdges } from "../utils/inputs.js";

const SORT_IDS = Object.keys(ALGORITHM_RUNNERS).filter(
  (id) => ALGORITHM_RUNNERS[id].kind === ALGORITHM_KINDS.SORT,
);

const SAMPLE_INPUTS = [
  [5, 2, 8, 1, 9],
  [1, 2, 3, 4, 5, 6],
  [9, 7, 5, 3, 1],
  [4, 4, 2, 2, 7, 7, 1],
  [42, 7],
  ...Object.values(ARRAY_PRESETS).map((preset) => preset.build(25)),
];

const ascending = (values) => [...values].sort((a, b) => a - b);
const pseudoLineCount = (id) => ALGORITHMS[id].pseudoCode.split("\n").length;

function expectValidSteps(id, steps) {
  expect(steps.length).toBeGreaterThan(0);
  const lines = pseudoLineCount(id);
  let previous = null;
  for (const step of steps) {
    expect(typeof step.explanation).toBe("string");
    expect(step.explanation.length).toBeGreaterThan(0);
    if (step.line !== null) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(lines);
    }
    // Counters only ever grow
    if (previous) {
      for (const key of Object.keys(step.operations)) {
        expect(step.operations[key]).toBeGreaterThanOrEqual(
          previous.operations[key],
        );
      }
    }
    previous = step;
  }
}

describe("every runnable algorithm has metadata", () => {
  it.each(Object.keys(ALGORITHM_RUNNERS))("%s", (id) => {
    const algorithm = ALGORITHMS[id];
    expect(algorithm).toBeDefined();
    expect(algorithm.howItWorks.length).toBeGreaterThan(0);
    expect(algorithm.useCases.length).toBeGreaterThan(0);
  });
});

describe.each(SORT_IDS)("%s", (id) => {
  it.each(SAMPLE_INPUTS.map((input) => [input.join(","), input]))(
    "sorts [%s]",
    (_, input) => {
      const steps = runAlgorithm(id, { array: input });
      expectValidSteps(id, steps);
      const last = steps[steps.length - 1];
      expect(last.state).toEqual(ascending(input));
      expect(last.sorted).toEqual(input.map((_, index) => index));
      // Every intermediate state is a permutation of the input
      for (const step of steps) {
        expect(ascending(step.state)).toEqual(ascending(input));
      }
    },
  );

  it("does not mutate its input", () => {
    const input = [3, 1, 2];
    runAlgorithm(id, { array: input });
    expect(input).toEqual([3, 1, 2]);
  });
});

describe("bubble sort", () => {
  it("stops after one pass on sorted input (best case O(n))", () => {
    const steps = runAlgorithm("bubble-sort", { array: [1, 2, 3, 4, 5] });
    expect(steps.at(-1).operations.comparisons).toBe(4);
    expect(steps.at(-1).operations.swaps).toBe(0);
  });
});

describe.each(["linear-search", "binary-search"])("%s", (id) => {
  const input = [15, 3, 27, 8, 42, 19];

  it.each(input)("finds %i", (target) => {
    const steps = runAlgorithm(id, { array: input, target });
    expectValidSteps(id, steps);
    const last = steps.at(-1);
    const searched = id === "binary-search" ? ascending(input) : input;
    expect(last.sorted).toEqual([searched.indexOf(target)]);
    expect(last.state[last.sorted[0]]).toBe(target);
  });

  it("reports a missing target", () => {
    const steps = runAlgorithm(id, { array: input, target: 100 });
    expect(steps.at(-1).sorted).toEqual([]);
    expect(steps.at(-1).explanation).toMatch(/not in the array/);
  });
});

describe("binary search", () => {
  it("uses at most ceil(log2(n + 1)) comparisons", () => {
    const array = Array.from({ length: 50 }, (_, i) => i * 2);
    for (const target of [-1, 0, 49, 98, 99]) {
      const steps = runAlgorithm("binary-search", { array, target });
      expect(steps.at(-1).operations.comparisons).toBeLessThanOrEqual(6);
    }
  });
});

describe("graph traversals", () => {
  // 0 - 1 - 3
  // |   |
  // 2 - 4     5 (isolated)
  const graph = {
    vertices: 6,
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 4],
    ],
    start: 0,
    directed: false,
  };

  it("BFS visits vertices level by level", () => {
    const steps = runAlgorithm("bfs", { graph });
    expectValidSteps("bfs", steps);
    const last = steps.at(-1);
    expect(last.order).toEqual([0, 1, 2, 3, 4]);
    expect(last.treeEdges).toHaveLength(4);
    expect(last.explanation).toMatch(/Not reachable from the start: 5/);
  });

  it("DFS goes deep first and backtracks", () => {
    const steps = runAlgorithm("dfs", { graph });
    expectValidSteps("dfs", steps);
    expect(steps.at(-1).order).toEqual([0, 1, 3, 4, 2]);
    expect(steps.some((step) => /backtrack/.test(step.explanation))).toBe(true);
  });

  it("respects edge direction", () => {
    const steps = runAlgorithm("bfs", {
      graph: {
        vertices: 3,
        edges: [
          [1, 0],
          [1, 2],
        ],
        start: 0,
        directed: true,
      },
    });
    expect(steps.at(-1).order).toEqual([0]);
  });

  it.each(["bfs", "dfs"])(
    "%s reaches every vertex of a random connected graph",
    (id) => {
      for (let vertices = 2; vertices <= 10; vertices++) {
        const edges = generateGraphEdges(vertices);
        const steps = runAlgorithm(id, {
          graph: { vertices, edges, start: 0, directed: false },
        });
        expect(ascending(steps.at(-1).order)).toEqual(
          Array.from({ length: vertices }, (_, i) => i),
        );
      }
    },
  );
});

describe("weighted and directed graph algorithms", () => {
  // MST weight 33 (1+2+2+4+7+8+9), shortest distances from 0 checked below
  //   0 -4- 1 -8- 2
  //   |     |     |
  //   8    11     2
  //   |     |     |
  //   7 -1- 6 -2- 5
  const graph = {
    vertices: 8,
    edges: [
      [0, 1, 4],
      [1, 2, 8],
      [0, 7, 8],
      [1, 6, 11],
      [2, 5, 2],
      [7, 6, 1],
      [6, 5, 2],
      [2, 3, 7],
      [3, 4, 9],
      [5, 4, 10],
    ],
    start: 0,
    directed: false,
  };

  /** Reference shortest paths (Bellman-Ford) to check Dijkstra against. */
  function bellmanFord({ vertices, edges, start, directed }) {
    const dist = Array(vertices).fill(Infinity);
    dist[start] = 0;
    const all = directed
      ? edges
      : [...edges, ...edges.map(([a, b, w]) => [b, a, w])];
    for (let i = 0; i < vertices; i++) {
      for (const [a, b, w = 1] of all)
        if (dist[a] + w < dist[b]) dist[b] = dist[a] + w;
    }
    return dist;
  }
  const finalLabels = (steps) =>
    Object.values(steps.at(-1).labels).map((l) =>
      l === "∞" ? Infinity : Number(l),
    );
  const treeWeight = (steps, edges) =>
    steps.at(-1).treeEdges.reduce((sum, [a, b]) => {
      const edge = edges.find(
        ([x, y]) => (x === a && y === b) || (x === b && y === a),
      );
      return sum + edge[2];
    }, 0);

  it("Dijkstra matches Bellman-Ford on the example and on random graphs", () => {
    const steps = runAlgorithm("dijkstra", { graph });
    expectValidSteps("dijkstra", steps);
    expect(finalLabels(steps)).toEqual(bellmanFord(graph));
    expect(finalLabels(steps)).toEqual([0, 4, 12, 19, 21, 11, 9, 8]);

    for (let vertices = 2; vertices <= 10; vertices++) {
      for (const directed of [false, true]) {
        const random = {
          vertices,
          edges: generateGraphEdges(vertices),
          start: 0,
          directed,
        };
        expect(
          finalLabels(runAlgorithm("dijkstra", { graph: random })),
        ).toEqual(bellmanFord(random));
      }
    }
  });

  it("Dijkstra's tree edges form shortest paths to every reachable vertex", () => {
    const steps = runAlgorithm("dijkstra", { graph });
    expect(steps.at(-1).treeEdges).toHaveLength(graph.vertices - 1);
  });

  it.each(["prim", "kruskal"])("%s finds the minimum spanning tree", (id) => {
    const steps = runAlgorithm(id, { graph });
    expectValidSteps(id, steps);
    expect(steps.at(-1).treeEdges).toHaveLength(graph.vertices - 1);
    expect(treeWeight(steps, graph.edges)).toBe(33);
    expect(steps.at(-1).explanation).toMatch(/total weight 33/);
  });

  it("Prim and Kruskal agree on random graphs, even if marked directed", () => {
    for (let vertices = 2; vertices <= 10; vertices++) {
      const random = {
        vertices,
        edges: generateGraphEdges(vertices),
        start: 0,
        directed: true,
      };
      const primSteps = runAlgorithm("prim", { graph: random });
      const kruskalSteps = runAlgorithm("kruskal", { graph: random });
      expect(primSteps.at(-1).treeEdges).toHaveLength(vertices - 1);
      expect(treeWeight(primSteps, random.edges)).toBe(
        treeWeight(kruskalSteps, random.edges),
      );
    }
  });

  it("Kruskal marks edges that would form a cycle", () => {
    const steps = runAlgorithm("kruskal", { graph });
    expect(steps.at(-1).skippedEdges.length).toBeGreaterThan(0);
  });

  it("topological sort orders every edge forward", () => {
    for (let vertices = 2; vertices <= 10; vertices++) {
      const edges = generateGraphEdges(vertices);
      const steps = runAlgorithm("topological-sort", {
        graph: { vertices, edges, start: 0, directed: false },
      });
      expectValidSteps("topological-sort", steps);
      const order = steps.at(-1).order;
      expect([...order].sort((a, b) => a - b)).toEqual(
        Array.from({ length: vertices }, (_, i) => i),
      );
      const position = new Map(order.map((v, i) => [v, i]));
      for (const [a, b] of edges)
        expect(position.get(a)).toBeLessThan(position.get(b));
    }
  });

  it("topological sort detects a cycle", () => {
    const steps = runAlgorithm("topological-sort", {
      graph: {
        vertices: 3,
        edges: [
          [0, 1],
          [1, 2],
          [2, 0],
        ],
        start: 0,
        directed: true,
      },
    });
    expect(steps.at(-1).explanation).toMatch(/cycle/);
    expect(steps.at(-1).line).toBe(7);
  });
});
