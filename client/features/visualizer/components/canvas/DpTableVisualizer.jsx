const LEGEND = [
  { label: "Computing", className: "bg-primary" },
  { label: "Reads from", className: "bg-amber-300 dark:bg-amber-700" },
  { label: "Answer path", className: "bg-emerald-300 dark:bg-emerald-700" },
  { label: "Not computed yet", className: "bg-muted" },
];

const key = ([row, col]) => `${row}:${col}`;

/** The dynamic programming table, with the cell being filled and its inputs highlighted. */
export function DpTableVisualizer({ step }) {
  if (!step?.table) return null;
  const { table, headers, current } = step;
  const reads = new Set(step.reads.map(key));
  const path = new Set(step.path.map(key));
  const isCurrent = (row, col) =>
    current && current[0] === row && current[1] === col;

  const cellClass = (row, col, value) => {
    if (isCurrent(row, col))
      return "bg-primary font-bold text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background";
    if (reads.has(`${row}:${col}`))
      return "bg-amber-300 text-amber-950 dark:bg-amber-700 dark:text-amber-50";
    if (path.has(`${row}:${col}`))
      return "bg-emerald-300 font-semibold text-emerald-950 dark:bg-emerald-700 dark:text-emerald-50";
    if (value === null) return "bg-muted/60";
    return "bg-card";
  };
  const headerClass = (active) =>
    active
      ? "bg-primary/15 font-bold text-primary"
      : "bg-muted/40 text-muted-foreground";

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
      <div className="overflow-x-auto pb-1">
        <table className="mx-auto border-separate border-spacing-1 font-mono text-xs sm:text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-1 text-left align-bottom text-[10px] font-normal leading-tight text-muted-foreground"
              >
                {headers.colTitle && <div>{headers.colTitle} →</div>}
                {headers.rowTitle && <div>{headers.rowTitle} ↓</div>}
              </th>
              {headers.cols.map((label, col) => (
                <th
                  key={col}
                  scope="col"
                  className={`h-8 min-w-8 rounded-md px-1 transition-colors sm:min-w-9 ${headerClass(current?.[1] === col)}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th
                  scope="row"
                  className={`h-8 whitespace-nowrap rounded-md px-2 text-left transition-colors sm:h-9 ${headerClass(current?.[0] === rowIndex)}`}
                >
                  {headers.rows[rowIndex]}
                </th>
                {row.map((value, col) => (
                  <td
                    key={col}
                    className={`h-8 min-w-8 rounded-md border border-border text-center tabular-nums transition-colors duration-200 sm:h-9 sm:min-w-9 ${cellClass(rowIndex, col, value)}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
