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

describe("hash table", () => {
  it("chains collisions in the bucket chosen by x mod 7", () => {
    let state = ENGINES["hash-table"].empty();
    for (const v of [3, 10, 17, 5])
      state = run("hash-table", state, "insert", v).state;
    expect(state.buckets[3].map((item) => item.value)).toEqual([3, 10, 17]);
    expect(state.buckets[5].map((item) => item.value)).toEqual([5]);
    // Searching 17 checks 3 and 10 first, then finds it
    const search = run("hash-table", state, "search", 17);
    expect(search.steps.filter((s) => s.highlight.compare.length)).toHaveLength(
      2,
    );
    expect(search.steps.at(-1).output).toEqual([17]);
    expect(
      run("hash-table", state, "search", 24).steps.at(-1).output,
    ).toBeUndefined();
  });

  it("ignores duplicates and deletes from the middle of a chain", () => {
    let state = ENGINES["hash-table"].fromValues([3, 10, 17]);
    expect(
      values("hash-table", run("hash-table", state, "insert", 10).state),
    ).toEqual([3, 10, 17]);
    state = run("hash-table", state, "remove", 10).state;
    expect(values("hash-table", state)).toEqual([3, 17]);
    expect(
      values("hash-table", run("hash-table", state, "remove", 99).state),
    ).toEqual([3, 17]);
  });

  it("round-trips through values", () => {
    const state = ENGINES["hash-table"].fromValues([15, 22, 8, 29, 4, 36]);
    const again = ENGINES["hash-table"].fromValues(values("hash-table", state));
    expect(again.buckets.map((b) => b.map((i) => i.value))).toEqual(
      state.buckets.map((b) => b.map((i) => i.value)),
    );
  });
});

describe("trie", () => {
  const words = ["car", "card", "care", "cat", "dog"];
  const nodeCount = (state) => Object.keys(state.nodes).length;

  it("shares prefixes", () => {
    let state = ENGINES.trie.empty();
    for (const w of words) state = run("trie", state, "insert", w).state;
    // root + c,a,r,d,e,t + d,o,g
    expect(nodeCount(state)).toBe(10);
    expect(values("trie", state)).toEqual([
      "car",
      "card",
      "care",
      "cat",
      "dog",
    ]);
  });

  it("tells words from prefixes", () => {
    const state = ENGINES.trie.fromValues(words);
    expect(run("trie", state, "search", "car").steps.at(-1).output).toEqual([
      "car",
    ]);
    expect(
      run("trie", state, "search", "ca").steps.at(-1).output,
    ).toBeUndefined();
    expect(
      run("trie", state, "search", "cow").steps.at(-1).explanation,
    ).toMatch(/No 'o' child/);
    expect(run("trie", state, "startsWith", "car").steps.at(-1).output).toEqual(
      ["car", "card", "care"],
    );
    expect(
      run("trie", state, "startsWith", "x").steps.at(-1).output,
    ).toBeUndefined();
  });

  it("deletes and prunes only unused nodes", () => {
    let state = ENGINES.trie.fromValues(words);
    state = run("trie", state, "remove", "card").state; // prunes 'd'
    expect(nodeCount(state)).toBe(9);
    state = run("trie", state, "remove", "car").state; // 'r' still used by "care"
    expect(nodeCount(state)).toBe(9);
    expect(values("trie", state)).toEqual(["care", "cat", "dog"]);
    state = run("trie", state, "remove", "dog").state; // prunes g, o, d
    expect(nodeCount(state)).toBe(6);
    expect(values("trie", run("trie", state, "remove", "zebra").state)).toEqual(
      ["care", "cat"],
    );
  });

  it("does not mutate earlier states", () => {
    const before = ENGINES.trie.fromValues(words);
    const snapshot = JSON.stringify(before);
    run("trie", before, "remove", "card");
    run("trie", before, "insert", "cards");
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});

describe("union-find", () => {
  const root = (parent, x) => (parent[x] === x ? x : root(parent, parent[x]));

  it("unions sets and answers connectivity", () => {
    let state = ENGINES["union-find"].fromValues([0, 1, 2, 3, 4, 5]);
    state = run("union-find", state, "union", [0, 1]).state;
    state = run("union-find", state, "union", [2, 3]).state;
    state = run("union-find", state, "union", [1, 3]).state;
    expect(
      run("union-find", state, "connected", [0, 2]).steps.at(-1).output,
    ).toEqual(["yes"]);
    expect(
      run("union-find", state, "connected", [0, 5]).steps.at(-1).output,
    ).toEqual(["no"]);
    const sets = new Set(state.parent.map((_, x) => root(state.parent, x)));
    expect(sets.size).toBe(3); // {0,1,2,3}, {4}, {5}
  });

  it("hangs the smaller tree under the larger one", () => {
    // Set of 3 rooted at 0, single element 3
    const state = ENGINES["union-find"].fromValues([0, 0, 0, 3]);
    const next = run("union-find", state, "union", [3, 1]).state;
    expect(next.parent[3]).toBe(0);
  });

  it("find returns the root and halves the path", () => {
    // Chain 4 -> 3 -> 2 -> 1 -> 0
    const state = ENGINES["union-find"].fromValues([0, 0, 1, 2, 3]);
    const result = run("union-find", state, "find", 4);
    expect(result.steps.at(-1).output).toEqual([0]);
    expect(result.state.parent[4]).toBe(2); // pointed at its grandparent
    expect(root(result.state.parent, 4)).toBe(0);
  });

  it("adds elements, rejects unknown ones and invalid parent arrays", () => {
    let state = ENGINES["union-find"].empty();
    state = run("union-find", state, "add").state;
    state = run("union-find", state, "add").state;
    expect(state.parent).toEqual([0, 1]);
    expect(run("union-find", state, "find", 5).steps[0].error).toBe(true);
    // 0 -> 1 -> 0 is a cycle: fall back to singletons
    expect(ENGINES["union-find"].fromValues([1, 0]).parent).toEqual([0, 1]);
  });
});
