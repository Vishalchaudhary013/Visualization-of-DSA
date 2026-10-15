const STATS = [
  { key: "comparisons", label: "Comparisons" },
  { key: "swaps", label: "Swaps" },
  { key: "reads", label: "Reads" },
  { key: "writes", label: "Writes" },
];

/** Running operation counters, with a reference value for n² / n log n. */
export function OperationStats({ operations, size, isGraph }) {
  const nSquared = size * size;
  const nLogN = Math.round(size * Math.log2(Math.max(size, 2)));
  const stats = isGraph
    ? [
        { key: "comparisons", label: "Edge checks" },
        { key: "writes", label: "Vertices visited" },
      ]
    : STATS;

  return (
    <div className="space-y-2">
      <div
        className={`grid gap-2 ${isGraph ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}
      >
        {stats.map(({ key, label }) => (
          <div key={key} className="rounded-lg bg-muted/40 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="font-mono text-xl font-bold tabular-nums text-primary">
              {operations[key]}
            </p>
          </div>
        ))}
      </div>
      {!isGraph && size > 1 && (
        <p className="text-xs text-muted-foreground">
          For n = {size}: n² = {nSquared}, n log₂ n ≈ {nLogN}, log₂ n ≈{" "}
          {Math.ceil(Math.log2(size))}. Compare with the comparison count.
        </p>
      )}
    </div>
  );
}
