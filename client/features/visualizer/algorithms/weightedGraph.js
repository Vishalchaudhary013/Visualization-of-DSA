// Step generators for weighted / directed graph algorithms. Edges are
// [from, to, weight] (weight defaults to 1). Steps use the same shape as
// BFS/DFS (see graph.js), plus `labels` (text under each vertex) and
// `skippedEdges`. `line` indexes the pseudocode in shared/algorithms.js.
import { createGraphRecorder } from "./graph.js";

const weightOf = (edge) => edge[2] ?? 1;
const edgeLabel = ([a, b], weight) => `${a}-${b} (${weight})`;
const INF = "∞";

function weightedAdjacency(vertices, edges, directed) {
  const adjacency = Array.from({ length: vertices }, () => []);
  for (const edge of edges) {
    const [from, to] = edge;
    if (from >= vertices || to >= vertices) continue;
    adjacency[from].push({ to, weight: weightOf(edge) });
    if (!directed) adjacency[to].push({ to: from, weight: weightOf(edge) });
  }
  for (const list of adjacency) list.sort((a, b) => a.to - b.to);
  return adjacency;
}

const distanceLabels = (dist) =>
  Object.fromEntries(dist.map((d, v) => [v, d === Infinity ? INF : String(d)]));

/** Smallest item by key; the tiny priority queue keeps the demo readable. */
function popMin(queue, key) {
  let best = 0;
  for (let i = 1; i < queue.length; i++) {
    if (key(queue[i]) < key(queue[best])) best = i;
  }
  return queue.splice(best, 1)[0];
}

export function dijkstra(vertices, edges, start, directed = false) {
  const adjacency = weightedAdjacency(vertices, edges, directed);
  const rec = createGraphRecorder(vertices);
  const { ops, visited, processed, order, treeEdges, record } = rec;
  const dist = Array(vertices).fill(Infinity);
  const prev = Array(vertices).fill(null);
  const queue = [{ vertex: start, distance: 0 }];
  dist[start] = 0;
  visited.add(start);
  const frontier = () =>
    [...queue]
      .sort((a, b) => a.distance - b.distance)
      .map((item) => `${item.vertex}:${item.distance}`);
  const setTreeEdge = (v) => {
    const index = treeEdges.findIndex(([, to]) => to === v);
    if (index !== -1) treeEdges.splice(index, 1);
    treeEdges.push([prev[v], v]);
  };

  record({
    current: start,
    frontier: frontier(),
    line: 1,
    labels: distanceLabels(dist),
    explanation: `Every distance starts at ∞ except the start: dist[${start}] = 0`,
  });

  while (queue.length) {
    const { vertex: u, distance } = popMin(queue, (item) => item.distance);
    ops.reads++;
    if (distance > dist[u] || processed.has(u)) {
      record({
        current: u,
        frontier: frontier(),
        line: 4,
        labels: distanceLabels(dist),
        explanation: `${u}:${distance} is outdated (dist[${u}] = ${dist[u]}): skip it`,
      });
      continue;
    }
    processed.add(u);
    order.push(u);
    record({
      current: u,
      frontier: frontier(),
      line: 3,
      labels: distanceLabels(dist),
      explanation: `Take the closest unfinished vertex: ${u} (distance ${distance}). Its distance is now final`,
    });
    for (const { to: v, weight } of adjacency[u]) {
      ops.comparisons++;
      const candidate = dist[u] + weight;
      if (candidate < dist[v]) {
        const old = dist[v];
        dist[v] = candidate;
        prev[v] = u;
        visited.add(v);
        setTreeEdge(v);
        queue.push({ vertex: v, distance: candidate });
        ops.writes++;
        record({
          current: u,
          frontier: frontier(),
          activeEdge: [u, v],
          line: 7,
          labels: distanceLabels(dist),
          explanation: `${dist[u]} + ${weight} = ${candidate} < ${old === Infinity ? INF : old}: shorter path to ${v} through ${u}`,
        });
      } else {
        record({
          current: u,
          frontier: frontier(),
          activeEdge: [u, v],
          line: 6,
          labels: distanceLabels(dist),
          explanation: `${dist[u]} + ${weight} = ${candidate} ≥ dist[${v}] = ${dist[v]}: no improvement`,
        });
      }
    }
  }

  const unreachable = dist
    .map((d, v) => (d === Infinity ? v : null))
    .filter((v) => v !== null);
  record({
    current: -1,
    frontier: [],
    line: null,
    labels: distanceLabels(dist),
    explanation: `Done. Shortest distances from ${start}: ${dist
      .map((d, v) => `${v}=${d === Infinity ? INF : d}`)
      .join(
        ", ",
      )}.${unreachable.length ? ` Unreachable: ${unreachable.join(", ")}.` : ""}`,
  });
  return rec.steps;
}

export function prim(vertices, edges, start) {
  const adjacency = weightedAdjacency(vertices, edges, false);
  const rec = createGraphRecorder(vertices);
  const { ops, visited, processed, order, treeEdges, skippedEdges, record } =
    rec;
  let total = 0;
  const queue = [];
  const frontier = () =>
    [...queue]
      .sort((a, b) => a.weight - b.weight)
      .map((item) => edgeLabel([item.from, item.to], item.weight));
  const addVertex = (v) => {
    visited.add(v);
    processed.add(v);
    for (const { to, weight } of adjacency[v]) {
      if (!visited.has(to)) queue.push({ from: v, to, weight });
    }
  };

  addVertex(start);
  record({
    current: start,
    frontier: frontier(),
    line: 1,
    explanation: `Start the tree at ${start}; its edges become candidates`,
  });

  while (queue.length && visited.size < vertices) {
    const { from, to, weight } = popMin(queue, (item) => item.weight);
    ops.comparisons++;
    if (visited.has(to)) {
      skippedEdges.push([from, to]);
      record({
        current: from,
        frontier: frontier(),
        activeEdge: [from, to],
        line: 3,
        explanation: `Cheapest candidate ${from}-${to} (${weight}) leads back into the tree: skip it`,
      });
      continue;
    }
    total += weight;
    treeEdges.push([from, to]);
    order.push(`${from}-${to}`);
    ops.writes++;
    addVertex(to);
    record({
      current: to,
      frontier: frontier(),
      activeEdge: [from, to],
      line: 4,
      explanation: `Add the cheapest edge ${from}-${to} (${weight}) and vertex ${to}. Tree weight = ${total}`,
    });
  }

  const complete = visited.size === vertices;
  record({
    current: -1,
    frontier: [],
    line: null,
    explanation: complete
      ? `Minimum spanning tree done: ${treeEdges.length} edges, total weight ${total}`
      : `The graph is not connected: the tree from ${start} spans ${visited.size} of ${vertices} vertices (weight ${total})`,
  });
  return rec.steps;
}

export function kruskal(vertices, edges) {
  const rec = createGraphRecorder(vertices);
  const { ops, visited, order, treeEdges, skippedEdges, record } = rec;
  const parent = Array.from({ length: vertices }, (_, v) => v);
  const find = (v) => {
    while (parent[v] !== v) {
      parent[v] = parent[parent[v]]; // path halving
      v = parent[v];
    }
    return v;
  };
  const sorted = edges
    .filter(([a, b]) => a < vertices && b < vertices)
    .map((edge) => ({ edge, weight: weightOf(edge) }))
    .sort((x, y) => x.weight - y.weight);
  let total = 0;
  let index = 0;
  const remaining = () =>
    sorted.slice(index).map((item) => edgeLabel(item.edge, item.weight));

  record({
    current: -1,
    frontier: remaining(),
    line: 1,
    explanation: `Sort all ${sorted.length} edges by weight; every vertex starts as its own tree`,
  });

  for (; index < sorted.length;) {
    const { edge, weight } = sorted[index++];
    const [u, v] = edge;
    ops.comparisons++;
    const rootU = find(u);
    const rootV = find(v);
    if (rootU !== rootV) {
      parent[rootU] = rootV;
      total += weight;
      treeEdges.push([u, v]);
      visited.add(u).add(v);
      order.push(`${u}-${v}`);
      ops.writes++;
      record({
        current: -1,
        frontier: remaining(),
        activeEdge: [u, v],
        line: 4,
        explanation: `${u} and ${v} are in different trees: join them with ${u}-${v} (${weight}). Total = ${total}`,
      });
      if (treeEdges.length === vertices - 1) break;
    } else {
      skippedEdges.push([u, v]);
      record({
        current: -1,
        frontier: remaining(),
        activeEdge: [u, v],
        line: 5,
        explanation: `${u} and ${v} are already connected: ${u}-${v} (${weight}) would make a cycle, skip it`,
      });
    }
  }

  const complete = treeEdges.length === vertices - 1;
  record({
    current: -1,
    frontier: [],
    line: null,
    explanation: complete
      ? `Minimum spanning tree done: ${treeEdges.length} edges, total weight ${total}`
      : `The graph is not connected: this is a minimum spanning forest with ${treeEdges.length} edges (weight ${total})`,
  });
  return rec.steps;
}

/** Kahn's algorithm. Edges are always treated as directed. */
export function topologicalSort(vertices, edges) {
  const adjacency = weightedAdjacency(vertices, edges, true);
  const rec = createGraphRecorder(vertices);
  const { ops, visited, processed, order, treeEdges, record } = rec;
  const indegree = Array(vertices).fill(0);
  for (const list of adjacency) for (const { to } of list) indegree[to]++;
  const labels = () =>
    Object.fromEntries(
      indegree.map((d, v) => [v, processed.has(v) ? "✓" : `in ${d}`]),
    );
  const queue = [];
  for (let v = 0; v < vertices; v++) {
    if (indegree[v] === 0) {
      queue.push(v);
      visited.add(v);
    }
  }

  record({
    current: -1,
    frontier: queue,
    line: 1,
    labels: labels(),
    explanation: `Count incoming edges. Vertices with none can go first: [${queue.join(", ") || "none"}]`,
  });

  while (queue.length) {
    const u = queue.shift();
    processed.add(u);
    order.push(u);
    ops.writes++;
    record({
      current: u,
      frontier: queue,
      line: 3,
      labels: labels(),
      explanation: `Take ${u} (no remaining prerequisites) and append it to the order`,
    });
    for (const { to: v } of adjacency[u]) {
      ops.comparisons++;
      indegree[v]--;
      treeEdges.push([u, v]);
      if (indegree[v] === 0) {
        queue.push(v);
        visited.add(v);
      }
      record({
        current: u,
        frontier: queue,
        activeEdge: [u, v],
        line: indegree[v] === 0 ? 6 : 5,
        labels: labels(),
        explanation:
          indegree[v] === 0
            ? `Remove edge ${u}→${v}: ${v} has no incoming edges left, enqueue it`
            : `Remove edge ${u}→${v}: ${v} still has ${indegree[v]} incoming`,
      });
    }
  }

  const hasCycle = order.length < vertices;
  record({
    current: -1,
    frontier: [],
    line: hasCycle ? 7 : null,
    labels: labels(),
    explanation: hasCycle
      ? `Only ${order.length} of ${vertices} vertices could be ordered: the rest are part of a cycle, so no topological order exists`
      : `Topological order: ${order.join(" → ")}. Every edge points forward in this order`,
  });
  return rec.steps;
}
