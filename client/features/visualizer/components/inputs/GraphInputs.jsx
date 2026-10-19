import { useEffect, useState } from "react";
import {
  LuShuffle as Shuffle,
  LuCircleAlert as CircleAlert,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Label } from "@/features/common/components/ui/label";
import { Slider } from "@/features/common/components/ui/slider";
import { Switch } from "@/features/common/components/ui/switch";
import { Textarea } from "@/features/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/common/components/ui/select";
import {
  GRAPH_LIMITS,
  formatEdges,
  generateGraphEdges,
  parseEdges,
} from "../../utils/inputs";

// 1 → 2 → 3 → 1 has total weight 4 - 6 + 1 = -1
const NEGATIVE_CYCLE_EXAMPLE = {
  vertices: 5,
  start: 0,
  edges: [
    [0, 1, 3],
    [1, 2, 4],
    [2, 3, -6],
    [3, 1, 1],
    [3, 4, 2],
  ],
};

const DIRECTED_NOTES = {
  undirected:
    "This algorithm works on undirected graphs, so edges count both ways.",
  directed:
    "Topological order only exists for directed graphs, so edges point from → to.",
};

export function GraphInputs({
  graph,
  onGraphChange,
  weighted = false,
  directedMode,
  needsStart = true,
  negativeWeights = false,
}) {
  const { vertices, edges, start } = graph;
  const directed =
    directedMode === "directed"
      ? true
      : directedMode === "undirected"
        ? false
        : graph.directed;
  const formatted = formatEdges(edges, { weighted });
  const [text, setText] = useState(formatted);
  const [error, setError] = useState(null);

  useEffect(() => {
    setText(formatted);
    setError(null);
  }, [formatted]);

  const update = (changes) => onGraphChange({ ...graph, ...changes });

  const applyText = () => {
    // Unchanged text must not re-parse: hidden weights would reset to 1
    if (text === formatted) return;
    const { edges: parsed, error: parseError } = parseEdges(text, vertices);
    if (parseError) {
      setError(parseError);
      return;
    }
    setError(null);
    update({ edges: parsed });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Vertices</Label>
          <span className="text-sm font-semibold tabular-nums">{vertices}</span>
        </div>
        <Slider
          aria-label="Number of vertices"
          min={GRAPH_LIMITS.minVertices}
          max={GRAPH_LIMITS.maxVertices}
          step={1}
          value={[vertices]}
          onValueChange={([count]) =>
            update({
              vertices: count,
              edges: generateGraphEdges(count, { negative: negativeWeights }),
              start: Math.min(start, count - 1),
            })
          }
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() =>
          update({
            edges: generateGraphEdges(vertices, { negative: negativeWeights }),
          })
        }
      >
        <Shuffle />
        New random graph
      </Button>
      {negativeWeights && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => update({ ...NEGATIVE_CYCLE_EXAMPLE })}
        >
          Example with a negative cycle
        </Button>
      )}

      {needsStart && (
        <div className="space-y-2">
          <Label htmlFor="start-vertex" className="text-sm">
            Start vertex
          </Label>
          <Select
            value={String(start)}
            onValueChange={(value) => update({ start: Number(value) })}
          >
            <SelectTrigger id="start-vertex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: vertices }, (_, index) => (
                <SelectItem key={index} value={String(index)}>
                  Vertex {index}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="directed" className="text-sm">
            Directed edges
          </Label>
          <Switch
            id="directed"
            checked={directed}
            disabled={Boolean(directedMode)}
            onCheckedChange={(checked) => update({ directed: checked })}
          />
        </div>
        {directedMode && (
          <p className="text-xs text-muted-foreground">
            {DIRECTED_NOTES[directedMode]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="graph-edges" className="text-sm">
          Edges (one per line)
        </Label>
        <Textarea
          id="graph-edges"
          placeholder={weighted ? "0-1:4\n1-2:7\n2-3:1" : "0-1\n1-2\n2-3"}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={applyText}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "graph-edges-error" : undefined}
          className={`h-28 font-mono text-xs! ${error ? "border-destructive!" : ""}`}
        />
        {error ? (
          <p
            id="graph-edges-error"
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <CircleAlert className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Write edges as{" "}
            <code className="font-mono">
              {weighted ? "from-to:weight" : "from-to"}
            </code>
            . Changes apply when you leave the box. Drag vertices on the canvas
            to rearrange them.
          </p>
        )}
      </div>
    </div>
  );
}
