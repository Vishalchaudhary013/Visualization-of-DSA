// Registry that connects an algorithm id (shared/algorithms.js) to its step
// generator and to how the visualizer should present it.
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
} from "./sorting.js";
import { linearSearch, binarySearch } from "./searching.js";
import { bfs, dfs } from "./graph.js";

export const ALGORITHM_KINDS = {
  SORT: "sort",
  SEARCH: "search",
  GRAPH: "graph",
};

const sort = (run, markerLabel) => ({
  kind: ALGORITHM_KINDS.SORT,
  markerLabel,
  run: ({ array }) => run(array),
});

export const ALGORITHM_RUNNERS = {
  "bubble-sort": sort(bubbleSort),
  "selection-sort": sort(selectionSort, "Current min"),
  "insertion-sort": sort(insertionSort, "Key"),
  "merge-sort": sort(mergeSort),
  "quick-sort": sort(quickSort, "Pivot"),
  "heap-sort": sort(heapSort, "Largest"),
  "linear-search": {
    kind: ALGORITHM_KINDS.SEARCH,
    run: ({ array, target }) => linearSearch(array, target),
  },
  "binary-search": {
    kind: ALGORITHM_KINDS.SEARCH,
    markerLabel: "Mid",
    needsSortedInput: true,
    run: ({ array, target }) =>
      binarySearch(
        [...array].sort((a, b) => a - b),
        target,
      ),
  },
  bfs: {
    kind: ALGORITHM_KINDS.GRAPH,
    frontierLabel: "Queue",
    run: ({ graph }) =>
      bfs(graph.vertices, graph.edges, graph.start, graph.directed),
  },
  dfs: {
    kind: ALGORITHM_KINDS.GRAPH,
    frontierLabel: "Call stack",
    run: ({ graph }) =>
      dfs(graph.vertices, graph.edges, graph.start, graph.directed),
  },
};

export function runAlgorithm(id, input) {
  const runner = ALGORITHM_RUNNERS[id];
  return runner ? runner.run(input) : [];
}
