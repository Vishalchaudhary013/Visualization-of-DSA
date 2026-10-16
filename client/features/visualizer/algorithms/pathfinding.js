// Grid pathfinding: BFS, Dijkstra, A* and greedy best-first share one search
// loop and differ only in how the next cell is chosen. Each step is:
// {
//   current:  cell being explored (-1 when none)
//   open:     frontier cells waiting to be explored
//   closed:   cells already explored
//   path:     cells of the found path drawn so far
//   line, explanation, operations (comparisons = neighbour checks,
//     reads = cells explored, writes = cost/parent updates)
// }
// `state`, `comparisons`, `swaps` and `sorted` are kept empty for the shared panels.
import { HEAVY_COST, cellLabel, manhattan, neighbours } from "../utils/grid.js";

const MODES = {
  bfs: { name: "BFS", weighted: false, priority: (g, h, seq) => [seq] },
  dijkstra: { name: "Dijkstra", weighted: true, priority: (g) => [g] },
  astar: { name: "A*", weighted: true, priority: (g, h) => [g + h, h] },
  greedy: {
    name: "Greedy best-first",
    weighted: false,
    priority: (g, h) => [h],
  },
};
const MAX_PATH_STEPS = 30;

const compareKeys = (a, b) => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff) return diff;
  }
  return 0;
};

export function gridSearch(grid, modeName) {
  const mode = MODES[modeName];
  const { start, end } = grid;
  const walls = new Set(grid.walls);
  const heavy = new Set(grid.weights);
  const cost = (cell) => (mode.weighted && heavy.has(cell) ? HEAVY_COST : 1);
  const ops = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };
  const steps = [];
  const g = new Map([[start, 0]]);
  const parent = new Map();
  const closed = new Set();
  // Classic BFS / greedy never revisit a cell once it has been queued
  const seen = new Set([start]);
  let open = [{ cell: start, key: mode.priority(0, manhattan(start, end), 0) }];
  let seq = 1;

  const record = (current, line, explanation, path = []) =>
    steps.push({
      state: [],
      comparisons: [],
      swaps: [],
      sorted: [],
      current,
      open: [...new Set(open.map((item) => item.cell))],
      closed: [...closed],
      path: [...path],
      line,
      explanation,
      operations: { ...ops },
    });

  const describe = (cell) => {
    const h = manhattan(cell, end);
    if (modeName === "astar")
      return `g = ${g.get(cell)}, h = ${h}, f = ${g.get(cell) + h}`;
    if (modeName === "dijkstra") return `cost so far ${g.get(cell)}`;
    if (modeName === "greedy") return `guessed distance to goal h = ${h}`;
    return `${g.get(cell)} ${g.get(cell) === 1 ? "move" : "moves"} from the start`;
  };

  record(
    start,
    1,
    `Start at ${cellLabel(start)}; the goal is ${cellLabel(end)}${
      !mode.weighted && heavy.size
        ? ". Heavy cells are ignored: this algorithm only counts moves"
        : ""
    }`,
  );

  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      if (compareKeys(open[i].key, open[best].key) < 0) best = i;
    }
    const { cell: current } = open.splice(best, 1)[0];
    if (closed.has(current)) continue; // outdated entry (Dijkstra / A*)
    closed.add(current);
    ops.reads++;

    if (current === end) {
      const path = [];
      for (let cell = end; cell !== undefined; cell = parent.get(cell))
        path.unshift(cell);
      const totalCost = path
        .slice(1)
        .reduce((sum, cell) => sum + (heavy.has(cell) ? HEAVY_COST : 1), 0);
      record(
        current,
        4,
        `Reached the goal ${cellLabel(end)}. Follow the parents back to draw the path`,
      );
      const chunk = Math.ceil(path.length / MAX_PATH_STEPS);
      for (let shown = chunk; shown < path.length + chunk; shown += chunk) {
        record(
          -1,
          4,
          `Tracing the path back: ${Math.min(shown, path.length)} of ${path.length} cells`,
          path.slice(0, shown),
        );
      }
      record(
        -1,
        null,
        `${mode.name} found a path of ${path.length - 1} moves (cost ${totalCost}) after exploring ${closed.size} cells`,
        path,
      );
      return steps;
    }

    let added = 0;
    for (const next of neighbours(current)) {
      if (walls.has(next)) continue;
      ops.comparisons++;
      const candidate = g.get(current) + cost(next);
      const better = mode.weighted
        ? candidate < (g.get(next) ?? Infinity)
        : !seen.has(next);
      if (!better || closed.has(next)) continue;
      g.set(next, candidate);
      parent.set(next, current);
      seen.add(next);
      ops.writes++;
      open.push({
        cell: next,
        key: mode.priority(candidate, manhattan(next, end), seq++),
      });
      added++;
    }
    record(
      current,
      3,
      `Explore ${cellLabel(current)} (${describe(current)}): ${
        added
          ? `${added} ${added === 1 ? "neighbour" : "neighbours"} added to the frontier`
          : "no new neighbours"
      }`,
    );
  }

  record(
    -1,
    8,
    `The frontier is empty: the goal cannot be reached (${closed.size} cells explored)`,
  );
  return steps;
}
