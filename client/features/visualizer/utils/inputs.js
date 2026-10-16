// Input generation, parsing and URL (de)serialisation for the visualizer.

export const ARRAY_LIMITS = {
  minSize: 2,
  maxSize: 50,
  minValue: 1,
  maxValue: 99,
};
export const GRAPH_LIMITS = { minVertices: 2, maxVertices: 10 };

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const ARRAY_PRESETS = {
  random: {
    label: "Random",
    build: (size) =>
      Array.from({ length: size }, () =>
        randomInt(ARRAY_LIMITS.minValue, ARRAY_LIMITS.maxValue),
      ),
  },
  sorted: {
    label: "Sorted",
    build: (size) => ARRAY_PRESETS.random.build(size).sort((a, b) => a - b),
  },
  reversed: {
    label: "Reversed",
    build: (size) => ARRAY_PRESETS.random.build(size).sort((a, b) => b - a),
  },
  nearlySorted: {
    label: "Nearly sorted",
    build: (size) => {
      const values = ARRAY_PRESETS.sorted.build(size);
      const swaps = Math.max(1, Math.floor(size / 8));
      for (let k = 0; k < swaps; k++) {
        const i = randomInt(0, size - 2);
        [values[i], values[i + 1]] = [values[i + 1], values[i]];
      }
      return values;
    },
  },
  fewUnique: {
    label: "Few unique",
    build: (size) => {
      const pool = ARRAY_PRESETS.random.build(Math.min(4, size));
      return Array.from(
        { length: size },
        () => pool[randomInt(0, pool.length - 1)],
      );
    },
  },
};

/** "5, 2, 8" -> { values: [5, 2, 8] } or { error } */
export function parseArray(text) {
  const tokens = text
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  if (tokens.length < ARRAY_LIMITS.minSize) {
    return { error: `Enter at least ${ARRAY_LIMITS.minSize} numbers` };
  }
  if (tokens.length > ARRAY_LIMITS.maxSize) {
    return { error: `Use at most ${ARRAY_LIMITS.maxSize} numbers` };
  }
  const invalid = tokens.find((token) => !/^-?\d+$/.test(token));
  if (invalid) return { error: `"${invalid}" is not a whole number` };
  const values = tokens.map(Number);
  const outOfRange = values.find((value) => value < 0 || value > 999);
  if (outOfRange !== undefined) {
    return { error: `${outOfRange} is out of range (0 to 999)` };
  }
  return { values };
}

/**
 * One edge per line: "0-1", "0,1" or with a weight "0-1:4". Several edges on
 * one line work too ("0-1:4, 1-2"). -> { edges: [[from, to, weight]] } or { error }
 */
export function parseEdges(text, vertices) {
  const parts = text
    .split(/[\n;_]+/)
    .flatMap((line) => (line.includes("-") ? line.split(",") : [line]))
    .map((part) => part.trim())
    .filter(Boolean);
  const edges = [];
  for (const part of parts) {
    const match = part.match(
      /^(\d+)\s*(?:,|->|-|\s)\s*(\d+)(?:\s*(?::|,|\s)\s*(\d+))?$/,
    );
    if (!match) return { error: `"${part}" is not an edge like 0-1 or 0-1:4` };
    const [from, to] = [Number(match[1]), Number(match[2])];
    const weight = match[3] === undefined ? 1 : Number(match[3]);
    if (from >= vertices || to >= vertices) {
      return {
        error: `Edge ${from}-${to} uses a vertex above ${vertices - 1}`,
      };
    }
    if (from === to) return { error: `Edge ${from}-${to} is a self-loop` };
    if (weight < 1 || weight > 99) {
      return { error: `Weight ${weight} on ${from}-${to} must be 1 to 99` };
    }
    edges.push([from, to, weight]);
  }
  return { edges: dedupeEdges(edges) };
}

const formatEdge = ([a, b, w = 1], weighted) =>
  weighted ? `${a}-${b}:${w}` : `${a}-${b}`;

export const formatEdges = (edges, { weighted = false } = {}) =>
  edges.map((edge) => formatEdge(edge, weighted)).join("\n");

function dedupeEdges(edges) {
  const seen = new Set();
  return edges.filter(([a, b]) => {
    const key = `${a}-${b}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Connected random graph with weights 1-9: a random spanning tree plus a few
 * extra edges. Read as directed (from -> to), it never has a cycle, so it also
 * works for topological sort. Vertex labels are shuffled so the order isn't 0..n.
 */
export function generateGraphEdges(vertices) {
  const edges = [];
  const has = (a, b) =>
    edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  for (let v = 1; v < vertices; v++) edges.push([randomInt(0, v - 1), v]);
  const extra = randomInt(1, Math.max(1, Math.floor(vertices / 2)));
  for (let k = 0; k < extra * 4 && edges.length < vertices - 1 + extra; k++) {
    const a = randomInt(0, vertices - 1);
    const b = randomInt(0, vertices - 1);
    if (a !== b && !has(a, b)) edges.push([Math.min(a, b), Math.max(a, b)]);
  }
  const label = Array.from({ length: vertices }, (_, v) => v);
  for (let i = vertices - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [label[i], label[j]] = [label[j], label[i]];
  }
  return edges
    .map(([a, b]) => [label[a], label[b], randomInt(1, 9)])
    .sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Read the visualizer state from URL search params (invalid parts are ignored). */
export function readParams(params, defaults) {
  const result = { ...defaults };
  const algorithm = params.get("algo");
  if (algorithm) result.algorithm = algorithm;
  const arrayText = params.get("arr");
  if (arrayText) {
    const { values } = parseArray(arrayText);
    if (values) result.array = values;
  }
  const target = Number(params.get("target"));
  if (params.has("target") && Number.isInteger(target)) result.target = target;
  const vertices = Number(params.get("v"));
  if (Number.isInteger(vertices)) {
    result.vertices = clamp(
      vertices,
      GRAPH_LIMITS.minVertices,
      GRAPH_LIMITS.maxVertices,
    );
  }
  const edgesText = params.get("edges");
  if (edgesText) {
    const { edges } = parseEdges(edgesText, result.vertices);
    if (edges) result.edges = edges;
  }
  // Default edges may not fit a smaller vertex count taken from the URL
  if (
    result.edges.some(([a, b]) => a >= result.vertices || b >= result.vertices)
  ) {
    result.edges = generateGraphEdges(result.vertices);
  }
  const start = Number(params.get("start"));
  if (Number.isInteger(start) && start >= 0 && start < result.vertices) {
    result.start = start;
  }
  if (params.has("directed")) result.directed = params.get("directed") === "1";
  return result;
}

export function buildParams({
  algorithm,
  kind,
  array,
  target,
  vertices,
  edges,
  start,
  directed,
}) {
  const params = new URLSearchParams({ algo: algorithm });
  if (kind === "graph") {
    params.set("v", String(vertices));
    params.set("edges", edges.map((edge) => formatEdge(edge, true)).join("_"));
    params.set("start", String(start));
    if (directed) params.set("directed", "1");
  } else {
    params.set("arr", array.join(","));
    if (kind === "search") params.set("target", String(target));
  }
  return params;
}
