import { describe, expect, it } from "vitest";
import { buildParams, parseArray, parseEdges, readParams } from "./inputs.js";

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
  it("accepts 0-1, 0,1 and several edges on one line", () => {
    expect(parseEdges("0-1\n1,2\n2-3, 3-0", 4)).toEqual({
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
    });
  });

  it("removes duplicates", () => {
    expect(parseEdges("0-1\n0-1", 2).edges).toEqual([[0, 1]]);
  });

  it.each([
    ["0-5", 3, /vertex above 2/],
    ["1-1", 3, /self-loop/],
    ["a-b", 3, /not an edge/],
  ])("rejects %s", (text, vertices, message) => {
    expect(parseEdges(text, vertices).error).toMatch(message);
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
        [0, 1],
        [1, 3],
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
      edges: [[3, 4]],
    });
    expect(result.edges).toEqual([[0, 1]]);
  });
});
