import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { bubbleSort } from "@/features/visualizer/algorithms/sorting";

const SAMPLE = [38, 12, 64, 25, 81, 47, 9, 56, 30, 72];
const INTERVAL = 450;

const barColor = (index, step) => {
  if (step.sorted.includes(index)) return "bg-emerald-500";
  if (step.swaps.includes(index)) return "bg-rose-500";
  if (step.comparisons.includes(index)) return "bg-amber-400";
  return "bg-sky-500";
};

/** Looping, decorative bubble sort shown on the home page. */
export function HeroPreview() {
  const steps = useMemo(() => bubbleSort(SAMPLE), []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(steps.length - 1);
      return undefined;
    }
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % (steps.length + 4)),
      INTERVAL,
    );
    return () => clearInterval(timer);
  }, [steps]);

  // Hold on the sorted result for a few ticks before looping
  const step = steps[Math.min(index, steps.length - 1)];
  const max = Math.max(...SAMPLE);

  return (
    <div
      className="rounded-2xl border border-border bg-card/80 p-5 shadow-xl backdrop-blur"
      aria-hidden="true"
    >
      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Bubble Sort</span>
        <span className="font-mono">
          comparisons {step.operations.comparisons} · swaps{" "}
          {step.operations.swaps}
        </span>
      </div>
      <div className="flex h-48 items-end gap-1.5">
        {step.state.map((value, i) => (
          <motion.div
            key={value}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className={`flex-1 rounded-t-md transition-colors ${barColor(i, step)}`}
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>
      <p className="mt-4 h-5 truncate text-sm text-muted-foreground">
        {step.explanation}
      </p>
    </div>
  );
}
