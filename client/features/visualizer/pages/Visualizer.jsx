import { useMemo } from "react";
import { toast } from "sonner";
import { LuShare2 as Share } from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/features/common/components/ui/tabs";
import {
  ALGORITHMS,
  ALGORITHM_CATEGORIES,
  DIFFICULTIES,
} from "@shared/algorithms";
import {
  ALGORITHM_KINDS,
  ALGORITHM_RUNNERS,
  runAlgorithm,
} from "../algorithms";
import { AlgorithmPicker } from "../components/inputs/AlgorithmPicker";
import { ArrayInputs } from "../components/inputs/ArrayInputs";
import { GraphInputs } from "../components/inputs/GraphInputs";
import { PlaybackControls } from "../components/controls/PlaybackControls";
import { ArrayVisualizer } from "../components/canvas/ArrayVisualizer";
import { GraphVisualizer } from "../components/canvas/GraphVisualizer";
import { PseudocodePanel } from "../components/panels/PseudocodePanel";
import { OperationStats } from "../components/panels/OperationStats";
import { StepLog } from "../components/panels/StepLog";
import { StepMathDetails } from "../components/panels/StepMathDetails";
import { AlgorithmMathSummary } from "../components/panels/AlgorithmMathSummary";
import { AlgorithmInfoPanel } from "../components/panels/AlgorithmInfoPanel";
import { usePlayback, SPEED_PRESETS } from "../hooks/usePlayback";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useVisualizerState } from "../hooks/useVisualizerState";

const DIFFICULTY_BADGE = {
  beginner: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  advanced: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

function Panel({ title, aside, children, className }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5 ${className ?? ""}`}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h2>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export default function Visualizer() {
  const visualizer = useVisualizerState();
  const { algorithm: algorithmId, kind, array, target, graph } = visualizer;
  const algorithm = ALGORITHMS[algorithmId];
  const runner = ALGORITHM_RUNNERS[algorithmId];
  const isGraph = kind === ALGORITHM_KINDS.GRAPH;
  const isSearch = kind === ALGORITHM_KINDS.SEARCH;
  const isSort = kind === ALGORITHM_KINDS.SORT;

  const steps = useMemo(
    () => runAlgorithm(algorithmId, { array, target, graph }),
    [algorithmId, array, target, graph],
  );
  const playback = usePlayback(steps);
  const { step } = playback;

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

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", {
        description:
          "Anyone with the link sees this exact algorithm and input.",
      });
    } catch {
      toast.error("Couldn't copy the link", {
        description: window.location.href,
      });
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
              {ALGORITHM_CATEGORIES[algorithm.category]}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-medium ${DIFFICULTY_BADGE[algorithm.difficulty]}`}
            >
              {DIFFICULTIES[algorithm.difficulty]}
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-muted-foreground">
              avg {algorithm.complexity.time.average} · space{" "}
              {algorithm.complexity.space}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {algorithm.name}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {algorithm.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={shareLink}
          className="self-start md:self-auto"
        >
          <Share />
          Share this setup
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_380px]">
        <aside className="space-y-6">
          <Panel title="Input">
            <div className="space-y-5">
              <AlgorithmPicker
                value={algorithmId}
                onChange={visualizer.setAlgorithm}
              />
              {isGraph ? (
                <GraphInputs
                  graph={graph}
                  onGraphChange={visualizer.setGraph}
                />
              ) : (
                <ArrayInputs
                  array={array}
                  onArrayChange={visualizer.setArray}
                  isSearch={isSearch}
                  needsSortedInput={runner.needsSortedInput}
                  target={target}
                  onTargetChange={visualizer.setTarget}
                />
              )}
            </div>
          </Panel>
          <div className="lg:sticky lg:top-20">
            <PlaybackControls playback={playback} />
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <Panel>
            {isGraph ? (
              <GraphVisualizer
                step={step}
                vertices={graph.vertices}
                edges={graph.edges}
                directed={graph.directed}
                frontierLabel={runner.frontierLabel}
              />
            ) : (
              <ArrayVisualizer
                step={step}
                speed={playback.speed}
                markerLabel={runner.markerLabel}
                isSearch={isSearch}
              />
            )}

            {step && (
              <div className="mt-5 space-y-4">
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
                <OperationStats
                  operations={step.operations}
                  size={isGraph ? graph.vertices : array.length}
                  isGraph={isGraph}
                />
              </div>
            )}
          </Panel>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-1">
            <Panel
              title="Pseudocode"
              aside={
                step?.line != null && (
                  <span className="font-mono text-xs text-primary">
                    line {step.line + 1}
                  </span>
                )
              }
            >
              <PseudocodePanel
                code={algorithm.pseudoCode}
                activeLine={step?.line}
              />
            </Panel>
            <Panel title={`About ${algorithm.name}`} className="2xl:hidden">
              <AlgorithmInfoPanel algorithm={algorithm} />
            </Panel>
          </div>
        </main>

        <aside className="min-w-0 space-y-6 lg:col-span-2 2xl:col-span-1">
          <Panel>
            <Tabs defaultValue="log">
              <TabsList className="grid! w-full grid-cols-3">
                <TabsTrigger value="log">Step log</TabsTrigger>
                <TabsTrigger value="math">Math</TabsTrigger>
                <TabsTrigger value="walkthrough">Walkthrough</TabsTrigger>
              </TabsList>
              <TabsContent value="log" className="pt-2">
                <StepLog
                  steps={playback.steps}
                  currentStep={playback.currentStep}
                  onSelect={playback.goToStep}
                />
              </TabsContent>
              <TabsContent value="math" className="pt-2">
                <StepMathDetails
                  step={step}
                  isSorting={isSort}
                  isSearching={isSearch}
                  isGraph={isGraph}
                  searchTarget={isSearch ? target : undefined}
                  graphInfo={isGraph ? graph : undefined}
                />
              </TabsContent>
              <TabsContent value="walkthrough" className="pt-2">
                <AlgorithmMathSummary
                  steps={playback.steps}
                  isSorting={isSort}
                  isSearching={isSearch}
                  isGraph={isGraph}
                  searchTarget={isSearch ? target : undefined}
                  algorithmId={algorithmId}
                  initialArray={array}
                />
              </TabsContent>
            </Tabs>
          </Panel>
          <Panel title={`About ${algorithm.name}`} className="hidden 2xl:block">
            <AlgorithmInfoPanel algorithm={algorithm} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}
