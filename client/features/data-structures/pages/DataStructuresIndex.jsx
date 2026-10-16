import { Link } from "react-router-dom";
import { LuArrowRight as ArrowRight } from "react-icons/lu";
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { DIFFICULTIES } from "@shared/algorithms";

const PREVIEWS = {
  stack: "[ 12 | 5 | 31 ] ← top",
  queue: "front → 8 · 21 · 4 → rear",
  heap: "3 → (9, 5) → (14, 11, 7)",
  "linked-list": "7 → 13 → 2 → null",
  bst: "50 → (30, 70)",
  "hash-table": "[1] → 15 → 22 · [4] → 4",
  trie: "c → a → r ✓ → (d ✓, e ✓)",
  "union-find": "{0, 1, 2} {3, 4} {5, 6} {7}",
};

export default function DataStructuresIndex() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:py-12">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Data structures
        </h1>
        <p className="text-muted-foreground">
          Push, pop, insert and delete yourself, and watch each operation run
          step by step with its pseudocode.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(DATA_STRUCTURES).map((structure) => (
          <Link
            key={structure.id}
            to={`/data-structures/${structure.id}`}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{structure.name}</h2>
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {DIFFICULTIES[structure.difficulty]}
              </span>
            </div>
            <p className="mb-4 flex-1 text-sm text-muted-foreground">
              {structure.description}
            </p>
            <p className="mb-4 rounded-md bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
              {PREVIEWS[structure.id]}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {Object.values(structure.operations)
                  .map((operation) => operation.label)
                  .join(" · ")}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
