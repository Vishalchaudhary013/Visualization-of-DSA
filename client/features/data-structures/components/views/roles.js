// Colour roles shared by all data structure views (same palette as the visualizer)
export const ROLE_STYLES = {
  found: {
    bg: "bg-emerald-500",
    fill: "fill-emerald-500",
    legend: "Result / placed",
  },
  swap: {
    bg: "bg-rose-500",
    fill: "fill-rose-500",
    legend: "Moving / removing",
  },
  compare: { bg: "bg-amber-400", fill: "fill-amber-400", legend: "Comparing" },
  active: { bg: "bg-violet-500", fill: "fill-violet-500", legend: "Current" },
  idle: { bg: "bg-sky-500", fill: "fill-sky-500", legend: "Value" },
};

export function roleOf(id, highlight) {
  if (highlight.found.includes(id)) return "found";
  if (highlight.swap.includes(id)) return "swap";
  if (highlight.compare.includes(id)) return "compare";
  if (highlight.active.includes(id)) return "active";
  return "idle";
}
