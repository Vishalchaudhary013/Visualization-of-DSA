// Grid model for the pathfinding algorithms. Cells are numbered row by row
// (index = row * COLS + col). A grid is { start, end, walls } where walls is
// a sorted array of cell indices.

export const ROWS = 15;
export const COLS = 25;

export const cellIndex = (row, col) => row * COLS + col;
export const cellRow = (index) => Math.floor(index / COLS);
export const cellCol = (index) => index % COLS;
export const cellLabel = (index) => `(${cellRow(index)}, ${cellCol(index)})`;

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const sorted = (cells) => [...new Set(cells)].sort((a, b) => a - b);

/** Up, right, down, left neighbours that are inside the grid. */
export function neighbours(index) {
  const row = cellRow(index);
  const col = cellCol(index);
  const result = [];
  if (row > 0) result.push(index - COLS);
  if (col < COLS - 1) result.push(index + 1);
  if (row < ROWS - 1) result.push(index + COLS);
  if (col > 0) result.push(index - 1);
  return result;
}

/** Manhattan distance: the number of moves to the goal if there were no walls. */
export const manhattan = (a, b) =>
  Math.abs(cellRow(a) - cellRow(b)) + Math.abs(cellCol(a) - cellCol(b));

/** Start on the left, goal on the right, a wall with a gap in between. */
export function defaultGrid() {
  const walls = [];
  for (let row = 2; row < ROWS - 2; row++) {
    if (row !== 4) walls.push(cellIndex(row, 12));
  }
  return {
    start: cellIndex(7, 4),
    end: cellIndex(7, 20),
    walls: sorted(walls),
  };
}

/** Removes walls from the start and goal so they always stay open. */
export function normalizeGrid({ start, end, walls }) {
  return {
    start,
    end,
    walls: sorted(walls.filter((cell) => cell !== start && cell !== end)),
  };
}

/** Perfect maze by randomized depth-first search over the odd cells. */
export function generateMaze() {
  const open = new Set();
  const stack = [cellIndex(1, 1)];
  open.add(stack[0]);
  while (stack.length) {
    const current = stack.at(-1);
    const row = cellRow(current);
    const col = cellCol(current);
    const options = [
      [-2, 0],
      [0, 2],
      [2, 0],
      [0, -2],
    ]
      .map(([dr, dc]) => [row + dr, col + dc, row + dr / 2, col + dc / 2])
      .filter(
        ([r, c]) =>
          r > 0 &&
          r < ROWS - 1 &&
          c > 0 &&
          c < COLS - 1 &&
          !open.has(cellIndex(r, c)),
      );
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [r, c, wallRow, wallCol] = options[randomInt(0, options.length - 1)];
    open.add(cellIndex(wallRow, wallCol));
    open.add(cellIndex(r, c));
    stack.push(cellIndex(r, c));
  }
  const walls = [];
  for (let cell = 0; cell < ROWS * COLS; cell++)
    if (!open.has(cell)) walls.push(cell);
  return normalizeGrid({
    start: cellIndex(1, 1),
    end: cellIndex(ROWS - 2, COLS - 2),
    walls,
  });
}

/** About 28% random walls, keeping start and goal. */
export function randomGrid({ start, end }) {
  const walls = [];
  for (let cell = 0; cell < ROWS * COLS; cell++) {
    if (Math.random() < 0.28) walls.push(cell);
  }
  return normalizeGrid({ start, end, walls });
}

// URL format: cell lists as base-36 numbers joined by "." (short and URL-safe)
export const encodeCells = (cells) =>
  cells.map((cell) => cell.toString(36)).join(".");

export function decodeCells(text) {
  if (!text) return [];
  const cells = text.split(".").map((part) => Number.parseInt(part, 36));
  return cells.every(
    (cell) => Number.isInteger(cell) && cell >= 0 && cell < ROWS * COLS,
  )
    ? sorted(cells)
    : null;
}

export function decodeCell(text) {
  const cell = Number.parseInt(text ?? "", 36);
  return Number.isInteger(cell) && cell >= 0 && cell < ROWS * COLS
    ? cell
    : null;
}
