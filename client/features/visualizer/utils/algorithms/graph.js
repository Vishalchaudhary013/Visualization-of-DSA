function createStep(state, visited, current, tracker, explanation) {
  return {
    state,
    comparisons: [current],
    swaps: [],
    sorted: visited,
    explanation,
    operations: {
      comparisons: tracker.comparisons,
      swaps: 0,
      reads: tracker.reads,
      writes: 0,
    },
  };
}
export function buildAdjacencyList(vertices, edges, directed = false) {
  const graph = new Map();
  for (let i = 0; i < vertices; i++) {
    graph.set(i, []);
  }
  for (const [from, to] of edges) {
    if (from >= 0 && from < vertices && to >= 0 && to < vertices) {
      const fromList = graph.get(from) || [];
      fromList.push(to);
      graph.set(from, fromList);
      if (!directed) {
        const toList = graph.get(to) || [];
        toList.push(from);
        graph.set(to, toList);
      }
    }
  }
  return graph;
}
export function bfs(vertices, edges, startVertex, directed = false) {
  const graph = buildAdjacencyList(vertices, edges, directed);
  const steps = [];
  const tracker = {
    comparisons: 0,
    reads: 0,
  };
  const visited = new Set();
  const queue = [startVertex];
  const traversalOrder = [];
  visited.add(startVertex);
  tracker.reads++;
  steps.push(
    createStep(
      Array.from({ length: vertices }, (_, i) => i),
      [startVertex],
      startVertex,
      tracker,
      `Started BFS from vertex ${startVertex}`,
    ),
  );
  while (queue.length > 0) {
    const current = queue.shift();
    traversalOrder.push(current);
    tracker.comparisons++;
    steps.push(
      createStep(
        Array.from({ length: vertices }, (_, i) => i),
        Array.from(visited),
        current,
        tracker,
        `Visiting vertex ${current}`,
      ),
    );
    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      tracker.reads++;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        tracker.comparisons++;
        steps.push(
          createStep(
            Array.from({ length: vertices }, (_, i) => i),
            Array.from(visited),
            neighbor,
            tracker,
            `Discovered vertex ${neighbor} from vertex ${current}`,
          ),
        );
      }
    }
  }
  steps.push(
    createStep(
      Array.from({ length: vertices }, (_, i) => i),
      Array.from(visited),
      -1,
      tracker,
      `BFS completed. Traversal order: ${traversalOrder.join(" -> ")}`,
    ),
  );
  return steps;
}
export function dfs(vertices, edges, startVertex, directed = false) {
  const graph = buildAdjacencyList(vertices, edges, directed);
  const steps = [];
  const tracker = {
    comparisons: 0,
    reads: 0,
  };
  const visited = new Set();
  const traversalOrder = [];
  function dfsHelper(vertex) {
    visited.add(vertex);
    traversalOrder.push(vertex);
    tracker.comparisons++;
    steps.push(
      createStep(
        Array.from({ length: vertices }, (_, i) => i),
        Array.from(visited),
        vertex,
        tracker,
        `Visiting vertex ${vertex}`,
      ),
    );
    const neighbors = graph.get(vertex) || [];
    for (const neighbor of neighbors) {
      tracker.reads++;
      if (!visited.has(neighbor)) {
        tracker.comparisons++;
        steps.push(
          createStep(
            Array.from({ length: vertices }, (_, i) => i),
            Array.from(visited),
            neighbor,
            tracker,
            `Discovered vertex ${neighbor} from vertex ${vertex}`,
          ),
        );
        dfsHelper(neighbor);
      }
    }
  }
  tracker.reads++;
  steps.push(
    createStep(
      Array.from({ length: vertices }, (_, i) => i),
      [startVertex],
      startVertex,
      tracker,
      `Started DFS from vertex ${startVertex}`,
    ),
  );
  dfsHelper(startVertex);
  steps.push(
    createStep(
      Array.from({ length: vertices }, (_, i) => i),
      Array.from(visited),
      -1,
      tracker,
      `DFS completed. Traversal order: ${traversalOrder.join(" -> ")}`,
    ),
  );
  return steps;
}
