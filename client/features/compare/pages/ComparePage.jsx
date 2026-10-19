import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  LuArrowLeftRight as SwapIcon,
  LuShare2 as Share,
  LuTrophy as Trophy,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { ALGORITHMS } from "@shared/algorithms";
import { PlaybackControls } from "@/features/common/components/playback/PlaybackControls";
import {
  usePlayback,
  SPEED_PRESETS,
} from "@/features/common/hooks/usePlayback";
import { useKeyboardShortcuts } from "@/features/common/hooks/useKeyboardShortcuts";
import {
  ALGORITHM_KINDS,
  ALGORITHM_RUNNERS,
  runAlgorithm,
} from "@/features/visualizer/algorithms";
import { AlgorithmPicker } from "@/features/visualizer/components/inputs/AlgorithmPicker";
import { ArrayInputs } from "@/features/visualizer/components/inputs/ArrayInputs";
import { ARRAY_PRESETS, parseArray } from "@/features/visualizer/utils/inputs";
import { CompareLane } from "../components/CompareLane";
import { RaceChart } from "../components/RaceChart";

const COMPARABLE = [ALGORITHM_KINDS.SORT, ALGORITHM_KINDS.SEARCH];
const isComparable = (id) =>
  Object.hasOwn(ALGORITHM_RUNNERS, id ?? "") &&
  COMPARABLE.includes(ALGORITHM_RUNNERS[id].kind);
const idsOfKind = (kind) =>
  Object.keys(ALGORITHM_RUNNERS).filter(
    (id) => ALGORITHM_RUNNERS[id].kind === kind,
  );

const SCORE_ROWS = [
  { key: "comparisons", label: "Comparisons" },
  { key: "swaps", label: "Swaps" },
  { key: "writes", label: "Writes" },
  { key: "steps", label: "Animation steps" },
];

function readInitialState(params) {
  const array =
    parseArray(params.get("arr") ?? "").values ??
    ARRAY_PRESETS.random.build(12);
  const target = Number(params.get("target"));
  return {
    a: isComparable(params.get("a")) ? params.get("a") : "bubble-sort",
    b: isComparable(params.get("b")) ? params.get("b") : "quick-sort",
    array,
    target:
      params.has("target") && Number.isInteger(target)
        ? target
        : array[Math.floor(array.length / 2)],
  };
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState(() => readInitialState(searchParams));
  const { a, b, array, target } = state;
  const update = (changes) =>
    setState((current) => ({ ...current, ...changes }));
  const hasSearch = [a, b].some(
    (id) => ALGORITHM_RUNNERS[id].kind === ALGORITHM_KINDS.SEARCH,
  );

  // Keep the setup in the URL so it can be shared
  useEffect(() => {
    const params = new URLSearchParams({ a, b, arr: array.join(",") });
    if (hasSearch) params.set("target", String(target));
    setSearchParams(params, { replace: true });
  }, [a, b, array, target, hasSearch, setSearchParams]);

  const input = useMemo(() => ({ array, target }), [array, target]);
  const stepsA = useMemo(() => runAlgorithm(a, input), [a, input]);
  const stepsB = useMemo(() => runAlgorithm(b, input), [b, input]);
  // One shared timeline as long as the slower algorithm
  const timeline = useMemo(
    () =>
      Array.from(
        { length: Math.max(stepsA.length, stepsB.length) },
        (_, i) => i,
      ),
    [stepsA.length, stepsB.length],
  );
  const playback = usePlayback(timeline);

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

  const totals = (steps) => ({
    ...steps.at(-1).operations,
    steps: steps.length,
  });
  const score = { A: totals(stepsA), B: totals(stepsB) };
  const raceKinds = [
    ...new Set([a, b].map((id) => ALGORITHM_RUNNERS[id].kind)),
  ];

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", {
        description: "It opens this exact comparison.",
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
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compare algorithms
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Run two algorithms on exactly the same input, side by side, and see
            which one does less work.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={shareLink}
          className="self-start md:self-auto"
        >
          <Share /> Share this comparison
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Setup
            </h2>
            <AlgorithmPicker
              id="algorithm-a"
              label="Algorithm A"
              value={a}
              onChange={(id) => update({ a: id })}
              kinds={COMPARABLE}
            />
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => update({ a: b, b: a })}
            >
              <SwapIcon /> Swap A and B
            </Button>
            <AlgorithmPicker
              id="algorithm-b"
              label="Algorithm B"
              value={b}
              onChange={(id) => update({ b: id })}
              kinds={COMPARABLE}
            />
            <div className="border-t border-border pt-5">
              <ArrayInputs
                array={array}
                onArrayChange={(next) => update({ array: next })}
                isSearch={hasSearch}
                needsSortedInput={[a, b].some(
                  (id) => ALGORITHM_RUNNERS[id].needsSortedInput,
                )}
                target={target}
                onTargetChange={(next) => update({ target: next })}
              />
            </div>
          </section>
          <div className="lg:sticky lg:top-20">
            <PlaybackControls playback={playback} />
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CompareLane
              tag="A"
              id={a}
              steps={stepsA}
              position={playback.currentStep}
              speed={playback.speed}
            />
            <CompareLane
              tag="B"
              id={b}
              steps={stepsB}
              position={playback.currentStep}
              speed={playback.speed}
            />
          </div>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Scoreboard
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Total</th>
                    <th className="px-3 py-2 text-right font-medium">
                      A · {ALGORITHMS[a].name}
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      B · {ALGORITHMS[b].name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SCORE_ROWS.map(({ key, label }) => {
                    const [valueA, valueB] = [score.A[key], score.B[key]];
                    const winner =
                      valueA === valueB ? null : valueA < valueB ? "A" : "B";
                    const cell = (tag, value) => (
                      <td className="px-3 py-2 text-right">
                        <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                          {winner === tag && (
                            <Trophy
                              className="h-3.5 w-3.5 text-amber-500"
                              aria-label="fewer"
                            />
                          )}
                          <span className={winner === tag ? "font-bold" : ""}>
                            {value.toLocaleString()}
                          </span>
                        </span>
                      </td>
                    );
                    return (
                      <tr key={key} className="border-t border-border">
                        <td className="break-normal py-2 pr-3 whitespace-nowrap text-muted-foreground">
                          {label}
                        </td>
                        {cell("A", valueA)}
                        {cell("B", valueB)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Average time: A is {ALGORITHMS[a].complexity.time.average}, B is{" "}
              {ALGORITHMS[b].complexity.time.average}. Try the "Sorted" and
              "Reversed" input shapes to see best and worst cases.
            </p>
          </section>

          {raceKinds.map((kind) => (
            <section
              key={kind}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {kind === ALGORITHM_KINDS.SORT
                  ? "Race all sorting algorithms"
                  : "Race all searching algorithms"}
              </h2>
              <RaceChart ids={idsOfKind(kind)} input={input} picked={[a, b]} />
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
