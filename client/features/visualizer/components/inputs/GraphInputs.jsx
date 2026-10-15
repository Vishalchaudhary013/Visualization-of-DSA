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

export function GraphInputs({ graph, onGraphChange }) {
  const { vertices, edges, start, directed } = graph;
  const [text, setText] = useState(formatEdges(edges));
  const [error, setError] = useState(null);

  useEffect(() => {
    setText(formatEdges(edges));
    setError(null);
  }, [edges]);

  const update = (changes) => onGraphChange({ ...graph, ...changes });

  const applyText = () => {
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
              edges: generateGraphEdges(count),
              start: Math.min(start, count - 1),
            })
          }
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => update({ edges: generateGraphEdges(vertices) })}
      >
        <Shuffle />
        New random graph
      </Button>

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

      <div className="flex items-center justify-between">
        <Label htmlFor="directed" className="text-sm">
          Directed edges
        </Label>
        <Switch
          id="directed"
          checked={directed}
          onCheckedChange={(checked) => update({ directed: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="graph-edges" className="text-sm">
          Edges (one per line)
        </Label>
        <Textarea
          id="graph-edges"
          placeholder={"0-1\n1-2\n2-3"}
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
            Write edges as <code className="font-mono">from-to</code>. Changes
            apply when you leave the box. Drag vertices on the canvas to
            rearrange them.
          </p>
        )}
      </div>
    </div>
  );
}
