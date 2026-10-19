// Grid pathfinding: BFS and greedy best-first share one search loop and
// differ only in which frontier cell is explored next. Each step is:
// {
//   current:  cell being explored (-1 when none)
//   open:     frontier cells waiting to be explored
//   closed:   cells already explored
//   path:     cells of the found path drawn so far
//   line, explanation, operations (comparisons = neighbour checks,
//     reads = cells explored, writes = frontier additions)
// }
// `state`, `comparisons`, `swaps` and `sorted` are kept empty for the shared panels.
import { cellLabel, manhattan, neighbours } from "../utils/grid.js";

const MODES = {
  // Oldest cell first (a queue)
  bfs: { name: "BFS", priority: (moves, h, seq) => [seq] },
  // Cell that looks closest to the goal first
  greedy: { name: "Greedy best-first", priority: (moves, h, seq) => [h, seq] },
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
  const ops = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };
  const steps = [];
  const moves = new Map([[start, 0]]);
  const parent = new Map();
  const closed = new Set();
  // A cell is never queued twice
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
      open: open.map((item) => item.cell),
      closed: [...closed],
      path: [...path],
      line,
      explanation,
      operations: { ...ops },
    });

  const describe = (cell) =>
    modeName === "greedy"
      ? `guessed distance to goal h = ${manhattan(cell, end)}`
      : `${moves.get(cell)} ${moves.get(cell) === 1 ? "move" : "moves"} from the start`;

  record(
    start,
    1,
    `Start at ${cellLabel(start)}; the goal is ${cellLabel(end)}`,
  );

  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      if (compareKeys(open[i].key, open[best].key) < 0) best = i;
    }
    const { cell: current } = open.splice(best, 1)[0];
    closed.add(current);
    ops.reads++;

    if (current === end) {
      const path = [];
      for (let cell = end; cell !== undefined; cell = parent.get(cell))
        path.unshift(cell);
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
        `${mode.name} found a path of ${path.length - 1} moves after exploring ${closed.size} cells`,
        path,
      );
      return steps;
    }

    let added = 0;
    for (const next of neighbours(current)) {
      if (walls.has(next)) continue;
      ops.comparisons++;
      if (seen.has(next)) continue;
      moves.set(next, moves.get(current) + 1);
      parent.set(next, current);
      seen.add(next);
      ops.writes++;
      open.push({
        cell: next,
        key: mode.priority(moves.get(next), manhattan(next, end), seq++),
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
