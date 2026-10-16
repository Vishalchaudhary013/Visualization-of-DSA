import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/features/common/components/ui/select";
import { Label } from "@/features/common/components/ui/label";
import {
  ALGORITHMS,
  ALGORITHM_CATEGORIES,
  DIFFICULTIES,
} from "@shared/algorithms";
import { ALGORITHM_RUNNERS } from "../../algorithms";

const DIFFICULTY_DOT = {
  beginner: "bg-emerald-500",
  intermediate: "bg-amber-500",
  advanced: "bg-rose-500",
};

// Only algorithms that have a step generator are listed
const GROUPS = Object.entries(ALGORITHM_CATEGORIES)
  .map(([category, label]) => ({
    label,
    algorithms: Object.values(ALGORITHMS).filter(
      (algorithm) =>
        algorithm.category === category && ALGORITHM_RUNNERS[algorithm.id],
    ),
  }))
  .filter((group) => group.algorithms.length);

export function AlgorithmPicker({
  value,
  onChange,
  id = "algorithm",
  label = "Algorithm",
  kinds,
}) {
  // Optionally limit the list to some kinds (e.g. only sort + search for compare)
  const groups = kinds
    ? GROUPS.map((group) => ({
        ...group,
        algorithms: group.algorithms.filter((algorithm) =>
          kinds.includes(ALGORITHM_RUNNERS[algorithm.id].kind),
        ),
      })).filter((group) => group.algorithms.length)
    : GROUPS;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                {group.label}
              </SelectLabel>
              {group.algorithms.map((algorithm) => (
                <SelectItem key={algorithm.id} value={algorithm.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${DIFFICULTY_DOT[algorithm.difficulty]}`}
                      title={DIFFICULTIES[algorithm.difficulty]}
                    />
                    {algorithm.name}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
