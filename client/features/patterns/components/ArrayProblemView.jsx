const POINTER_COLORS = [
  "bg-sky-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-amber-500",
];
const LEGEND = [
  { label: "Looking at", className: "bg-amber-400" },
  { label: "Window / range", className: "bg-primary/20 border-primary/50" },
  { label: "Answer", className: "bg-emerald-500" },
  { label: "Ruled out", className: "bg-muted opacity-50" },
];

const showValue = (value) => (value === " " ? "␣" : value);

/**
 * An array (or string) with named pointers under the cells, a highlighted
 * window, extra rows (e.g. prefix sums) and, for Container With Most Water,
 * bars instead of boxes.
 */
export function ArrayProblemView({ step, bars = false }) {
  if (!step?.array) return null;
  const { array, window, pointers } = step;
  const active = new Set(step.active);
  const found = new Set(step.found);
  const dim = new Set(step.dim);
  const inWindow = (index) =>
    window && index >= window[0] && index <= window[1];
  const pointerNames = Object.keys(pointers);
  const colorOf = (name) =>
    POINTER_COLORS[pointerNames.indexOf(name) % POINTER_COLORS.length];
  const tallest = Math.max(1, ...array.map((value) => Number(value) || 0));

  const cellClass = (index) => {
    if (found.has(index)) return "border-emerald-600 bg-emerald-500 text-white";
    if (active.has(index))
      return "border-amber-500 bg-amber-400 text-amber-950";
    if (dim.has(index))
      return "border-border bg-muted text-muted-foreground opacity-50";
    if (inWindow(index)) return "border-primary/50 bg-primary/15";
    return "border-border bg-card";
  };

  const columns = {
    gridTemplateColumns: `auto repeat(${array.length}, minmax(1.75rem, 3rem))`,
  };

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span
              className={`h-3 w-3 rounded-sm border border-border ${item.className}`}
            />
            {item.label}
          </li>
        ))}
      </ul>
      {array.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center font-mono text-sm text-muted-foreground">
          (empty input)
        </p>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div
            className="grid justify-center-safe items-end gap-x-1 sm:gap-x-1.5 gap-y-1 font-mono"
            style={columns}
          >
            <span className="whitespace-nowrap pr-2 text-right text-[11px] text-muted-foreground">
              {bars ? "height" : "value"}
            </span>
            {array.map((value, index) =>
              bars ? (
                <div
                  key={index}
                  className="flex h-40 flex-col items-center justify-end gap-1"
                >
                  <span className="text-xs font-semibold">{value}</span>
                  <div
                    className={`w-full rounded-t-md border transition-all duration-300 ${cellClass(index)}`}
                    style={{
                      height: `${(Number(value) / tallest) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                </div>
              ) : (
                <div
                  key={index}
                  className={`flex h-11 items-center justify-center rounded-lg border-2 text-sm font-bold sm:text-base transition-all duration-300 sm:h-12 ${cellClass(index)}`}
                >
                  {showValue(value)}
                </div>
              ),
            )}

            <span className="whitespace-nowrap pr-2 text-right text-[11px] text-muted-foreground">
              index
            </span>
            {array.map((_, index) => (
              <span
                key={index}
                className="text-center text-[11px] text-muted-foreground"
              >
                {index}
              </span>
            ))}

            {step.rows.map((row) => [
              <span
                key={`${row.label}-label`}
                className="whitespace-nowrap pr-2 text-right text-[11px] text-muted-foreground"
              >
                {row.label}
              </span>,
              ...row.values.map((value, index) => (
                <span
                  key={`${row.label}-${index}`}
                  className={`flex h-8 items-center justify-center rounded-md border text-sm transition-colors ${
                    value === null
                      ? "border-dashed border-border text-transparent"
                      : active.has(index)
                        ? "border-amber-500 bg-amber-100 font-bold dark:bg-amber-900/50"
                        : "border-border bg-muted/40"
                  }`}
                >
                  {value ?? "·"}
                </span>
              )),
            ])}

            <span />
            {array.map((_, index) => (
              <div
                key={index}
                className="flex min-h-6 flex-col items-center gap-0.5"
              >
                {pointerNames
                  .filter((name) => pointers[name] === index)
                  .map((name) => (
                    <span
                      key={name}
                      className={`rounded px-1 text-[10px] font-bold leading-4 text-white ${colorOf(name)}`}
                    >
                      ↑{name}
                    </span>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Hash map / set contents, with the key just used highlighted. */
export function MapPanel({ map }) {
  if (!map) return null;
  const isSet = map.entries.every((entry) => entry.length === 1);
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="mb-2 font-mono text-xs font-medium text-muted-foreground">
        {map.title}
      </p>
      <div className="flex min-h-8 flex-wrap gap-1.5">
        {map.entries.length === 0 && (
          <span className="text-xs text-muted-foreground">empty</span>
        )}
        {map.entries.map(([key, value]) => (
          <span
            key={String(key)}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-sm transition-colors ${
              map.active !== undefined && String(map.active) === String(key)
                ? "border-amber-500 bg-amber-100 font-bold dark:bg-amber-900/50"
                : "border-border bg-card"
            }`}
          >
            {showValue(key)}
            {!isSet && (
              <>
                <span className="text-muted-foreground">→</span>
                {value}
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
