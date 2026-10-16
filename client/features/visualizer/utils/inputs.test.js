import { describe, expect, it } from "vitest";
import {
  buildParams,
  generateGraphEdges,
  parseArray,
  parseEdges,
  readParams,
} from "./inputs.js";

describe("parseArray", () => {
  it("accepts commas and spaces", () => {
    expect(parseArray("5, 2 8,1")).toEqual({ values: [5, 2, 8, 1] });
  });

  it.each([
    ["5", /at least 2/],
    ["5, x, 8", /"x" is not a whole number/],
    ["5, 2.5", /"2.5" is not a whole number/],
    ["5, 1000", /out of range/],
    [Array.from({ length: 51 }, () => 1).join(","), /at most 50/],
  ])("rejects %s", (text, message) => {
    expect(parseArray(text).error).toMatch(message);
  });
});

describe("parseEdges", () => {
  it("accepts 0-1, 0,1, weights and several edges on one line", () => {
    expect(parseEdges("0-1\n1,2\n2-3:7, 3-0:12\n0 2 5", 4)).toEqual({
      edges: [
        [0, 1, 1],
        [1, 2, 1],
        [2, 3, 7],
        [3, 0, 12],
        [0, 2, 5],
      ],
    });
  });

  it("removes duplicates", () => {
    expect(parseEdges("0-1\n0-1:4", 2).edges).toEqual([[0, 1, 1]]);
  });

  it.each([
    ["0-5", 3, /vertex above 2/],
    ["1-1", 3, /self-loop/],
    ["a-b", 3, /not an edge/],
    ["0-1:0", 3, /must be 1 to 99/],
    ["0-1:100", 3, /must be 1 to 99/],
  ])("rejects %s", (text, vertices, message) => {
    expect(parseEdges(text, vertices).error).toMatch(message);
  });
});

describe("generateGraphEdges", () => {
  it("makes a connected graph with weights 1-9 that is acyclic when directed", () => {
    for (let vertices = 2; vertices <= 10; vertices++) {
      const edges = generateGraphEdges(vertices);
      expect(edges.every(([, , w]) => w >= 1 && w <= 9)).toBe(true);
      // Kahn's algorithm consumes every vertex only if there is no cycle
      const indegree = Array(vertices).fill(0);
      for (const [, b] of edges) indegree[b]++;
      const queue = indegree.flatMap((d, v) => (d ? [] : [v]));
      let seen = 0;
      while (queue.length) {
        const u = queue.shift();
        seen++;
        for (const [a, b] of edges)
          if (a === u && --indegree[b] === 0) queue.push(b);
      }
      expect(seen).toBe(vertices);
    }
  });
});

describe("URL params", () => {
  const defaults = {
    algorithm: "bubble-sort",
    array: [1, 2],
    target: 1,
    vertices: 5,
    edges: [[0, 1]],
    start: 0,
    directed: false,
  };

  it("round-trips an array setup", () => {
    const params = buildParams({
      ...defaults,
      algorithm: "binary-search",
      kind: "search",
      array: [4, 8, 15],
      target: 8,
    });
    expect(readParams(params, defaults)).toMatchObject({
      algorithm: "binary-search",
      array: [4, 8, 15],
      target: 8,
    });
  });

  it("round-trips a graph setup", () => {
    const graph = {
      vertices: 4,
      edges: [
        [0, 1, 4],
        [1, 3, 1],
      ],
      start: 3,
      directed: true,
    };
    const params = buildParams({
      ...defaults,
      ...graph,
      algorithm: "dfs",
      kind: "graph",
    });
    expect(readParams(params, defaults)).toMatchObject({
      algorithm: "dfs",
      ...graph,
    });
  });

  it("ignores invalid values", () => {
    const params = new URLSearchParams("arr=1,x&v=99&start=50&edges=0-12");
    const result = readParams(params, defaults);
    expect(result.array).toEqual(defaults.array);
    expect(result.vertices).toBe(10);
    expect(result.start).toBe(0);
    expect(result.edges).toEqual(defaults.edges);
  });

  it("regenerates default edges that do not fit the vertex count", () => {
    const result = readParams(new URLSearchParams("v=2"), {
      ...defaults,
      edges: [[3, 4, 1]],
    });
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].slice(0, 2).sort()).toEqual([0, 1]);
  });
});
