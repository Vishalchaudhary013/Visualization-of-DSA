import { useEffect, useRef, useState } from "react";

const WIDTH = 600;
const HEIGHT = 380;
const RADIUS = 22;

const VERTEX_STYLES = {
  current: { fill: "fill-amber-400", chip: "bg-amber-400", legend: "Current" },
  frontier: {
    fill: "fill-violet-500",
    chip: "bg-violet-500",
    legend: "In frontier",
  },
  visited: {
    fill: "fill-emerald-500",
    chip: "bg-emerald-500",
    legend: "Visited",
  },
  unvisited: { fill: "fill-sky-500", chip: "bg-sky-500", legend: "Unvisited" },
};

const EDGE_STYLES = {
  active: {
    stroke: "stroke-amber-400",
    arrow: "fill-amber-400",
    width: 4,
    marker: "arrow-active",
  },
  tree: {
    stroke: "stroke-emerald-500",
    arrow: "fill-emerald-500",
    width: 3,
    marker: "arrow-tree",
  },
  idle: {
    stroke: "stroke-slate-300 dark:stroke-slate-600",
    arrow: "fill-slate-300 dark:fill-slate-600",
    width: 2,
    marker: "arrow-idle",
  },
};

function circleLayout(count) {
  const radius = Math.min(WIDTH, HEIGHT) / 2 - RADIUS - 18;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      x: WIDTH / 2 + radius * Math.cos(angle),
      y: HEIGHT / 2 + radius * Math.sin(angle),
    };
  });
}

const sameEdge = (edge, from, to, directed) =>
  Boolean(edge) &&
  ((edge[0] === from && edge[1] === to) ||
    (!directed && edge[0] === to && edge[1] === from));

export function GraphVisualizer({
  step,
  vertices,
  edges,
  directed,
  frontierLabel,
}) {
  const svgRef = useRef(null);
  const [positions, setPositions] = useState(() => circleLayout(vertices));
  const [dragging, setDragging] = useState(null);

  useEffect(() => setPositions(circleLayout(vertices)), [vertices]);

  if (!step || positions.length !== vertices) return null;

  const frontier = step.frontier ?? [];
  const vertexRole = (v) => {
    if (v === step.current) return "current";
    if (frontier.includes(v)) return "frontier";
    if (step.sorted.includes(v)) return "visited";
    return "unvisited";
  };
  const edgeRole = (from, to) => {
    if (sameEdge(step.activeEdge, from, to, directed)) return "active";
    if (step.treeEdges?.some((edge) => sameEdge(edge, from, to, directed)))
      return "tree";
    return "idle";
  };

  const toSvgPoint = (event) => {
    const matrix = svgRef.current.getScreenCTM()?.inverse();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix,
    );
    return {
      x: Math.min(WIDTH - RADIUS, Math.max(RADIUS, point.x)),
      y: Math.min(HEIGHT - RADIUS, Math.max(RADIUS, point.y)),
    };
  };

  const onPointerMove = (event) => {
    if (dragging === null) return;
    const point = toSvgPoint(event);
    if (!point) return;
    setPositions((current) =>
      current.map((p, i) => (i === dragging ? point : p)),
    );
  };

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {Object.values(VERTEX_STYLES).map((style) => (
          <li key={style.legend} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${style.chip}`} />
            {style.legend === "In frontier"
              ? `In ${frontierLabel.toLowerCase()}`
              : style.legend}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-emerald-500" />
          Discovery edge
        </li>
      </ul>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none select-none rounded-lg bg-muted/20"
        role="img"
        aria-label={`Graph with ${vertices} vertices and ${edges.length} edges`}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
      >
        <defs>
          {Object.entries(EDGE_STYLES).map(([role, style]) => (
            <marker
              key={role}
              id={style.marker}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className={style.arrow} />
            </marker>
          ))}
        </defs>

        {edges.map(([from, to]) => {
          const a = positions[from];
          const b = positions[to];
          if (!a || !b) return null;
          const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          const ux = (b.x - a.x) / length;
          const uy = (b.y - a.y) / length;
          const gap = RADIUS + (directed ? 4 : 0);
          const style = EDGE_STYLES[edgeRole(from, to)];
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x + ux * RADIUS}
              y1={a.y + uy * RADIUS}
              x2={b.x - ux * gap}
              y2={b.y - uy * gap}
              className={`${style.stroke} transition-all duration-300`}
              strokeWidth={style.width}
              strokeLinecap="round"
              markerEnd={directed ? `url(#${style.marker})` : undefined}
            />
          );
        })}

        {positions.map((position, vertex) => {
          const role = vertexRole(vertex);
          return (
            <g
              key={vertex}
              transform={`translate(${position.x} ${position.y})`}
              className={
                dragging === vertex ? "cursor-grabbing" : "cursor-grab"
              }
              onPointerDown={(event) => {
                event.currentTarget.ownerSVGElement.setPointerCapture(
                  event.pointerId,
                );
                setDragging(vertex);
              }}
            >
              {role === "current" && (
                <circle
                  r={RADIUS + 7}
                  className="fill-amber-400/30 animate-pulse"
                />
              )}
              <circle
                r={RADIUS}
                className={`${VERTEX_STYLES[role].fill} stroke-background transition-colors duration-300`}
                strokeWidth="3"
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white text-base font-bold pointer-events-none"
              >
                {vertex}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid gap-3 sm:grid-cols-2">
        <ChipRow
          title={frontierLabel}
          hint={frontierLabel === "Queue" ? "front → back" : "bottom → top"}
          items={frontier}
          chipClass="bg-violet-500"
        />
        <ChipRow
          title="Visit order"
          items={step.order ?? []}
          chipClass="bg-emerald-500"
          separator="→"
        />
      </div>
    </div>
  );
}

function ChipRow({ title, hint, items, chipClass, separator }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {title}
        {hint && <span className="ml-1 opacity-70">({hint})</span>}
      </p>
      <div className="flex min-h-7 flex-wrap items-center gap-1.5">
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground">empty</span>
        )}
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-1.5">
            {separator && index > 0 && (
              <span className="text-xs text-muted-foreground">{separator}</span>
            )}
            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 font-mono text-sm font-semibold text-white ${chipClass}`}
            >
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
