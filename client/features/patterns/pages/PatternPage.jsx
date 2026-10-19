import { useCallback, useEffect, useMemo } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  LuArrowLeft as ArrowLeft,
  LuArrowRight as ArrowRight,
  LuChartColumn as Chart,
  LuListChecks as ListChecks,
  LuCode as Code,
  LuTarget as Target,
} from "react-icons/lu";
import { PATTERNS, PATTERN_GROUPS, PATTERN_LIST } from "@shared/patterns";
import { PROBLEMS } from "@shared/problems";
import { PseudocodePanel } from "@/features/common/components/playback/PseudocodePanel";
import { ProblemWorkbench } from "../components/ProblemWorkbench";
import { buildProblemParams, readProblemInput } from "../utils/problemInput";

function InfoCard({ icon: Icon, title, children }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function PatternPage() {
  const { patternId } = useParams();
  const pattern = PATTERNS[patternId];
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get("problem");
  const problemId = pattern?.problems.includes(requested)
    ? requested
    : pattern?.problems[0];
  const problem = problemId && PROBLEMS[problemId];
  const search = searchParams.toString();
  const input = useMemo(
    () => problemId && readProblemInput(problemId, new URLSearchParams(search)),
    [problemId, search],
  );

  const showProblem = useCallback(
    (id, nextInput) =>
      setSearchParams(buildProblemParams(id, nextInput), { replace: true }),
    [setSearchParams],
  );

  // Keep the URL in a canonical form so every run can be shared and saved
  const canonical = problemId
    ? buildProblemParams(problemId, input).toString()
    : search;
  useEffect(() => {
    if (canonical !== search) setSearchParams(canonical, { replace: true });
  }, [canonical, search, setSearchParams]);

  if (!pattern) return <Navigate to="/patterns" replace />;

  const index = PATTERN_LIST.indexOf(pattern);
  const previous = PATTERN_LIST[index - 1];
  const next = PATTERN_LIST[index + 1];
  const groupIndex = PATTERN_GROUPS.findIndex((g) => g.id === pattern.group);

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 sm:py-8">
      <header className="space-y-3">
        <Link
          to="/patterns"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Patterns roadmap
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
            Step {groupIndex + 1} · {PATTERN_GROUPS[groupIndex].name}
          </span>
          <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-muted-foreground">
            {pattern.complexity}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {pattern.name}
        </h1>
        <p className="max-w-3xl text-muted-foreground">{pattern.summary}</p>
      </header>

      {problem && (
        <section
          aria-label="Interactive problem"
          className="space-y-4 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-6"
        >
          {pattern.problems.length > 1 && (
            <div
              className="flex flex-wrap gap-1 rounded-lg bg-muted/60 p-1"
              role="tablist"
              aria-label="Problems"
            >
              {pattern.problems.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={id === problemId}
                  onClick={() => showProblem(id, PROBLEMS[id].examples[0])}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    id === problemId
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {PROBLEMS[id].title}
                </button>
              ))}
            </div>
          )}
          <ProblemWorkbench
            problem={problem}
            input={input}
            onRun={(nextInput) => showProblem(problemId, nextInput)}
            link={`/patterns/${pattern.id}?${canonical}`}
          />
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
        <InfoCard icon={Target} title="When to use it">
          <ul className="space-y-2 text-sm">
            {pattern.signals.map((signal) => (
              <li key={signal} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {signal}
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard icon={Code} title="Template">
          <PseudocodePanel code={pattern.template} activeLine={null} />
        </InfoCard>
        <InfoCard icon={ListChecks} title="Practice on LeetCode">
          <ul className="space-y-1.5 text-sm">
            {pattern.practice.map((item) => (
              <li key={item} className="font-mono text-xs sm:text-sm">
                {item}
              </li>
            ))}
          </ul>
          {pattern.visualizers.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                See it animated
              </p>
              <div className="flex flex-wrap gap-2">
                {pattern.visualizers.map((visualizer) => (
                  <Link
                    key={visualizer.to}
                    to={visualizer.to}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Chart className="h-3.5 w-3.5" />
                    {visualizer.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {!problem && (
            <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              An interactive problem for this pattern is coming soon.
            </p>
          )}
        </InfoCard>
      </div>

      <nav
        className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between"
        aria-label="Pattern navigation"
      >
        {previous ? (
          <Link
            to={`/patterns/${previous.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {previous.name}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`/patterns/${next.id}`}
            className="flex items-center gap-2 text-sm font-medium text-primary sm:justify-end"
          >
            Next: {next.name} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </div>
  );
}
