// Graph problems, drawn by the visualizer's GraphVisualizer. Vertices are
// 0-based indices; `vertexLabel` turns them into the problem's labels
// (Network Delay Time numbers its nodes from 1). Each step has:
// {
//   current, sorted (reached), frontier, order, activeEdge, treeEdges,
//   labels: text under each vertex, vars, line, explanation, output
// }

function createGraphProblemRecorder() {
  const steps = [];
  const record = ({
    current = -1,
    reached = [],
    frontier = [],
    order = [],
    activeEdge = null,
    treeEdges = [],
    labels = {},
    vars = {},
    line,
    explanation,
    output,
  }) => {
    steps.push({
      current,
      sorted: [...reached],
      frontier: [...frontier],
      order: [...order],
      activeEdge,
      treeEdges: treeEdges.map((edge) => [...edge]),
      labels: { ...labels },
      vars: { ...vars },
      line,
      explanation,
      output,
    });
  };
  return { steps, record };
}

const time = (value) => (value === Infinity ? "∞" : String(value));

/** Drawing data for a problem input: vertex count, edges [from, to, weight?], labels. */
export function graphOf(problemId, input) {
  if (problemId === "network-delay-time") {
    return {
      vertices: input.n,
      edges: input.times.map(([u, v, w]) => [u - 1, v - 1, w]),
      directed: true,
      weighted: true,
      vertexLabel: (v) => v + 1,
    };
  }
  return {
    vertices: input.numCourses,
    edges: input.prerequisites.map(([course, pre]) => [pre, course]),
    directed: true,
    weighted: false,
    vertexLabel: (v) => v,
  };
}

export function networkDelayTime({ times, n, k }) {
  const { steps, record } = createGraphProblemRecorder();
  // Node labels are 1..n; vertex index = label - 1
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) graph[u].push([v, w]);
  const dist = Array(n + 1).fill(Infinity);
  const parent = Array(n + 1).fill(null);
  const finalized = [];
  const heap = [[0, k]];
  dist[k] = 0;

  const snapshot = () => ({
    reached: dist.flatMap((d, node) =>
      node && d !== Infinity ? [node - 1] : [],
    ),
    frontier: [...heap]
      .sort((a, b) => a[0] - b[0])
      .map(([t, node]) => `${node - 1}:${t}`),
    order: finalized.map((node) => node - 1),
    treeEdges: parent.flatMap((p, node) =>
      p === null ? [] : [[p - 1, node - 1]],
    ),
    labels: Object.fromEntries(
      dist.slice(1).map((d, index) => [index, time(d)]),
    ),
  });

  record({
    ...snapshot(),
    current: k - 1,
    vars: { k },
    line: 4,
    explanation: `The signal starts at node ${k} at time 0. Every other node starts at ∞ (not reached yet).`,
  });
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]);
    const [t, node] = heap.shift();
    if (t > dist[node]) {
      record({
        ...snapshot(),
        current: node - 1,
        vars: { time: t, node },
        line: 9,
        explanation: `[${t}, ${node}] is outdated: node ${node} was already reached at time ${dist[node]}. Skip it.`,
      });
      continue;
    }
    finalized.push(node);
    record({
      ...snapshot(),
      current: node - 1,
      vars: { time: t, node },
      line: 8,
      explanation: `Take the earliest entry: node ${node} at time ${t}. No faster route can exist, so ${t} is final.`,
    });
    for (const [next, w] of graph[node]) {
      const candidate = t + w;
      const better = candidate < dist[next];
      const old = dist[next];
      if (better) {
        dist[next] = candidate;
        parent[next] = node;
        heap.push([candidate, next]);
      }
      record({
        ...snapshot(),
        current: node - 1,
        activeEdge: [node - 1, next - 1],
        vars: { time: t, node, next, w },
        line: better ? 12 : 11,
        explanation: better
          ? `${node} → ${next} takes ${w}: ${t} + ${w} = ${candidate} < ${time(old)}. Node ${next} now hears the signal at ${candidate}.`
          : `${node} → ${next} takes ${w}: ${t} + ${w} = ${candidate} is not faster than ${time(old)}.`,
      });
    }
  }
  const slowest = Math.max(...dist.slice(1));
  const missing = dist.flatMap((d, node) =>
    node && d === Infinity ? [node] : [],
  );
  record({
    ...snapshot(),
    vars: { slowest: time(slowest) },
    line: 18,
    explanation:
      slowest === Infinity
        ? `Node${missing.length > 1 ? "s" : ""} ${missing.join(", ")} never receive${missing.length > 1 ? "" : "s"} the signal, so the answer is -1.`
        : `Every node has the signal. The last one gets it at time ${slowest}.`,
    output: String(slowest === Infinity ? -1 : slowest),
  });
  return steps;
}

export function findOrder({ numCourses, prerequisites }) {
  const { steps, record } = createGraphProblemRecorder();
  const next = Array.from({ length: numCourses }, () => []);
  const indegree = Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {
    next[pre].push(course);
    indegree[course]++;
  }
  const queue = [];
  const order = [];
  const usedEdges = [];
  const snapshot = () => ({
    reached: order,
    frontier: queue,
    order,
    treeEdges: usedEdges,
    labels: Object.fromEntries(indegree.map((d, c) => [c, `in ${d}`])),
  });

  record({
    ...snapshot(),
    line: 5,
    explanation:
      "Draw an arrow pre → course for every prerequisite and count the arrows into each course (its in-degree).",
  });
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);
  record({
    ...snapshot(),
    vars: { queue: `[${queue.join(", ")}]` },
    line: 8,
    explanation: queue.length
      ? `Courses with no prerequisites can be taken right away: ${queue.join(", ")}.`
      : "Every course has a prerequisite, so no course can be taken first.",
  });
  while (queue.length) {
    const course = queue.shift();
    order.push(course);
    record({
      ...snapshot(),
      current: course,
      vars: { course },
      line: 12,
      explanation: `Take course ${course}. Order so far: ${order.join(" → ")}.`,
    });
    for (const after of next[course]) {
      indegree[after]--;
      usedEdges.push([course, after]);
      const freed = indegree[after] === 0;
      if (freed) queue.push(after);
      record({
        ...snapshot(),
        current: course,
        activeEdge: [course, after],
        vars: { course, after, "indegree[after]": indegree[after] },
        line: 14,
        explanation: freed
          ? `Course ${after} has no prerequisites left: add it to the queue.`
          : `Course ${after} still waits for ${indegree[after]} more course${indegree[after] === 1 ? "" : "s"}.`,
      });
    }
  }
  const blocked = indegree.flatMap((d, c) => (d > 0 ? [c] : []));
  record({
    ...snapshot(),
    line: 17,
    explanation:
      order.length === numCourses
        ? `All ${numCourses} courses can be taken in the order ${order.join(" → ")}.`
        : `Courses ${blocked.join(", ")} are stuck in a cycle of prerequisites, so it is impossible: return [].`,
    output: JSON.stringify(order.length === numCourses ? order : []),
  });
  return steps;
}
