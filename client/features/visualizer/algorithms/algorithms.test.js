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
