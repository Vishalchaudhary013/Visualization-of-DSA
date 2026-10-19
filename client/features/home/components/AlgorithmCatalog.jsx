import { useState } from "react";
import { Link } from "react-router-dom";
import { LuSearch as Search, LuArrowRight as ArrowRight } from "react-icons/lu";
import { Input } from "@/features/common/components/ui/input";
import {
  ALGORITHMS,
  ALGORITHM_CATEGORIES,
  DIFFICULTIES,
} from "@shared/algorithms";
import { DATA_STRUCTURES } from "@shared/dataStructures";

const DIFFICULTY_BADGE = {
  beginner: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  advanced: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const FILTERS = [
  ["all", "All"],
  ...Object.entries(ALGORITHM_CATEGORIES),
  ["data-structure", "Data Structures"],
];

// Algorithms open in the visualizer, data structures on their own page
const ITEMS = [
  ...Object.values(ALGORITHMS).map((algorithm) => ({
    ...algorithm,
    to: `/visualizer?algo=${algorithm.id}`,
    facts: `${algorithm.complexity.time.average} time · ${algorithm.complexity.space} space`,
  })),
  ...Object.values(DATA_STRUCTURES).map((structure) => ({
    ...structure,
    to: `/data-structures/${structure.id}`,
    facts: Object.values(structure.operations)
      .map((operation) => operation.label)
      .join(" · "),
  })),
];

/** Searchable, filterable grid of algorithms; each card opens the visualizer. */
export function AlgorithmCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const normalized = query.trim().toLowerCase();
  const algorithms = ITEMS.filter(
    (algorithm) =>
      (category === "all" || algorithm.category === category) &&
      (!normalized ||
        [algorithm.name, algorithm.description, ...algorithm.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized)),
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Algorithms & data structures</h2>
        <p className="text-muted-foreground">Pick one to see it in action.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filter by category"
        >
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              aria-pressed={category === key}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                category === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search…"
            aria-label="Search algorithms"
            className="pl-9!"
          />
        </div>
      </div>

      {algorithms.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          Nothing matches "{query}".
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {algorithms.map((algorithm) => (
            <Link
              key={algorithm.id}
              to={algorithm.to}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold">{algorithm.name}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_BADGE[algorithm.difficulty]}`}
                >
                  {DIFFICULTIES[algorithm.difficulty]}
                </span>
              </div>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">
                {algorithm.description}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">
                  {algorithm.facts}
                </span>
                <span className="flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Visualize <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
