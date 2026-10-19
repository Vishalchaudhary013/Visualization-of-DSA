import { describe, expect, it } from "vitest";
import { ALGORITHMS } from "@shared/algorithms";
import { runAlgorithm } from "./index.js";
import {
  COLS,
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

const IDS = ["grid-bfs", "greedy-best-first"];
const finalPath = (steps) => steps.at(-1).path;

/** Reference fewest moves from start to goal (plain BFS), Infinity if walled off. */
function fewestMoves(grid) {
  const walls = new Set(grid.walls);
  const dist = new Map([[grid.start, 0]]);
  const queue = [grid.start];
  while (queue.length) {
    const cell = queue.shift();
    if (cell === grid.end) return dist.get(cell);
    for (const next of neighbours(cell)) {
      if (walls.has(next) || dist.has(next)) continue;
      dist.set(next, dist.get(cell) + 1);
      queue.push(next);
    }
  }
  return Infinity;
}

function pathIsValid(path, grid) {
  const walls = new Set(grid.walls);
  if (path[0] !== grid.start || path.at(-1) !== grid.end) return false;
  return path.every(
    (cell, i) =>
      !walls.has(cell) && (i === 0 || neighbours(path[i - 1]).includes(cell)),
  );
}

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

  it("BFS finds the fewest moves; greedy finds a valid path", () => {
    for (const grid of grids) {
      const moves = fewestMoves(grid);
      for (const id of IDS) {
        const path = finalPath(runAlgorithm(id, { grid }));
        if (moves === Infinity) {
          expect(path).toEqual([]);
          continue;
        }
        expect(pathIsValid(path, grid)).toBe(true);
        if (id === "grid-bfs") expect(path.length - 1).toBe(moves);
        else expect(path.length - 1).toBeGreaterThanOrEqual(moves);
      }
    }
  });

  it("greedy explores fewer cells than BFS on an open grid", () => {
    const grid = { start: cellIndex(7, 2), end: cellIndex(7, 22), walls: [] };
    const explored = (id) => runAlgorithm(id, { grid }).at(-1).operations.reads;
    expect(explored("greedy-best-first")).toBeLessThan(explored("grid-bfs"));
  });
});

describe("grid model", () => {
  it("generates mazes that always connect start and goal", () => {
    for (let i = 0; i < 10; i++) {
      const maze = generateMaze();
      expect(fewestMoves(maze)).toBeLessThan(Infinity);
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
    const params = buildParams({ algorithm: "grid-bfs", kind: "grid", grid });
    const result = readParams(params, {
      algorithm: "bubble-sort",
      edges: [],
      vertices: 6,
      grid: defaultGrid(),
    });
    expect(result.algorithm).toBe("grid-bfs");
    expect(result.grid).toEqual(grid);
    expect(params.toString().length).toBeLessThan(1500);
  });
});
