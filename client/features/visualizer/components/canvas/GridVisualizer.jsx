import { useRef } from "react";
import { COLS, HEAVY_COST, ROWS, normalizeGrid } from "../../utils/grid";

const LEGEND = [
  { label: "Start", className: "bg-emerald-600" },
  { label: "Goal", className: "bg-rose-500" },
  { label: "Wall", className: "bg-slate-700 dark:bg-slate-500" },
  {
    label: `Heavy (cost ${HEAVY_COST})`,
    className: "bg-amber-200 dark:bg-amber-900",
  },
  { label: "Frontier", className: "bg-violet-400" },
  { label: "Explored", className: "bg-sky-300 dark:bg-sky-800" },
  { label: "Path", className: "bg-amber-400" },
];

/**
 * The pathfinding grid. Drag to draw with the selected tool (walls, heavy
 * cells, eraser); drag the start or goal to move them. Works with mouse and touch.
 */
export function GridVisualizer({ step, grid, onGridChange, tool }) {
  const drag = useRef(null);
  if (!step) return null;

  const walls = new Set(grid.walls);
  const heavy = new Set(grid.weights);
  const open = new Set(step.open);
  const closed = new Set(step.closed);
  const path = new Set(step.path);

  const cellClass = (cell) => {
    if (cell === grid.start) return "bg-emerald-600 text-white";
    if (cell === grid.end) return "bg-rose-500 text-white";
    if (walls.has(cell)) return "bg-slate-700 dark:bg-slate-500";
    if (path.has(cell)) return "bg-amber-400 text-amber-950";
    if (cell === step.current)
      return "bg-amber-300 ring-2 ring-amber-500 ring-inset";
    if (open.has(cell)) return "bg-violet-400 text-white";
    if (closed.has(cell))
      return heavy.has(cell)
        ? "bg-sky-400 dark:bg-sky-700"
        : "bg-sky-300 dark:bg-sky-800";
    if (heavy.has(cell))
      return "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200";
    return "bg-card";
  };

  const cellFromEvent = (event) => {
    const element = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("[data-cell]");
    return element ? Number(element.dataset.cell) : null;
  };

  const apply = (cell) => {
    const action = drag.current;
    if (cell === null || !action || cell === action.last) return;
    action.last = cell;
    if (action.type === "start" || action.type === "end") {
      const other = action.type === "start" ? grid.end : grid.start;
      if (cell === other || walls.has(cell)) return;
      onGridChange(normalizeGrid({ ...grid, [action.type]: cell }));
      return;
    }
    if (cell === grid.start || cell === grid.end) return;
    let nextWalls = grid.walls.filter((c) => c !== cell);
    let nextWeights = grid.weights.filter((c) => c !== cell);
    if (action.type === "add-wall") nextWalls = [...nextWalls, cell];
    if (action.type === "add-weight") nextWeights = [...nextWeights, cell];
    onGridChange(
      normalizeGrid({ ...grid, walls: nextWalls, weights: nextWeights }),
    );
  };

  const onPointerDown = (event) => {
    const cell = cellFromEvent(event);
    if (cell === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    let type;
    if (cell === grid.start) type = "start";
    else if (cell === grid.end) type = "end";
    else if (tool === "wall") type = walls.has(cell) ? "erase" : "add-wall";
    else if (tool === "weight") type = heavy.has(cell) ? "erase" : "add-weight";
    else type = "erase";
    drag.current = { type, last: null };
    apply(cell);
  };

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span
              className={`h-3 w-3 rounded-sm border border-border ${item.className}`}
            />
            {item.label}
          </li>
        ))}
      </ul>
      <div
        role="grid"
        aria-label={`Pathfinding grid, ${ROWS} rows by ${COLS} columns`}
        className="grid touch-none select-none gap-px overflow-hidden rounded-lg border border-border bg-border"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        onPointerDown={onPointerDown}
        onPointerMove={(event) => drag.current && apply(cellFromEvent(event))}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {Array.from({ length: ROWS * COLS }, (_, cell) => (
          <div
            key={cell}
            data-cell={cell}
            className={`flex aspect-square items-center justify-center text-[9px] font-bold transition-colors duration-150 sm:text-[11px] ${cellClass(cell)} ${
              cell === grid.start || cell === grid.end
                ? "cursor-grab"
                : "cursor-crosshair"
            }`}
          >
            {cell === grid.start
              ? "S"
              : cell === grid.end
                ? "G"
                : heavy.has(cell) && !walls.has(cell)
                  ? HEAVY_COST
                  : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
