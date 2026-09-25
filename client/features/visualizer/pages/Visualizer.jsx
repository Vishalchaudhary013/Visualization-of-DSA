import { useMemo, useState } from "react";
import { LuShuffle as Shuffle } from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Input } from "@/features/common/components/ui/input";
import { Label } from "@/features/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/common/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/features/common/components/ui/tabs";
import { ArrayVisualizer } from "../components/visualizations/ArrayVisualizer";
import { GraphVisualizer } from "../components/visualizations/GraphVisualizer";
import { StepMathDetails } from "../components/visualizations/StepMathDetails";
import { AlgorithmMathSummary } from "../components/visualizations/AlgorithmMathSummary";
import { AlgorithmControls } from "../components/AlgorithmControls";
import { AlgorithmInfoPanel } from "../components/AlgorithmInfoPanel";
import { useAlgorithmVisualizer } from "../hooks/useAlgorithmVisualizer";
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
} from "../utils/algorithms/sorting";
import { linearSearch, binarySearch } from "../utils/algorithms/searching";
import { bfs, dfs } from "../utils/algorithms/graph";
import { ALGORITHMS } from "@shared/algorithms";

const DEFAULT_ALGORITHM = "bubble-sort";

export default function Visualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(DEFAULT_ALGORITHM);
  const [arraySize, setArraySize] = useState(20);
  const [customArray, setCustomArray] = useState("");
  const [searchTarget, setSearchTarget] = useState(5);
  const [graphVertices, setGraphVertices] = useState(5);
  const [graphEdges, setGraphEdges] = useState("");
  const [graphDirected, setGraphDirected] = useState(false);
  const [graphStart, setGraphStart] = useState(0);

  const arrayData = useMemo(() => {
    if (customArray.trim()) {
      try {
        const values = customArray
          .split(",")
          .map((value) => parseInt(value.trim(), 10))
          .filter((value) => !Number.isNaN(value));
        return values.length > 0 ? values : generateRandomArray(arraySize);
      } catch {
        return generateRandomArray(arraySize);
      }
    }
    return generateRandomArray(arraySize);
  }, [customArray, arraySize]);

  const parsedEdges = useMemo(() => {
    if (!graphEdges.trim()) {
      return generateGraphEdges(graphVertices);
    }

    try {
      const edges = graphEdges.split("\n").reduce((acc, line) => {
        const [from, to] = line
          .split(",")
          .map((value) => parseInt(value.trim(), 10));
        if (!Number.isNaN(from) && !Number.isNaN(to)) {
          acc.push([from, to]);
        }
        return acc;
      }, /** @type {Array<[number, number]>} */ ([]));

      return edges.length > 0 ? edges : generateGraphEdges(graphVertices);
    } catch {
      return generateGraphEdges(graphVertices);
    }
  }, [graphEdges, graphVertices]);

  const steps = useMemo(() => {
    const algo = ALGORITHMS[selectedAlgorithm];
    if (!algo) return [];

    switch (selectedAlgorithm) {
      case "bubble-sort":
        return bubbleSort(arrayData);
      case "selection-sort":
        return selectionSort(arrayData);
      case "insertion-sort":
        return insertionSort(arrayData);
      case "merge-sort":
        return mergeSort(arrayData);
      case "quick-sort":
        return quickSort(arrayData);
      case "heap-sort":
        return heapSort(arrayData);
      case "linear-search":
        return linearSearch(arrayData, searchTarget);
      case "binary-search":
        return binarySearch(
          [...arrayData].sort((a, b) => a - b),
          searchTarget,
        );
      case "bfs":
        return bfs(graphVertices, parsedEdges, graphStart, graphDirected);
      case "dfs":
        return dfs(graphVertices, parsedEdges, graphStart, graphDirected);
      default:
        return [];
    }
  }, [
    selectedAlgorithm,
    arrayData,
    searchTarget,
    graphVertices,
    parsedEdges,
    graphDirected,
    graphStart,
  ]);

  const visualizer = useAlgorithmVisualizer(
    steps,
    ALGORITHMS[selectedAlgorithm],
  );
  const currentStep = visualizer.getCurrentStep();
  const isSearchingAlgorithm = selectedAlgorithm.includes("search");
  const isSortingAlgorithm = selectedAlgorithm.includes("sort");
  const isGraphAlgorithm = ["bfs", "dfs"].includes(selectedAlgorithm);

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="w-full px-0 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Algorithm Visualizer</h1>
          <p className="text-muted-foreground">
            Select an algorithm and customize inputs to visualize step-by-step
            execution
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1.5fr)_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1.8fr)_minmax(0,1.1fr)]">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="algorithm"
                  className="text-base! font-semibold!"
                >
                  Algorithm
                </Label>
                <Select
                  value={selectedAlgorithm}
                  onValueChange={setSelectedAlgorithm}
                >
                  <SelectTrigger id="algorithm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bubble-sort">Bubble Sort</SelectItem>
                    <SelectItem value="selection-sort">
                      Selection Sort
                    </SelectItem>
                    <SelectItem value="insertion-sort">
                      Insertion Sort
                    </SelectItem>
                    <SelectItem value="merge-sort">Merge Sort</SelectItem>
                    <SelectItem value="quick-sort">Quick Sort</SelectItem>
                    <SelectItem value="heap-sort">Heap Sort</SelectItem>
                    <SelectItem value="linear-search">Linear Search</SelectItem>
                    <SelectItem value="binary-search">Binary Search</SelectItem>
                    <SelectItem value="bfs">Breadth-First Search</SelectItem>
                    <SelectItem value="dfs">Depth-First Search</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isSortingAlgorithm && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="array-size" className="text-sm">
                      Array Size: {arraySize}
                    </Label>
                    <input
                      id="array-size"
                      type="range"
                      min="5"
                      max="50"
                      value={arraySize}
                      onChange={(event) =>
                        setArraySize(parseInt(event.target.value, 10))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-array" className="text-sm">
                      Custom Values (comma-separated)
                    </Label>
                    <Input
                      id="custom-array"
                      placeholder="e.g., 5,2,8,1,9"
                      value={customArray}
                      onChange={(event) => setCustomArray(event.target.value)}
                      className="text-sm!"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setCustomArray("");
                      setArraySize(Math.floor(Math.random() * 31) + 5);
                    }}
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Randomize
                  </Button>
                </>
              )}

              {isSearchingAlgorithm && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="search-target" className="text-sm">
                      Target Value
                    </Label>
                    <Input
                      id="search-target"
                      type="number"
                      value={searchTarget}
                      onChange={(event) =>
                        setSearchTarget(parseInt(event.target.value, 10))
                      }
                      className="text-sm!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-array-size" className="text-sm">
                      Array Size: {arraySize}
                    </Label>
                    <input
                      id="search-array-size"
                      type="range"
                      min="5"
                      max="50"
                      value={arraySize}
                      onChange={(event) =>
                        setArraySize(parseInt(event.target.value, 10))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-custom-array" className="text-sm">
                      Custom Values (comma-separated)
                    </Label>
                    <Input
                      id="search-custom-array"
                      placeholder="e.g., 7,1,4,9,2"
                      value={customArray}
                      onChange={(event) => setCustomArray(event.target.value)}
                      className="text-sm!"
                    />
                  </div>
                </>
              )}

              {isGraphAlgorithm && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vertices" className="text-sm">
                      Vertices: {graphVertices}
                    </Label>
                    <input
                      id="vertices"
                      type="range"
                      min="3"
                      max="8"
                      value={graphVertices}
                      onChange={(event) =>
                        setGraphVertices(parseInt(event.target.value, 10))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-vertex" className="text-sm">
                      Start Vertex
                    </Label>
                    <Select
                      value={String(graphStart)}
                      onValueChange={(value) =>
                        setGraphStart(parseInt(value, 10))
                      }
                    >
                      <SelectTrigger id="start-vertex">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: graphVertices }, (_, index) => (
                          <SelectItem key={index} value={String(index)}>
                            Vertex {index}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graph-edges" className="text-sm">
                      Edges (from,to per line)
                    </Label>
                    <textarea
                      id="graph-edges"
                      placeholder={"0,1\n1,2\n2,3"}
                      value={graphEdges}
                      onChange={(event) => setGraphEdges(event.target.value)}
                      className="w-full h-24 p-2 border border-border rounded text-xs font-mono"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={graphDirected}
                      onChange={(event) =>
                        setGraphDirected(event.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    <span>Directed Graph</span>
                  </label>
                </>
              )}
            </div>

            <AlgorithmControls
              isPlaying={visualizer.isPlaying}
              isPaused={visualizer.isPaused}
              currentStep={visualizer.currentStep}
              totalSteps={visualizer.steps.length}
              speed={visualizer.speed}
              onPlay={visualizer.play}
              onPause={visualizer.pause}
              onStop={visualizer.stop}
              onNextStep={visualizer.nextStep}
              onPreviousStep={visualizer.previousStep}
              onReset={visualizer.reset}
              onSpeedChange={visualizer.setSpeed}
              onGoToStep={visualizer.goToStep}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              {isGraphAlgorithm ? (
                <GraphVisualizer
                  step={currentStep}
                  vertices={graphVertices}
                  edges={parsedEdges}
                  directed={graphDirected}
                />
              ) : (
                <ArrayVisualizer step={currentStep} speed={visualizer.speed} />
              )}
            </div>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid! w-full grid-cols-2">
                <TabsTrigger value="info">Algorithm Info</TabsTrigger>
                <TabsTrigger value="complexity">Analysis</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="bg-card border border-border rounded-lg p-6">
                  <AlgorithmInfoPanel algorithm={visualizer.algorithm} />
                </div>
              </TabsContent>
              <TabsContent value="complexity">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  {currentStep && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Comparisons
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {currentStep.operations.comparisons}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Swaps</p>
                        <p className="text-2xl font-bold text-primary">
                          {currentStep.operations.swaps}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Reads</p>
                        <p className="text-2xl font-bold text-primary">
                          {currentStep.operations.reads}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Writes</p>
                        <p className="text-2xl font-bold text-primary">
                          {currentStep.operations.writes}
                        </p>
                      </div>
                    </div>
                  )}

                  {visualizer.algorithm && (
                    <div className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="p-4 bg-muted/20 rounded-lg">
                          <p className="text-sm font-semibold mb-2">
                            Time Complexity
                          </p>
                          <div className="space-y-1 text-sm font-mono">
                            <p>
                              Best: {visualizer.algorithm.complexity.time.best}
                            </p>
                            <p>
                              Avg:{" "}
                              {visualizer.algorithm.complexity.time.average}
                            </p>
                            <p>
                              Worst:{" "}
                              {visualizer.algorithm.complexity.time.worst}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 bg-muted/20 rounded-lg">
                          <p className="text-sm font-semibold mb-2">
                            Space Complexity
                          </p>
                          <p className="text-sm font-mono">
                            {visualizer.algorithm.complexity.space}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            <div className="bg-card border border-border rounded-lg p-6">
              <StepMathDetails
                step={currentStep}
                isSorting={isSortingAlgorithm}
                isSearching={isSearchingAlgorithm}
                isGraph={isGraphAlgorithm}
                searchTarget={isSearchingAlgorithm ? searchTarget : undefined}
                graphInfo={
                  isGraphAlgorithm
                    ? {
                        vertices: graphVertices,
                        edges: parsedEdges,
                        directed: graphDirected,
                      }
                    : undefined
                }
              />
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                Full Calculation Summary
              </h3>
              <AlgorithmMathSummary
                steps={visualizer.steps}
                isSorting={isSortingAlgorithm}
                isSearching={isSearchingAlgorithm}
                isGraph={isGraphAlgorithm}
                searchTarget={isSearchingAlgorithm ? searchTarget : undefined}
                algorithmId={selectedAlgorithm}
                initialArray={arrayData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateRandomArray(size) {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * 100) + 1,
  );
}

function generateGraphEdges(vertices) {
  const edges = [];
  const maxEdges = Math.min(vertices * 2, 10);
  const edgeCount =
    Math.floor(Math.random() * (maxEdges - vertices)) + vertices;

  for (let index = 0; index < edgeCount; index += 1) {
    const from = Math.floor(Math.random() * vertices);
    let to = Math.floor(Math.random() * vertices);

    while (to === from) {
      to = Math.floor(Math.random() * vertices);
    }

    const alreadyExists = edges.some(
      (edge) =>
        (edge[0] === from && edge[1] === to) ||
        (edge[0] === to && edge[1] === from),
    );

    if (!alreadyExists) {
      edges.push([from, to]);
    }
  }

  return edges;
}
