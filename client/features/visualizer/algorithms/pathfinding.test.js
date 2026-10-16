import { describe, expect, it } from "vitest";
import { ALGORITHMS } from "@shared/algorithms";
import { runAlgorithm } from "./index.js";
import {
  COLS,
  HEAVY_COST,
  ROWS,
  cellIndex,
  decodeCells,
  defaultGrid,
  encodeCells,
  generateMaze,
  neighbours,
  randomGrid,
} from "../utils/grid.js";
import { buildParams, readParams } from "../utils/inputs.js";

const IDS = ["a-star", "grid-dijkstra", "grid-bfs", "greedy-best-first"];
const finalPath = (steps) => steps.at(-1).path;

/** Reference cheapest cost (weighted) and fewest moves, by plain Dijkstra/BFS. */
function reference(grid) {
  const walls = new Set(grid.walls);
  const heavy = new Set(grid.weights);
  const solve = (cost) => {
    const dist = new Map([[grid.start, 0]]);
    const done = new Set();
    for (;;) {
      let best = null;
      for (const [cell, d] of dist)
        if (!done.has(cell) && (best === null || d < dist.get(best)))
          best = cell;
      if (best === null) return Infinity;
      if (best === grid.end) return dist.get(best);
      done.add(best);
      for (const next of neighbours(best)) {
        if (walls.has(next)) continue;
        const d = dist.get(best) + cost(next);
        if (d < (dist.get(next) ?? Infinity)) dist.set(next, d);
      }
    }
  };
  return {
    cost: solve((cell) => (heavy.has(cell) ? HEAVY_COST : 1)),
    moves: solve(() => 1),
  };
}

function pathIsValid(path, grid) {
  const walls = new Set(grid.walls);
  if (path[0] !== grid.start || path.at(-1) !== grid.end) return false;
  return path.every(
    (cell, i) =>
      !walls.has(cell) && (i === 0 || neighbours(path[i - 1]).includes(cell)),
  );
}
const pathCost = (path, grid) => {
  const heavy = new Set(grid.weights);
  return path
    .slice(1)
    .reduce((sum, cell) => sum + (heavy.has(cell) ? HEAVY_COST : 1), 0);
};

describe.each(IDS)("%s", (id) => {
  it("produces valid steps on the default grid", () => {
    const steps = runAlgorithm(id, { grid: defaultGrid() });
    const lines = ALGORITHMS[id].pseudoCode.split("\n").length;
    for (const step of steps) {
      expect(step.explanation).toBeTruthy();
      if (step.line !== null) expect(step.line).toBeLessThan(lines);
    }
    expect(pathIsValid(finalPath(steps), defaultGrid())).toBe(true);
  });

  it("reports when the goal is walled off", () => {
    const end = cellIndex(7, 20);
    const grid = {
      start: cellIndex(0, 0),
      end,
      walls: neighbours(end),
      weights: [],
    };
    const steps = runAlgorithm(id, { grid });
    expect(finalPath(steps)).toEqual([]);
    expect(steps.at(-1).explanation).toMatch(/cannot be reached/);
  });
});

describe("path quality on random grids and mazes", () => {
  const grids = [
    ...Array.from({ length: 12 }, () =>
      randomGrid({ start: cellIndex(1, 1), end: cellIndex(13, 23) }),
    ),
    ...Array.from({ length: 4 }, generateMaze),
  ];

  it("A* and Dijkstra find the cheapest path; BFS the fewest moves; greedy any valid path", () => {
    for (const grid of grids) {
      const { cost, moves } = reference(grid);
      for (const id of IDS) {
        const path = finalPath(runAlgorithm(id, { grid }));
        if (cost === Infinity) {
          expect(path).toEqual([]);
          continue;
        }
        expect(pathIsValid(path, grid)).toBe(true);
        if (id === "a-star" || id === "grid-dijkstra")
          expect(pathCost(path, grid)).toBe(cost);
        if (id === "grid-bfs") expect(path.length - 1).toBe(moves);
        if (id === "greedy-best-first")
          expect(pathCost(path, grid)).toBeGreaterThanOrEqual(cost);
      }
    }
  });

  it("A* never explores more cells than Dijkstra", () => {
    for (const grid of grids) {
      const explored = (id) =>
        runAlgorithm(id, { grid }).at(-1).operations.reads;
      expect(explored("a-star")).toBeLessThanOrEqual(explored("grid-dijkstra"));
    }
  });
});

describe("grid model", () => {
  it("generates mazes that always connect start and goal", () => {
    for (let i = 0; i < 10; i++) {
      const maze = generateMaze();
      expect(reference(maze).moves).toBeLessThan(Infinity);
      expect(maze.walls.length).toBeGreaterThan((ROWS * COLS) / 3);
    }
  });

  it("encodes cell lists compactly and rejects bad input", () => {
    const cells = [0, 5, 37, ROWS * COLS - 1];
    expect(decodeCells(encodeCells(cells))).toEqual(cells);
    expect(decodeCells("zz.!!")).toBeNull();
    expect(decodeCells("")).toEqual([]);
  });

  it("round-trips through the URL", () => {
    const grid = generateMaze();
    const params = buildParams({ algorithm: "a-star", kind: "grid", grid });
    const result = readParams(params, {
      algorithm: "bubble-sort",
      edges: [],
      vertices: 6,
      grid: defaultGrid(),
    });
    expect(result.algorithm).toBe("a-star");
    expect(result.grid).toEqual(grid);
    expect(params.toString().length).toBeLessThan(1500);
  });
});
