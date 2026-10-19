import { describe, expect, it } from "vitest";
import { askAssistant } from "../controllers/assistant.controller.js";

function ask(question, algorithmId) {
  let body;
  const res = {
    status: () => res,
    json: (value) => {
      body = value;
      return res;
    },
  };
  askAssistant({ body: { question, algorithmId } }, res);
  return body;
}

describe("assistant", () => {
  it.each([
    ["explain quick sort", "quick-sort"],
    ["how does a trie work", "trie"],
    ["what is the sliding window technique", "sliding-window"],
    ["explain two pointer", "two-pointers"],
    ["fast and slow pointer trick", "fast-slow-pointers"],
    ["kadane", "kadane"],
    ["dijkstra", "dijkstra"],
  ])("%s -> %s", (question, id) => {
    expect(ask(question).matchedIds[0]).toBe(id);
  });

  it("answers single-word structure names as data structures", () => {
    expect(ask("explain stack").matchedIds).toEqual(["stack"]);
  });

  it("mentions the interactive problem of a pattern", () => {
    expect(ask("prefix sum").reply).toMatch(/Subarray Sum Equals K/);
  });

  it("falls back to the topic on screen", () => {
    expect(ask("how does this work?", "heap-sort").matchedIds).toEqual([
      "heap-sort",
    ]);
  });
});
