import { describe, expect, it } from "vitest";
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { ENGINES } from "./index.js";

const lineCount = (id, op) =>
  DATA_STRUCTURES[id].operations[op].pseudoCode.split("\n").length;

/** Runs an operation and checks every step is well formed. */
function run(id, state, op, value) {
  const result = ENGINES[id].operations[op](state, value);
  expect(result.steps.length).toBeGreaterThan(0);
  for (const s of result.steps) {
    expect(s.explanation).toBeTruthy();
    if (s.line !== null) {
      expect(s.line).toBeGreaterThanOrEqual(0);
      expect(s.line).toBeLessThan(lineCount(id, op));
    }
  }
  // The last step always shows the resulting structure
  expect(result.steps.at(-1).state).toEqual(result.state);
  return result;
}

const values = (id, state) => ENGINES[id].toValues(state);

describe("every data structure has an engine and matching operations", () => {
  it.each(Object.keys(DATA_STRUCTURES))("%s", (id) => {
    expect(ENGINES[id]).toBeDefined();
    expect(Object.keys(ENGINES[id].operations).sort()).toEqual(
      Object.keys(DATA_STRUCTURES[id].operations).sort(),
    );
  });
});

describe("stack", () => {
  it("is last-in, first-out", () => {
    let state = ENGINES.stack.empty();
    for (const v of [1, 2, 3]) state = run("stack", state, "push", v).state;
    expect(values("stack", state)).toEqual([1, 2, 3]);
    expect(run("stack", state, "peek").steps.at(-1).output).toEqual([3]);
    const popped = run("stack", state, "pop");
    expect(popped.steps.at(-1).output).toEqual([3]);
    expect(values("stack", popped.state)).toEqual([1, 2]);
  });

  it("reports underflow and overflow without changing the state", () => {
    const empty = ENGINES.stack.empty();
    const underflow = run("stack", empty, "pop");
    expect(underflow.steps[0].error).toBe(true);
    expect(underflow.state).toBe(empty);
    const full = ENGINES.stack.fromValues(
      Array.from({ length: DATA_STRUCTURES.stack.capacity }, (_, i) => i),
    );
    expect(run("stack", full, "push", 99).steps[0].error).toBe(true);
  });
});

describe("queue", () => {
  it("is first-in, first-out", () => {
    let state = ENGINES.queue.fromValues([1, 2]);
    state = run("queue", state, "enqueue", 3).state;
    const out = run("queue", state, "dequeue");
    expect(out.steps.at(-1).output).toEqual([1]);
    expect(values("queue", out.state)).toEqual([2, 3]);
  });
});

const isHeap = (items, mode) =>
  items.every((item, i) => {
    if (i === 0) return true;
    const parent = items[Math.floor((i - 1) / 2)].value;
    return mode === "min" ? parent <= item.value : parent >= item.value;
  });

describe.each(["min", "max"])("%s-heap", (mode) => {
  const input = [42, 7, 19, 3, 88, 25, 7, 61, 14, 50];

  it("keeps the heap property after every insert and extract", () => {
    let state = ENGINES.heap.empty({ mode });
    for (const v of input) {
      state = run("heap", state, "insert", v).state;
      expect(isHeap(state.items, mode)).toBe(true);
    }
    const sorted = [...input].sort((a, b) => (mode === "min" ? a - b : b - a));
    const extracted = [];
    while (state.items.length) {
      const result = run("heap", state, "extract");
      extracted.push(result.steps.at(-1).output[0]);
      state = result.state;
      expect(isHeap(state.items, mode)).toBe(true);
    }
    expect(extracted).toEqual(sorted);
  });

  it("round-trips through values", () => {
    const state = ENGINES.heap.fromValues(input, { mode });
    const rebuilt = ENGINES.heap.fromValues(values("heap", state), { mode });
    expect(values("heap", rebuilt)).toEqual(values("heap", state));
  });

  it("sifts up in O(log n) swaps", () => {
    const state = ENGINES.heap.fromValues([10, 20, 30, 40, 50, 60, 70], {
      mode: "min",
    });
    const steps = run("heap", state, "insert", 1).steps;
    expect(steps.filter((s) => s.highlight.swap.length).length).toBe(3);
  });
});

describe("linked list", () => {
  it("inserts at head and tail, searches and deletes", () => {
    let state = ENGINES["linked-list"].fromValues([2, 3]);
    state = run("linked-list", state, "insertHead", 1).state;
    state = run("linked-list", state, "insertTail", 4).state;
    expect(values("linked-list", state)).toEqual([1, 2, 3, 4]);
    expect(run("linked-list", state, "search", 3).steps.at(-1).output).toEqual([
      2,
    ]);
    expect(run("linked-list", state, "search", 9).steps.at(-1).output).toEqual([
      -1,
    ]);
    state = run("linked-list", state, "remove", 1).state; // head
    state = run("linked-list", state, "remove", 3).state; // middle
    expect(values("linked-list", state)).toEqual([2, 4]);
    expect(
      values("linked-list", run("linked-list", state, "remove", 9).state),
    ).toEqual([2, 4]);
  });

  it("walks every node to reach the tail", () => {
    const state = ENGINES["linked-list"].fromValues([1, 2, 3, 4]);
    const steps = run("linked-list", state, "insertTail", 5).steps;
    expect(steps.filter((s) => s.line === 4)).toHaveLength(3);
  });
});

describe("binary search tree", () => {
  const input = [50, 30, 70, 20, 40, 60, 80, 35, 45, 65];
  const inorder = (state) => run("bst", state, "inorder").steps.at(-1).output;

  it("keeps values ordered and traverses correctly", () => {
    let state = ENGINES.bst.empty();
    for (const v of input) state = run("bst", state, "insert", v).state;
    expect(inorder(state)).toEqual([...input].sort((a, b) => a - b));
    expect(run("bst", state, "preorder").steps.at(-1).output).toEqual([
      50, 30, 20, 40, 35, 45, 70, 60, 65, 80,
    ]);
    expect(run("bst", state, "postorder").steps.at(-1).output).toEqual([
      20, 35, 45, 40, 30, 65, 60, 80, 70, 50,
    ]);
  });

  it("ignores duplicates", () => {
    const state = ENGINES.bst.fromValues(input);
    expect(values("bst", run("bst", state, "insert", 40).state)).toEqual(
      values("bst", state),
    );
  });

  it("searches along one path", () => {
    const state = ENGINES.bst.fromValues(input);
    const found = run("bst", state, "search", 45);
    expect(found.steps).toHaveLength(4); // 50 -> 30 -> 40 -> 45
    expect(found.steps.at(-1).output).toEqual([45]);
    expect(run("bst", state, "search", 99).steps.at(-1).output).toBeUndefined();
  });

  it.each([
    [20, "leaf"],
    [60, "one child"],
    [30, "two children"],
    [50, "the root"],
  ])("deletes %i (%s) and stays a valid BST", (value) => {
    const state = run(
      "bst",
      ENGINES.bst.fromValues(input),
      "remove",
      value,
    ).state;
    const expected = input.filter((v) => v !== value).sort((a, b) => a - b);
    expect(inorder(state)).toEqual(expected);
    expect(Object.keys(state.nodes)).toHaveLength(input.length - 1);
  });

  it("does not mutate earlier states", () => {
    const before = ENGINES.bst.fromValues(input);
    const snapshot = JSON.stringify(before);
    run("bst", before, "remove", 30);
    run("bst", before, "insert", 33);
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it("round-trips its shape through pre-order values", () => {
    const state = ENGINES.bst.fromValues(input);
    expect(values("bst", ENGINES.bst.fromValues(values("bst", state)))).toEqual(
      values("bst", state),
    );
  });
});
