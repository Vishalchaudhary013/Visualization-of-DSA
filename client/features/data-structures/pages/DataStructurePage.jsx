import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LuArrowLeft as ArrowLeft,
  LuShuffle as Shuffle,
  LuTrash2 as Trash,
  LuCircleAlert as CircleAlert,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Input } from "@/features/common/components/ui/input";
import { Label } from "@/features/common/components/ui/label";
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { DIFFICULTIES } from "@shared/algorithms";
import { PlaybackControls } from "@/features/common/components/playback/PlaybackControls";
import { PseudocodePanel } from "@/features/common/components/playback/PseudocodePanel";
import {
  usePlayback,
  SPEED_PRESETS,
} from "@/features/common/hooks/usePlayback";
import { useKeyboardShortcuts } from "@/features/common/hooks/useKeyboardShortcuts";
import { useHistorySync } from "@/features/history/hooks/useHistorySync";
import { SaveStatus } from "@/features/history/components/SaveStatus";
import { ENGINES } from "../engines";
import { step as makeStep } from "../engines/common";
import {
  StackView,
  QueueView,
  LinkedListView,
} from "../components/views/LinearViews";
import {
  HeapView,
  BstView,
  TrieView,
  UnionFindView,
} from "../components/views/TreeViews";
import { HashTableView } from "../components/views/HashTableView";
import {
  formatValue,
  parseOperationValue,
  parseValuesParam,
} from "../utils/values";
import { ROLE_STYLES } from "../components/views/roles";

const VIEWS = {
  stack: StackView,
  queue: QueueView,
  heap: HeapView,
  "linked-list": LinkedListView,
  bst: BstView,
  "hash-table": HashTableView,
  trie: TrieView,
  "union-find": UnionFindView,
};

const STARTER_VALUES = {
  stack: [12, 5, 31],
  queue: [8, 21, 4],
  heap: [3, 9, 5, 14, 11, 7],
  "linked-list": [7, 13, 2],
  bst: [50, 30, 70, 20, 40, 60, 80],
  "hash-table": [15, 22, 8, 29, 4, 36],
  trie: ["car", "card", "care", "cat", "dog"],
  // parent array: sets {0, 1, 2}, {3, 4}, {5, 6}, {7}
  "union-find": [0, 0, 0, 3, 3, 5, 5, 7],
};

const randomValues = (count) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1);

const Panel = ({ title, aside, children, className = "" }) => (
  <section
    className={`min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`}
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

export default function DataStructurePage() {
  const { id } = useParams();
  const meta = DATA_STRUCTURES[id];
  if (!meta) return <Navigate to="/data-structures" replace />;
  // Remount per structure so all state resets cleanly
  return <DataStructureWorkspace key={id} id={id} meta={meta} />;
}

function DataStructureWorkspace({ id, meta }) {
  const engine = ENGINES[id];
  const View = VIEWS[id];
  const isHeap = id === "heap";
  const isWords = meta.valueKind === "word";
  const hasPairs = Object.values(meta.operations).some((op) => op.arity === 2);
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  const [mode, setMode] = useState(() =>
    searchParams.get("mode") === "max" ? "max" : "min",
  );
  const [structure, setStructure] = useState(() =>
    engine.fromValues(
      parseValuesParam(searchParams.get("values"), meta.valueKind) ??
        STARTER_VALUES[id],
      { mode },
    ),
  );
  const [steps, setSteps] = useState([]);
  const [lastOperation, setLastOperation] = useState(null);
  const [log, setLog] = useState([]);
  const [valueText, setValueText] = useState("");
  const [inputError, setInputError] = useState(null);

  const values = engine.toValues(structure);
  const valuesParam = values.join(",");

  // Mirror the contents in the URL so the page can be shared or reopened from history
  useEffect(() => {
    const params = new URLSearchParams();
    if (valuesParam) params.set("values", valuesParam);
    if (isHeap) params.set("mode", mode);
    setSearchParams(params, { replace: true });
  }, [valuesParam, mode, isHeap, setSearchParams]);

  // Shown until the first operation runs
  const idleSteps = useMemo(() => {
    const count = engine.toValues(structure).length;
    return [
      makeStep(structure, {
        explanation: `${meta.name} with ${count} ${count === 1 ? "value" : "values"}. Pick an operation to see how it works.`,
      }),
    ];
  }, [engine, structure, meta.name]);
  const playback = usePlayback(steps.length ? steps : idleSteps, {
    autoPlay: true,
  });
  const current = playback.step;

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

  const runOperation = (name) => {
    const operation = meta.operations[name];
    let value;
    if (operation.needsValue) {
      const parsed = parseOperationValue(valueText, {
        valueKind: meta.valueKind,
        arity: operation.arity,
      });
      if (parsed.error) {
        setInputError(parsed.error);
        return;
      }
      value = parsed.value;
    }
    setInputError(null);
    const result = engine.operations[name](structure, value);
    setStructure(result.state);
    setSteps(result.steps);
    setLastOperation(name);
    const outcome = result.steps.at(-1);
    setLog((entries) =>
      [
        ...entries,
        {
          operation: name,
          value,
          output: outcome.output,
          error: outcome.error,
        },
      ].slice(-30),
    );
    if (operation.needsValue) setValueText("");
  };

  const replaceContents = (nextValues, explanation) => {
    const next = engine.fromValues(nextValues, { mode });
    setStructure(next);
    setSteps([makeStep(next, { explanation })]);
    setLastOperation(null);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    const next = engine.fromValues(values, { mode: nextMode });
    setStructure(next);
    setSteps([
      makeStep(next, {
        explanation: `Rebuilt as a ${nextMode}-heap: the ${nextMode === "min" ? "smallest" : "largest"} value is now on top`,
      }),
    ]);
    setLastOperation(null);
  };

  // Save this session (contents + operations) to the user's history once they act
  const historyEntry = useMemo(
    () => ({
      kind: "data-structure",
      itemId: id,
      title: meta.name,
      input: {
        values: engine.toValues(structure),
        ...(isHeap && { mode }),
        operations: log,
      },
      summary: {
        operations: log.length,
        result: (steps.at(-1)?.explanation ?? "").slice(0, 500),
      },
      link: `${pathname}?${new URLSearchParams({ ...(valuesParam && { values: valuesParam }), ...(isHeap && { mode }) })}`,
    }),
    [
      id,
      meta.name,
      engine,
      structure,
      isHeap,
      mode,
      log,
      steps,
      pathname,
      valuesParam,
    ],
  );
  const [sessionKey] = useState(() => `${id}-${Date.now()}`);
  const saveStatus = useHistorySync({
    key: sessionKey,
    entry: historyEntry,
    ready: log.length > 0,
    live: true,
  });

  const operationCode = lastOperation ? meta.operations[lastOperation] : null;

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Link
            to="/data-structures"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All data structures
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
              Data structure
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
              {DIFFICULTIES[meta.difficulty]}
            </span>
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {meta.name}
          </h1>
          <p className="max-w-2xl text-muted-foreground">{meta.description}</p>
        </div>
        <SaveStatus status={saveStatus} />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Panel title="Operations">
            <div className="space-y-4">
              {isHeap && (
                <div
                  className="grid grid-cols-2 gap-1 rounded-lg bg-muted/50 p-1"
                  role="group"
                  aria-label="Heap type"
                >
                  {["min", "max"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={mode === option}
                      onClick={() => mode !== option && switchMode(option)}
                      className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
                        mode === option
                          ? "bg-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option === "min" ? "Min-heap" : "Max-heap"}
                    </button>
                  ))}
                </div>
              )}

              {Object.values(meta.operations).some(
                (operation) => operation.needsValue,
              ) && (
                <div className="space-y-1.5">
                  <Label htmlFor="ds-value">{isWords ? "Word" : "Value"}</Label>
                  <Input
                    id="ds-value"
                    inputMode={isWords ? "text" : "numeric"}
                    autoCapitalize="none"
                    autoComplete="off"
                    placeholder={
                      isWords ? "e.g. cart" : hasPairs ? "e.g. 3 5" : "e.g. 42"
                    }
                    value={valueText}
                    onChange={(event) => {
                      setValueText(event.target.value);
                      setInputError(null);
                    }}
                    onKeyDown={(event) => {
                      const first = Object.entries(meta.operations).find(
                        ([, op]) => op.needsValue,
                      );
                      if (event.key === "Enter" && first)
                        runOperation(first[0]);
                    }}
                    aria-invalid={Boolean(inputError)}
                    aria-describedby={inputError ? "ds-value-error" : undefined}
                    className={`font-mono ${inputError ? "border-destructive!" : ""}`}
                  />
                  {inputError ? (
                    <p
                      id="ds-value-error"
                      className="flex items-center gap-1.5 text-xs text-destructive"
                    >
                      <CircleAlert className="h-3.5 w-3.5" />
                      {inputError}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {hasPairs &&
                        "Union and Connected? take two elements, e.g. 3 5. "}
                      Press Enter to{" "}
                      {Object.values(meta.operations)
                        .find((op) => op.needsValue)
                        .label.toLowerCase()}
                      .
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(meta.operations).map(([name, operation]) => (
                  <Button
                    key={name}
                    variant={operation.needsValue ? "default" : "secondary"}
                    onClick={() => runOperation(name)}
                    className="h-auto! flex-col items-start! gap-0! whitespace-normal px-3! py-2! text-left"
                  >
                    <span className="leading-tight">{operation.label}</span>
                    <span className="font-mono text-[10px] font-normal opacity-75">
                      {operation.complexity}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    replaceContents(
                      engine.randomValues?.() ??
                        randomValues(id === "bst" || isHeap ? 7 : 4),
                      "Filled with random values",
                    )
                  }
                >
                  <Shuffle /> Random
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => replaceContents([], "Cleared")}
                >
                  <Trash /> Clear
                </Button>
              </div>
            </div>
          </Panel>
          <div className="lg:sticky lg:top-20">
            <PlaybackControls playback={playback} />
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <Panel>
            <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {Object.values(ROLE_STYLES).map((style) => (
                <li key={style.legend} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-sm ${style.bg}`} />
                  {style.legend}
                </li>
              ))}
            </ul>
            {current && <View step={current} capacity={meta.capacity} />}
            {current && (
              <div
                aria-live="polite"
                className={`mt-5 flex gap-3 rounded-lg border p-3 ${
                  current.error
                    ? "border-destructive/40 bg-destructive/10"
                    : "border-primary/30 bg-primary/5"
                }`}
              >
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-semibold leading-5 ${
                    current.error
                      ? "bg-destructive text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {playback.currentStep + 1}/{playback.totalSteps}
                </span>
                <p className="text-sm font-medium leading-5">
                  {current.explanation}
                </p>
              </div>
            )}
            {current?.output && current.output.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Output:{" "}
                <span className="font-mono font-semibold text-foreground">
                  [{current.output.join(", ")}]
                </span>
              </p>
            )}
          </Panel>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Panel
              title={
                operationCode
                  ? `Pseudocode · ${operationCode.label}`
                  : "Pseudocode"
              }
              aside={
                current?.line != null && (
                  <span className="font-mono text-xs text-primary">
                    line {current.line + 1}
                  </span>
                )
              }
            >
              {operationCode ? (
                <PseudocodePanel
                  code={operationCode.pseudoCode}
                  activeLine={current?.line}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Run an operation to see its code highlighted step by step.
                </p>
              )}
            </Panel>

            <Panel title="Your operations">
              {log.length ? (
                <ol className="flex flex-wrap gap-1.5">
                  {log.map((entry, index) => (
                    <li
                      key={index}
                      className={`rounded-md border px-2 py-1 font-mono text-xs ${
                        entry.error
                          ? "border-destructive/40 text-destructive"
                          : "border-border"
                      }`}
                    >
                      {meta.operations[entry.operation].label.toLowerCase()}
                      {entry.value !== undefined &&
                        `(${formatValue(entry.value)})`}
                      {entry.output?.length === 1 && ` → ${entry.output[0]}`}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing yet. Every operation you run shows up here.
                </p>
              )}
            </Panel>
          </div>

          <Panel title={`About the ${meta.name.toLowerCase()}`}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <ol className="space-y-2 text-sm">
                  {meta.howItWorks.map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{item}</span>
                    </li>
                  ))}
                </ol>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    When to use it
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {meta.useCases.map((useCase) => (
                      <li key={useCase}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border self-start">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Operation</th>
                      <th className="px-3 py-2 text-right font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(meta.operations).map((operation) => (
                      <tr
                        key={operation.label}
                        className="border-t border-border"
                      >
                        <td className="px-3 py-2">{operation.label}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">
                          {operation.complexity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {id === "bst" && (
                  <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                    h = tree height: log n when balanced, n in the worst case.
                  </p>
                )}
              </div>
            </div>
          </Panel>
        </main>
      </div>
    </div>
  );
}
