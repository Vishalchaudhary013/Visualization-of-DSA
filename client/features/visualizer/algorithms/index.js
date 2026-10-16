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
import { dijkstra, kruskal, prim, topologicalSort } from "./weightedGraph.js";

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
  dijkstra: {
    kind: ALGORITHM_KINDS.GRAPH,
    weighted: true,
    frontierLabel: "Priority queue (vertex:distance)",
    orderLabel: "Finalized",
    run: ({ graph }) =>
      dijkstra(graph.vertices, graph.edges, graph.start, graph.directed),
  },
  prim: {
    kind: ALGORITHM_KINDS.GRAPH,
    weighted: true,
    directedMode: "undirected",
    frontierLabel: "Candidate edges",
    orderLabel: "Tree edges",
    run: ({ graph }) => prim(graph.vertices, graph.edges, graph.start),
  },
  kruskal: {
    kind: ALGORITHM_KINDS.GRAPH,
    weighted: true,
    directedMode: "undirected",
    needsStart: false,
    frontierLabel: "Edges left (cheapest first)",
    orderLabel: "Tree edges",
    run: ({ graph }) => kruskal(graph.vertices, graph.edges),
  },
  "topological-sort": {
    kind: ALGORITHM_KINDS.GRAPH,
    directedMode: "directed",
    needsStart: false,
    frontierLabel: "Queue (no incoming edges)",
    orderLabel: "Topological order",
    run: ({ graph }) => topologicalSort(graph.vertices, graph.edges),
  },
};

/**
 * The graph as the algorithm sees it: some algorithms only make sense on
 * undirected (MST) or directed (topological sort) graphs.
 */
export function effectiveGraph(id, graph) {
  const mode = ALGORITHM_RUNNERS[id]?.directedMode;
  if (mode === "directed") return { ...graph, directed: true };
  if (mode === "undirected") return { ...graph, directed: false };
  return graph;
}

export function runAlgorithm(id, input) {
  const runner = ALGORITHM_RUNNERS[id];
  if (!runner) return [];
  return runner.run(
    input.graph ? { ...input, graph: effectiveGraph(id, input.graph) } : input,
  );
}
