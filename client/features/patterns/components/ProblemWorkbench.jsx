import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LuCircleCheck as CircleCheck } from "react-icons/lu";
import { PROBLEM_DIFFICULTIES } from "@shared/problems";
import { PlaybackControls } from "@/features/common/components/playback/PlaybackControls";
import { StepLog } from "@/features/common/components/playback/StepLog";
import {
  usePlayback,
  SPEED_PRESETS,
} from "@/features/common/hooks/usePlayback";
import { useKeyboardShortcuts } from "@/features/common/hooks/useKeyboardShortcuts";
import { useHistorySync } from "@/features/history/hooks/useHistorySync";
import { SaveStatus } from "@/features/history/components/SaveStatus";
import { GraphVisualizer } from "@/features/visualizer/components/canvas/GraphVisualizer";
import { DpTableVisualizer } from "@/features/visualizer/components/canvas/DpTableVisualizer";
import { graphOf } from "../problems/graphs";
import { solveProblem } from "../utils/problemInput";
import { ArrayProblemView, MapPanel } from "./ArrayProblemView";
import { ProblemInputs } from "./ProblemInputs";
import { SolutionPanel } from "./SolutionPanel";

const DIFFICULTY_BADGE = {
  easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  hard: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const GRAPH_LABELS = {
  "network-delay-time": {
    frontierLabel: "Min-heap (node:time)",
    orderLabel: "Finalized",
    treeLabel: "Fastest route",
  },
  "course-schedule-ii": {
    frontierLabel: "Queue (no prerequisites left)",
    orderLabel: "Course order",
    treeLabel: "Prerequisite done",
  },
};

function Panel({ title, aside, children, className }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5 ${className ?? ""}`}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h3>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

function VariablesPanel({ vars }) {
  const entries = Object.entries(vars ?? {});
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Variables">
      {entries.map(([name, value]) => (
        <span
          key={name}
          className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs"
        >
          <span className="text-muted-foreground">{name} = </span>
          <span className="font-semibold">{String(value)}</span>
        </span>
      ))}
    </div>
  );
}

function ProblemCanvas({ problem, input, step }) {
  if (problem.view === "graph") {
    const graph = graphOf(problem.id, input);
    return (
      <GraphVisualizer
        step={step}
        vertices={graph.vertices}
        edges={graph.edges}
        directed={graph.directed}
        weighted={graph.weighted}
        vertexLabel={graph.vertexLabel}
        {...GRAPH_LABELS[problem.id]}
      />
    );
  }
  if (problem.view === "table") return <DpTableVisualizer step={step} />;
  return <ArrayProblemView step={step} bars={problem.bars} />;
}

/** A LeetCode-style problem: the user's input, the animation and the solution code. */
export function ProblemWorkbench({ problem, input, onRun, link }) {
  const steps = useMemo(
    () => solveProblem(problem.id, input),
    [problem.id, input],
  );
  const playback = usePlayback(steps);
  const { step, setSpeed } = playback;
  const lastStep = steps.at(-1);
  const finished = playback.currentStep === steps.length - 1;

  // DP tables fill one cell per step: start them faster
  useEffect(() => {
    setSpeed(problem.view === "table" ? 2 : 1);
  }, [problem.view, setSpeed]);

  const shortcuts = useMemo(() => {
    const shiftSpeed = (direction) => {
      const index = SPEED_PRESETS.indexOf(playback.speed) + direction;
      if (index >= 0 && index < SPEED_PRESETS.length)
        playback.setSpeed(SPEED_PRESETS[index]);
    };
    return {
      togglePlay: playback.togglePlay,
      nextStep: playback.nextStep,
      previousStep: playback.previousStep,
      reset: playback.reset,
      goToEnd: playback.goToEnd,
      faster: () => shiftSpeed(1),
      slower: () => shiftSpeed(-1),
    };
  }, [playback]);
  useKeyboardShortcuts(shortcuts);

  // Save the run (problem + the user's input) once they start playing it
  const { search } = useLocation();
  const historyEntry = useMemo(
    () => ({
      kind: "problem",
      itemId: problem.id,
      title: problem.title,
      input,
      summary: {
        steps: steps.length,
        result: `Output: ${lastStep.output}. ${lastStep.explanation}`.slice(
          0,
          500,
        ),
      },
      link,
    }),
    [problem.id, problem.title, input, steps.length, lastStep, link],
  );
  const saveStatus = useHistorySync({
    key: search,
    entry: historyEntry,
    ready: playback.isPlaying || playback.currentStep > 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-0.5 font-medium ${DIFFICULTY_BADGE[problem.difficulty]}`}
            >
              {PROBLEM_DIFFICULTIES[problem.difficulty]}
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
              {problem.leetcode
                ? `LeetCode ${problem.leetcode}`
                : "Classic problem"}
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-muted-foreground">
              time {problem.complexity.time} · space {problem.complexity.space}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {problem.leetcode ? `${problem.leetcode}. ` : ""}
            {problem.title}
          </h2>
          <p className="max-w-3xl text-muted-foreground">{problem.statement}</p>
        </div>
        <SaveStatus status={saveStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Panel title="Input">
            <ProblemInputs problem={problem} input={input} onRun={onRun} />
          </Panel>
          <div className="lg:sticky lg:top-20">
            <PlaybackControls playback={playback} />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <Panel>
            <ProblemCanvas problem={problem} input={input} step={step} />
            {step && (
              <div className="mt-5 space-y-3">
                <div
                  className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
                  aria-live="polite"
                >
                  <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-semibold leading-5 text-primary-foreground">
                    {playback.currentStep + 1}/{playback.totalSteps}
                  </span>
                  <p className="text-sm font-medium leading-5">
                    {step.explanation}
                  </p>
                </div>
                <VariablesPanel vars={step.vars} />
                <MapPanel map={step.map} />
                <div
                  className={`flex items-center gap-2 rounded-lg border p-3 font-mono text-sm ${
                    finished
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-dashed border-border text-muted-foreground"
                  }`}
                >
                  {finished ? (
                    <>
                      <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        Output: <strong>{lastStep.output}</strong>
                      </span>
                    </>
                  ) : (
                    <span className="font-sans text-xs">
                      Output appears at the last step (press End to jump there).
                    </span>
                  )}
                </div>
              </div>
            )}
          </Panel>

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <SolutionPanel problem={problem} line={step?.line} />
            <Panel title="Step log">
              <StepLog
                steps={playback.steps}
                currentStep={playback.currentStep}
                onSelect={playback.goToStep}
              />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
