// Registry that connects an algorithm id (shared/algorithms.js) to its step
// generator and to how the visualizer should present it.
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  shellSort,
  countingSort,
  radixSort,
} from "./sorting.js";
import {
  linearSearch,
  binarySearch,
  jumpSearch,
  interpolationSearch,
} from "./searching.js";
import { bfs, dfs } from "./graph.js";
import { gridSearch } from "./pathfinding.js";
import { fibonacci } from "./dynamicProgramming.js";

export const ALGORITHM_KINDS = {
  SORT: "sort",
  SEARCH: "search",
  GRAPH: "graph",
  GRID: "grid",
  DP: "dp",
};

const grid = (mode) => ({
  kind: ALGORITHM_KINDS.GRID,
  run: ({ grid: cells }) => gridSearch(cells, mode),
});

const sort = (run, markerLabel) => ({
  kind: ALGORITHM_KINDS.SORT,
  markerLabel,
  run: ({ array }) => run(array),
});

// Searches that need sorted input sort a copy first
const sortedSearch = (run, markerLabel) => ({
  kind: ALGORITHM_KINDS.SEARCH,
  markerLabel,
  needsSortedInput: true,
  run: ({ array, target }) =>
    run(
      [...array].sort((a, b) => a - b),
      target,
    ),
});

export const ALGORITHM_RUNNERS = {
  "bubble-sort": sort(bubbleSort),
  "selection-sort": sort(selectionSort, "Current min"),
  "insertion-sort": sort(insertionSort, "Key"),
  "merge-sort": sort(mergeSort),
  "quick-sort": sort(quickSort, "Pivot"),
  "heap-sort": sort(heapSort, "Largest"),
  "shell-sort": sort(shellSort, "Key"),
  "counting-sort": sort(countingSort),
  "radix-sort": sort(radixSort),
  "linear-search": {
    kind: ALGORITHM_KINDS.SEARCH,
    run: ({ array, target }) => linearSearch(array, target),
  },
  "binary-search": sortedSearch(binarySearch, "Mid"),
  "jump-search": sortedSearch(jumpSearch, "Block end"),
  "interpolation-search": sortedSearch(interpolationSearch, "Guess"),
  bfs: {
    kind: ALGORITHM_KINDS.GRAPH,
    frontierLabel: "Queue",
    orderLabel: "Visit order",
    run: ({ graph }) =>
      bfs(graph.vertices, graph.edges, graph.start, graph.directed),
  },
  dfs: {
    kind: ALGORITHM_KINDS.GRAPH,
    frontierLabel: "Call stack",
    orderLabel: "Visit order",
    run: ({ graph }) =>
      dfs(graph.vertices, graph.edges, graph.start, graph.directed),
  },
  "grid-bfs": grid("bfs"),
  "greedy-best-first": grid("greedy"),
  fibonacci: {
    kind: ALGORITHM_KINDS.DP,
    run: ({ n }) => fibonacci(n),
  },
};

export function runAlgorithm(id, input) {
  return ALGORITHM_RUNNERS[id]?.run(input) ?? [];
}
