// Union-find (disjoint set union) with union by size and path halving.
// State: { parent: number[] } where parent[x] === x marks a root.
// Element ids are "e<index>" so views can highlight them.
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { failure, step } from "./common.js";

const { capacity } = DATA_STRUCTURES["union-find"];
export const elementId = (x) => `e${x}`;
const ids = (...xs) => xs.map(elementId);

/** Size of every root's tree (non-roots map to 0). */
export function treeSizes(parent) {
  const root = (x) => {
    let r = x;
    while (parent[r] !== r) r = parent[r];
    return r;
  };
  const sizes = parent.map(() => 0);
  parent.forEach((_, x) => sizes[root(x)]++);
  return sizes;
}

/** A parent array is valid when every chain of parents ends at a root. */
function isValid(parent) {
  return parent.every((p, x) => {
    if (!Number.isInteger(p) || p < 0 || p >= parent.length) return false;
    let current = x;
    for (let hops = 0; hops <= parent.length; hops++) {
      if (parent[current] === current) return true;
      current = parent[current];
    }
    return false;
  });
}

const outOfRange = (state, x) =>
  !Number.isInteger(x) || x < 0 || x >= state.parent.length;
const rangeError = (state, x) =>
  failure(
    state,
    null,
    state.parent.length
      ? `${x} is not an element. Elements are 0 to ${state.parent.length - 1}.`
      : "There are no elements yet. Use “Add element” first.",
  );

/**
 * find(x) with path halving, recording steps. Returns the root and the
 * updated state (halving changes parents along the way).
 */
function findWithSteps(state, x, steps, lines) {
  let parent = [...state.parent];
  let current = x;
  steps.push(
    step(
      { parent: [...parent] },
      {
        line: lines.start,
        active: ids(current),
        explanation: `find(${x}): start at ${x}`,
      },
    ),
  );
  while (parent[current] !== current) {
    const p = parent[current];
    const grandparent = parent[p];
    if (grandparent !== p) {
      parent = [...parent];
      parent[current] = grandparent;
      steps.push(
        step(
          { parent: [...parent] },
          {
            line: lines.halve,
            swap: ids(current),
            explanation: `Path halving: point ${current} straight to its grandparent ${grandparent}`,
          },
        ),
      );
    }
    current = parent[current];
    steps.push(
      step(
        { parent: [...parent] },
        {
          line: lines.move,
          active: ids(current),
          explanation: `Move up to ${current}`,
        },
      ),
    );
  }
  steps.push(
    step(
      { parent: [...parent] },
      {
        line: lines.done,
        found: ids(current),
        explanation: `${current} is its own parent: the root of ${x}'s set is ${current}`,
      },
    ),
  );
  return { root: current, state: { parent } };
}

const FIND_LINES = { start: 1, halve: 2, move: 3, done: 4 };
// Inside union/connected every find step is part of line 1
const NESTED_LINES = { start: 1, halve: 1, move: 1, done: 1 };

export const unionFind = {
  empty: () => ({ parent: [] }),
  fromValues: (values) => {
    const parent = values.slice(0, capacity);
    return { parent: isValid(parent) ? parent : parent.map((_, x) => x) };
  },
  toValues: (state) => [...state.parent],
  randomValues: () => {
    const parent = Array.from({ length: 8 }, (_, x) => x);
    const root = (x) => (parent[x] === x ? x : root(parent[x]));
    for (let k = 0; k < 4; k++) {
      const a = root(Math.floor(Math.random() * 8));
      const b = root(Math.floor(Math.random() * 8));
      if (a !== b) parent[a] = b;
    }
    return parent;
  },
  operations: {
    add: (state) => {
      if (state.parent.length >= capacity) {
        return failure(state, null, `This demo holds ${capacity} elements.`);
      }
      const x = state.parent.length;
      const next = { parent: [...state.parent, x] };
      return {
        state: next,
        steps: [
          step(next, {
            line: 1,
            found: ids(x),
            explanation: `Add element ${x} as a set of its own (it is its own parent)`,
          }),
        ],
      };
    },
    find: (state, x) => {
      if (outOfRange(state, x)) return rangeError(state, x);
      const steps = [];
      const { root, state: next } = findWithSteps(state, x, steps, FIND_LINES);
      steps.at(-1).output = [root];
      return { state: next, steps };
    },
    union: (state, [a, b]) => {
      for (const x of [a, b])
        if (outOfRange(state, x)) return rangeError(state, x);
      const steps = [];
      const first = findWithSteps(state, a, steps, NESTED_LINES);
      const second = findWithSteps(first.state, b, steps, NESTED_LINES);
      let next = second.state;
      const [ra, rb] = [first.root, second.root];
      if (ra === rb) {
        steps.push(
          step(next, {
            line: 2,
            found: ids(ra),
            explanation: `${a} and ${b} have the same root ${ra}: already in the same set`,
          }),
        );
        return { state: next, steps };
      }
      const sizes = treeSizes(next.parent);
      const [small, large] = sizes[ra] < sizes[rb] ? [ra, rb] : [rb, ra];
      const parent = [...next.parent];
      parent[small] = large;
      next = { parent };
      steps.push(
        step(next, {
          line: 3,
          swap: ids(small),
          active: ids(large),
          explanation: `Tree of ${small} (size ${sizes[small]}) is not bigger than tree of ${large} (size ${sizes[large]}): hang ${small} under ${large}`,
        }),
      );
      steps.push(
        step(next, {
          line: 4,
          found: ids(large),
          explanation: `Merged: the set rooted at ${large} now has ${sizes[small] + sizes[large]} elements`,
        }),
      );
      return { state: next, steps };
    },
    connected: (state, [a, b]) => {
      for (const x of [a, b])
        if (outOfRange(state, x)) return rangeError(state, x);
      const steps = [];
      const first = findWithSteps(state, a, steps, NESTED_LINES);
      const second = findWithSteps(first.state, b, steps, NESTED_LINES);
      const same = first.root === second.root;
      steps.push(
        step(second.state, {
          line: 1,
          ...(same ? { found: ids(a, b) } : { compare: ids(a, b) }),
          output: [same ? "yes" : "no"],
          explanation: same
            ? `Both roots are ${first.root}: ${a} and ${b} are connected`
            : `Roots differ (${first.root} vs ${second.root}): ${a} and ${b} are not connected`,
        }),
      );
      return { state: second.state, steps };
    },
  },
};
