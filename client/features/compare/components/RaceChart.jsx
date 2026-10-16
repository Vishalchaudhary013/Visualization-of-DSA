import { useMemo, useState } from "react";
import { ALGORITHMS } from "@shared/algorithms";
import { runAlgorithm } from "@/features/visualizer/algorithms";

const METRICS = [
  { key: "comparisons", label: "Comparisons" },
  { key: "swaps", label: "Swaps" },
  { key: "writes", label: "Writes" },
  { key: "steps", label: "Animation steps" },
];

/** Final operation counts for one algorithm on the given input. */
export function measure(id, input) {
  const steps = runAlgorithm(id, input);
  const totals = steps.at(-1)?.operations ?? {};
  return { id, steps: steps.length, ...totals };
}

/**
 * Single-series horizontal bar chart: every algorithm of one kind run on the
 * same input, sorted by the chosen metric (fewest first). One hue, values
 * labelled on the bars, full numbers on hover and in the table below.
 */
export function RaceChart({ ids, input, picked }) {
  const [metric, setMetric] = useState("comparisons");
  const [hovered, setHovered] = useState(null);
  const results = useMemo(
    () => ids.map((id) => measure(id, input)),
    [ids, input],
  );
  const sorted = [...results].sort(
    (x, y) => x[metric] - y[metric] || x.steps - y.steps,
  );
  const max = Math.max(1, ...results.map((result) => result[metric]));
  const n = input.array.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Same {n} values for every algorithm. Fewer is better.
        </p>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Metric">
          {METRICS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              aria-pressed={metric === key}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                metric === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ol
        className="space-y-2"
        aria-label={`${METRICS.find((m) => m.key === metric).label} by algorithm`}
      >
        {sorted.map((result) => {
          const value = result[metric];
          const tag = picked.indexOf(result.id);
          return (
            <li
              key={result.id}
              className="relative grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[11rem_minmax(0,1fr)]"
              onPointerEnter={() => setHovered(result.id)}
              onPointerLeave={() => setHovered(null)}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-sm">
                {tag !== -1 && (
                  <span className="rounded border border-border px-1 font-mono text-[10px] font-semibold text-foreground">
                    {tag === 0 ? "A" : "B"}
                  </span>
                )}
                <span className="truncate">{ALGORITHMS[result.id].name}</span>
              </span>
              {/* Hit area is the full row, larger than the bar itself */}
              <div className="flex h-7 items-center gap-2">
                <div
                  className={`h-4 rounded-r bg-primary transition-[width,opacity] duration-300 ${
                    hovered && hovered !== result.id ? "opacity-50" : ""
                  }`}
                  style={{
                    width: `${Math.max((value / max) * 85, value ? 1.5 : 0)}%`,
                  }}
                />
                <span className="shrink-0 font-mono text-xs tabular-nums text-foreground">
                  {value.toLocaleString()}
                </span>
              </div>
              {hovered === result.id && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-[9rem] top-full z-10 mt-1 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md sm:left-[11rem]"
                >
                  <p className="mb-1 font-semibold">
                    {ALGORITHMS[result.id].name}
                  </p>
                  {METRICS.map(({ key, label }) => (
                    <p key={key} className="flex justify-between gap-6">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono tabular-nums">
                        {result[key].toLocaleString()}
                      </span>
                    </p>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <details className="rounded-lg border border-border text-sm">
        <summary className="cursor-pointer px-3 py-2 text-muted-foreground">
          Show as table
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Algorithm</th>
                {METRICS.map(({ key, label }) => (
                  <th key={key} className="px-3 py-2 text-right font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((result) => (
                <tr key={result.id} className="border-t border-border">
                  <td className="px-3 py-2">{ALGORITHMS[result.id].name}</td>
                  {METRICS.map(({ key }) => (
                    <td
                      key={key}
                      className="px-3 py-2 text-right font-mono tabular-nums"
                    >
                      {result[key].toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {n > 1 && (
        <p className="text-xs text-muted-foreground">
          For reference with n = {n}: n² = {(n * n).toLocaleString()}, n log₂ n
          ≈ {Math.round(n * Math.log2(n)).toLocaleString()}, log₂ n ≈{" "}
          {Math.ceil(Math.log2(n))}.
        </p>
      )}
    </div>
  );
}
