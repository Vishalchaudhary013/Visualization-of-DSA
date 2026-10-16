import { ALGORITHMS } from "@shared/algorithms";
import { ArrayVisualizer } from "@/features/visualizer/components/canvas/ArrayVisualizer";
import {
  ALGORITHM_KINDS,
  ALGORITHM_RUNNERS,
} from "@/features/visualizer/algorithms";

/** One side of the comparison: the algorithm's canvas at the shared timeline position. */
export function CompareLane({ tag, id, steps, position, speed }) {
  const runner = ALGORITHM_RUNNERS[id];
  const index = Math.min(position, steps.length - 1);
  const step = steps[index];
  const finished = position >= steps.length - 1;
  const { comparisons, swaps, writes } = step.operations;

  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-md border border-border px-1.5 font-mono text-xs">
            {tag}
          </span>
          {ALGORITHMS[id].name}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            finished
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {finished
            ? `Finished in ${steps.length} steps`
            : `Step ${index + 1} / ${steps.length}`}
        </span>
      </header>

      <ArrayVisualizer
        step={step}
        speed={speed}
        markerLabel={runner.markerLabel}
        isSearch={runner.kind === ALGORITHM_KINDS.SEARCH}
        defaultMode="bars"
      />

      <p
        className="min-h-10 rounded-lg bg-muted/40 p-3 text-sm"
        aria-live="polite"
      >
        {step.explanation}
      </p>

      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Comparisons", comparisons],
          ["Swaps", swaps],
          ["Writes", writes],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-muted/40 px-2 py-1.5">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {label}
            </dt>
            <dd className="font-mono text-lg font-bold tabular-nums text-primary">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
