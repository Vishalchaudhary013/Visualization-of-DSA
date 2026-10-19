import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
import { GridInputs } from "../components/inputs/GridInputs";
import { GridVisualizer } from "../components/canvas/GridVisualizer";
import { DpInputs } from "../components/inputs/DpInputs";
import { DpTableVisualizer } from "../components/canvas/DpTableVisualizer";
import { PlaybackControls } from "@/features/common/components/playback/PlaybackControls";
import { ArrayVisualizer } from "../components/canvas/ArrayVisualizer";
import { GraphVisualizer } from "../components/canvas/GraphVisualizer";
import { PseudocodePanel } from "@/features/common/components/playback/PseudocodePanel";
import { OperationStats } from "../components/panels/OperationStats";
import { StepLog } from "@/features/common/components/playback/StepLog";
import { StepMathDetails } from "../components/panels/StepMathDetails";
import { AlgorithmMathSummary } from "../components/panels/AlgorithmMathSummary";
import { AlgorithmInfoPanel } from "../components/panels/AlgorithmInfoPanel";
import {
  usePlayback,
  SPEED_PRESETS,
} from "@/features/common/hooks/usePlayback";
import { useKeyboardShortcuts } from "@/features/common/hooks/useKeyboardShortcuts";
import { useVisualizerState } from "../hooks/useVisualizerState";
import { useHistorySync } from "@/features/history/hooks/useHistorySync";
import { SaveStatus } from "@/features/history/components/SaveStatus";

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
  const {
    algorithm: algorithmId,
    kind,
    array,
    target,
    graph,
    grid,
    n,
  } = visualizer;
  const algorithm = ALGORITHMS[algorithmId];
  const runner = ALGORITHM_RUNNERS[algorithmId];
  const isGraph = kind === ALGORITHM_KINDS.GRAPH;
  const isSearch = kind === ALGORITHM_KINDS.SEARCH;
  const isSort = kind === ALGORITHM_KINDS.SORT;
  const isGrid = kind === ALGORITHM_KINDS.GRID;
  const isDp = kind === ALGORITHM_KINDS.DP;
  // The math panels are about arrays and graphs, not grids or DP tables
  const hasMath = !isGrid && !isDp;
  const [gridTool, setGridTool] = useState("wall");

  const steps = useMemo(
    () => runAlgorithm(algorithmId, { array, target, graph, grid, n }),
    [algorithmId, array, target, graph, grid, n],
  );
  const playback = usePlayback(steps);
  // Grid searches explore hundreds of cells and DP tables fill one cell per
  // step: start them at a faster speed
  const { setSpeed } = playback;
  useEffect(() => {
    setSpeed(isGrid ? 4 : isDp ? 2 : 1);
  }, [isGrid, isDp, setSpeed]);
  const { step } = playback;

  // Save the run (algorithm + the user's input) once they start playing it
  const { search } = useLocation();
  const lastStep = steps.at(-1);
  const historyEntry = useMemo(
    () =>
      lastStep && {
        kind: "algorithm",
        itemId: algorithmId,
        title: algorithm.name,
        input: isDp
          ? { n }
          : isGrid
            ? { grid }
            : isGraph
              ? { graph }
              : isSearch
                ? { array, target }
                : { array },
        summary: {
          steps: steps.length,
          comparisons: lastStep.operations.comparisons,
          swaps: lastStep.operations.swaps,
          result: lastStep.explanation.slice(0, 500),
        },
        link: `/visualizer${search}`,
      },
    [
      lastStep,
      steps.length,
      algorithmId,
      algorithm.name,
      isGraph,
      isGrid,
      isDp,
      isSearch,
      graph,
      grid,
      n,
      array,
      target,
      search,
    ],
  );
  const saveStatus = useHistorySync({
    key: search,
    entry: historyEntry,
    ready: playback.isPlaying || playback.currentStep > 0,
  });

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
        <div className="flex flex-col items-start gap-2 md:items-end">
          <Button variant="outline" onClick={shareLink}>
            <Share />
            Share this setup
          </Button>
          <SaveStatus status={saveStatus} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_380px]">
        <aside className="space-y-6">
          <Panel title="Input">
            <div className="space-y-5">
              <AlgorithmPicker
                value={algorithmId}
                onChange={visualizer.setAlgorithm}
              />
              {isDp ? (
                <DpInputs n={n} onNChange={visualizer.setN} />
              ) : isGrid ? (
                <GridInputs
                  grid={grid}
                  onGridChange={visualizer.setGrid}
                  tool={gridTool}
                  onToolChange={setGridTool}
                />
              ) : isGraph ? (
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
            {isDp ? (
              <DpTableVisualizer step={step} />
            ) : isGrid ? (
              <GridVisualizer
                step={step}
                grid={grid}
                onGridChange={visualizer.setGrid}
                tool={gridTool}
              />
            ) : isGraph ? (
              <GraphVisualizer
                step={step}
                vertices={graph.vertices}
                edges={graph.edges}
                directed={graph.directed}
                frontierLabel={runner.frontierLabel}
                orderLabel={runner.orderLabel}
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
                  isGrid={isGrid}
                  isDp={isDp}
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
              <TabsList
                className={`grid! w-full ${hasMath ? "grid-cols-3" : "grid-cols-1"}`}
              >
                <TabsTrigger value="log">Step log</TabsTrigger>
                {hasMath && <TabsTrigger value="math">Math</TabsTrigger>}
                {hasMath && (
                  <TabsTrigger value="walkthrough">Walkthrough</TabsTrigger>
                )}
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
