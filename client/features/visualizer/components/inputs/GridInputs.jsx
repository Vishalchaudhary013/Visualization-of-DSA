import {
  LuBrickWall as Wall,
  LuEraser as Eraser,
  LuGrid3X3 as Maze,
  LuShuffle as Shuffle,
  LuTrash2 as Trash,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Label } from "@/features/common/components/ui/label";
import { generateMaze, normalizeGrid, randomGrid } from "../../utils/grid";

const TOOLS = [
  { key: "wall", label: "Wall", icon: Wall },
  { key: "erase", label: "Erase", icon: Eraser },
];

export function GridInputs({ grid, onGridChange, tool, onToolChange }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Draw on the grid</Label>
        <div
          className="grid grid-cols-2 gap-1 rounded-lg bg-muted/50 p-1"
          role="group"
          aria-label="Drawing tool"
        >
          {TOOLS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={tool === key}
              onClick={() => onToolChange(key)}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                tool === key
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Drag across cells to draw walls. Drag the{" "}
          <span className="font-semibold text-emerald-600">S</span> or{" "}
          <span className="font-semibold text-rose-500">G</span> cell to move
          the start or goal.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGridChange(generateMaze())}
        >
          <Maze /> Maze
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGridChange(randomGrid(grid))}
        >
          <Shuffle /> Random
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="col-span-2"
          onClick={() => onGridChange(normalizeGrid({ ...grid, walls: [] }))}
        >
          <Trash /> Clear walls
        </Button>
      </div>
    </div>
  );
}
