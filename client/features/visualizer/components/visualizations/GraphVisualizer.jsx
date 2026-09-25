import { motion } from "framer-motion";
export function GraphVisualizer({
  step,
  vertices,
  edges,
  directed = false,
  width = 600,
  height = 400,
}) {
  if (!step) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">Load a graph algorithm to start</p>
      </div>
    );
  }
  // Position vertices in a circle
  const radius = Math.min(width, height) / 3;
  const centerX = width / 2;
  const centerY = height / 2;
  const positions = Array.from({ length: vertices }, (_, i) => {
    const angle = (i / vertices) * Math.PI * 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
  const visited = step.sorted || [];
  const currentVertex = step.comparisons?.[0] ?? -1;
  const getVertexColor = (index) => {
    if (index === currentVertex) {
      return "rgb(250, 204, 21)"; // Yellow for current
    }
    if (visited.includes(index)) {
      return "rgb(34, 197, 94)"; // Green for visited
    }
    return "rgb(59, 130, 246)"; // Blue default
  };
  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <svg width={width} height={height} className="bg-muted/10 rounded-lg">
        {edges.map((edge, idx) => {
          const [from, to] = edge;
          if (from >= 0 && from < vertices && to >= 0 && to < vertices) {
            const fromPos = positions[from];
            const toPos = positions[to];
            const isVisited = visited.includes(from) && visited.includes(to);
            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isVisited ? "rgb(34, 197, 94)" : "rgb(148, 163, 184)"}
                  strokeWidth={isVisited ? 2 : 1}
                  markerEnd={directed ? "url(#arrowhead)" : undefined}
                />
                {directed && (
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3, 0 6"
                        fill="rgb(148, 163, 184)"
                      />
                    </marker>
                  </defs>
                )}
              </g>
            );
          }
          return null;
        })}
        {positions.map((pos, idx) => (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={`vertex-${idx}`}
          >
            <circle
              cx={pos.x}
              cy={pos.y}
              r={25}
              fill={getVertexColor(idx)}
              stroke="rgb(255, 255, 255)"
              strokeWidth="2"
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
              fontWeight="bold"
              fill="white"
            >
              {idx}
            </text>
          </motion.g>
        ))}
      </svg>
      <div className="flex gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Unvisited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Visited</span>
        </div>
      </div>
      {step.explanation && (
        <div className="w-full p-3 bg-muted/30 rounded-lg text-sm text-foreground/90">
          {step.explanation}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 w-full text-xs">
        <div className="p-2 bg-muted/20 rounded">
          <p className="text-muted-foreground">Visited</p>
          <p className="font-semibold text-lg">{visited.length}</p>
        </div>
        <div className="p-2 bg-muted/20 rounded">
          <p className="text-muted-foreground">Operations</p>
          <p className="font-semibold text-lg">{step.operations.comparisons}</p>
        </div>
      </div>
    </div>
  );
}
