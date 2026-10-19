import { Link } from "react-router-dom";
import {
  LuPlay as Play,
  LuChartColumn as Chart,
  LuArrowRight as ArrowRight,
} from "react-icons/lu";
import { PATTERN_GROUPS, PATTERN_LIST } from "@shared/patterns";

const GROUPS = PATTERN_GROUPS.map((group) => ({
  ...group,
  patterns: PATTERN_LIST.filter((pattern) => pattern.group === group.id),
}));
const INTERACTIVE = PATTERN_LIST.filter((p) => p.problems.length).length;

export default function PatternsIndex() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-12">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Patterns roadmap
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {PATTERN_LIST.length} patterns behind most interview problems
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Learn the groups from top to bottom: each one builds on the ones
          before it. Open a pattern to see when to use it and a code template.{" "}
          {INTERACTIVE} patterns have a LeetCode-style problem you can run with
          your own input and watch step by step.
        </p>
        <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-primary" /> Interactive problem
          </li>
          <li className="flex items-center gap-1.5">
            <Chart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
            Related visualizer
          </li>
        </ul>
      </header>

      <ol className="relative space-y-6 border-l-2 border-dashed border-primary/30 pl-6 sm:pl-8">
        {GROUPS.map((group, index) => (
          <li key={group.id} className="relative">
            <span
              className="absolute -left-[2.35rem] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground ring-4 ring-background sm:-left-[2.85rem]"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <h2 className="mb-3 text-lg font-semibold leading-8">
              {group.name}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.patterns.map((pattern) => (
                <Link
                  key={pattern.id}
                  to={`/patterns/${pattern.id}`}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{pattern.name}</h3>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {pattern.problems.length > 0 && (
                        <Play
                          className="h-4 w-4 text-primary"
                          aria-label="Interactive problem"
                        />
                      )}
                      {pattern.visualizers.length > 0 && (
                        <Chart
                          className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                          aria-label="Related visualizer"
                        />
                      )}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {pattern.summary}
                  </p>
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
