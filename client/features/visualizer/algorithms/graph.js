// Step generators for graph traversals. Each step carries the traversal state
// the graph canvas draws:
// {
//   current:    vertex being processed (-1 when finished)
//   sorted:     visited vertices
//   processed:  vertices whose neighbours are all explored
//   frontier:   queue (BFS) or call stack (DFS) contents
//   order:      visiting order so far
//   activeEdge: [from, to] edge being examined, or null
//   treeEdges:  edges used to discover new vertices
//   line, explanation, operations: as for array algorithms
// }
// `comparisons: [current]` keeps the shape the math panels expect.

export function buildAdjacencyList(vertices, edges, directed = false) {
  const graph = new Map();
  for (let i = 0; i < vertices; i++) graph.set(i, []);
  for (const [from, to] of edges) {
    if (from < 0 || from >= vertices || to < 0 || to >= vertices) continue;
    graph.get(from).push(to);
    if (!directed) graph.get(to).push(from);
  }
  for (const list of graph.values()) list.sort((a, b) => a - b);
  return graph;
}

function createGraphRecorder(vertices) {
  const steps = [];
  const ops = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };
  const visited = new Set();
  const processed = new Set();
  const order = [];
  const treeEdges = [];
  const state = Array.from({ length: vertices }, (_, i) => i);

  const record = ({
    current,
    frontier,
    activeEdge = null,
    line,
    explanation,
  }) => {
    steps.push({
      state,
      comparisons: [current],
      swaps: [],
      sorted: [...visited],
      current,
      processed: [...processed],
      frontier: [...frontier],
      order: [...order],
      activeEdge,
      treeEdges: [...treeEdges],
      line,
      explanation,
      operations: { ...ops },
    });
  };

  return {
    steps,
    ops,
    visited,
    processed,
    order,
    treeEdges,
    record,
  };
}

function unreachableNote(vertices, visited) {
  const missing = Array.from({ length: vertices }, (_, i) => i).filter(
    (v) => !visited.has(v),
  );
  return missing.length
    ? ` Not reachable from the start: ${missing.join(", ")}.`
    : "";
}

export function bfs(vertices, edges, startVertex, directed = false) {
  const graph = buildAdjacencyList(vertices, edges, directed);
  const { steps, ops, visited, processed, order, treeEdges, record } =
    createGraphRecorder(vertices);
  const queue = [startVertex];
  visited.add(startVertex);
  record({
    current: startVertex,
    frontier: queue,
    line: 0,
    explanation: `Put start vertex ${startVertex} in the queue and mark it visited`,
  });

  while (queue.length > 0) {
    const current = queue.shift();
    order.push(current);
    record({
      current,
      frontier: queue,
      line: 2,
      explanation: `Dequeue ${current}. Explore its neighbours: [${graph.get(current).join(", ") || "none"}]`,
    });
    for (const neighbor of graph.get(current)) {
      ops.comparisons++;
      ops.reads++;
      if (visited.has(neighbor)) {
        record({
          current,
          frontier: queue,
          activeEdge: [current, neighbor],
          line: 4,
          explanation: `${neighbor} is already visited: skip it`,
        });
        continue;
      }
      visited.add(neighbor);
      queue.push(neighbor);
      ops.writes++;
      treeEdges.push([current, neighbor]);
      record({
        current,
        frontier: queue,
        activeEdge: [current, neighbor],
        line: 6,
        explanation: `${neighbor} is new: mark it visited and enqueue it`,
      });
    }
    processed.add(current);
  }

  record({
    current: -1,
    frontier: [],
    line: null,
    explanation: `BFS complete. Visit order: ${order.join(" → ")}.${unreachableNote(vertices, visited)}`,
  });
  return steps;
}

export function dfs(vertices, edges, startVertex, directed = false) {
  const graph = buildAdjacencyList(vertices, edges, directed);
  const { steps, ops, visited, processed, order, treeEdges, record } =
    createGraphRecorder(vertices);
  const stack = [];

  function visit(vertex) {
    stack.push(vertex);
    visited.add(vertex);
    order.push(vertex);
    ops.writes++;
    record({
      current: vertex,
      frontier: stack,
      line: 2,
      explanation: `Visit ${vertex}. Neighbours: [${graph.get(vertex).join(", ") || "none"}]`,
    });
    for (const neighbor of graph.get(vertex)) {
      ops.comparisons++;
      ops.reads++;
      if (visited.has(neighbor)) {
        record({
          current: vertex,
          frontier: stack,
          activeEdge: [vertex, neighbor],
          line: 4,
          explanation: `${neighbor} is already visited: skip it`,
        });
        continue;
      }
      treeEdges.push([vertex, neighbor]);
      record({
        current: vertex,
        frontier: stack,
        activeEdge: [vertex, neighbor],
        line: 5,
        explanation: `${neighbor} is unvisited: go deeper into ${neighbor}`,
      });
      visit(neighbor);
    }
    stack.pop();
    processed.add(vertex);
    record({
      current: vertex,
      frontier: stack,
      line: 6,
      explanation: stack.length
        ? `${vertex} has no unvisited neighbours: backtrack to ${stack[stack.length - 1]}`
        : `${vertex} has no unvisited neighbours: back at the start, done`,
    });
  }

  record({
    current: startVertex,
    frontier: [],
    line: 1,
    explanation: `Start DFS from vertex ${startVertex}`,
  });
  visit(startVertex);
  record({
    current: -1,
    frontier: [],
    line: null,
    explanation: `DFS complete. Visit order: ${order.join(" → ")}.${unreachableNote(vertices, visited)}`,
  });
  return steps;
}
