import { PROBLEMS } from "@shared/problems";

// How each kind of saved run is labelled and coloured
export const KIND_INFO = {
  algorithm: {
    label: "Algorithm",
    plural: "Algorithms",
    badge: "bg-primary/10 text-primary",
    bar: "bg-primary",
  },
  "data-structure": {
    label: "Data structure",
    plural: "Data structures",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  problem: {
    label: "Problem",
    plural: "Problems",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
  },
};

/** Page where a topic (algorithm, data structure or problem) can be tried. */
export function topicLink({ kind, itemId }) {
  if (kind === "algorithm") return `/visualizer?algo=${itemId}`;
  if (kind === "problem")
    return `/patterns/${PROBLEMS[itemId]?.pattern ?? ""}?problem=${itemId}`;
  return `/data-structures/${itemId}`;
}
