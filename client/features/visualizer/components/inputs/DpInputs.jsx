import { Label } from "@/features/common/components/ui/label";
import { Slider } from "@/features/common/components/ui/slider";
import { FIBONACCI_LIMITS } from "../../utils/inputs";

/** Input of the dynamic programming algorithm (Fibonacci): n. */
export function DpInputs({ n, onNChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">n</Label>
        <span className="text-sm font-semibold tabular-nums">{n}</span>
      </div>
      <Slider
        aria-label="n"
        min={FIBONACCI_LIMITS.minN}
        max={FIBONACCI_LIMITS.maxN}
        step={1}
        value={[n]}
        onValueChange={([next]) => onNChange(next)}
      />
      <p className="text-xs text-muted-foreground">
        Computes fib(0) to fib(n), one table cell per step.
      </p>
    </div>
  );
}
