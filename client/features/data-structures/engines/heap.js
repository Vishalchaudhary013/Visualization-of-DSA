// Binary heap engine. State: { items: [{ id, value }], mode: "min" | "max" }
// Items are stored level by level: children of i are 2i+1 and 2i+2.
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { failure, newId, step } from "./common.js";

const beats = (mode, a, b) => (mode === "min" ? a < b : a > b);
const relation = (mode) => (mode === "min" ? "<" : ">");
const swapped = (items, i, j) => {
  const next = [...items];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function insert(state, value) {
  const { mode } = state;
  const capacity = DATA_STRUCTURES.heap.capacity;
  if (state.items.length >= capacity) {
    return failure(
      state,
      null,
      `The heap is full (capacity ${capacity} in this demo). Extract a value first.`,
    );
  }
  const item = { id: newId(), value };
  let items = [...state.items, item];
  let i = items.length - 1;
  const steps = [
    step(
      { mode, items },
      {
        line: 1,
        active: [item.id],
        explanation: `Add ${value} at the end of the array (index ${i}), the next free spot in the tree`,
      },
    ),
  ];
  while (i > 0) {
    const p = Math.floor((i - 1) / 2);
    const parent = items[p];
    if (beats(mode, value, parent.value)) {
      steps.push(
        step(
          { mode, items },
          {
            line: 4,
            compare: [item.id, parent.id],
            explanation: `${value} ${relation(mode)} parent ${parent.value} (index ${p}): it must move up`,
          },
        ),
      );
      items = swapped(items, i, p);
      i = p;
      steps.push(
        step(
          { mode, items },
          {
            line: 4,
            swap: [item.id, parent.id],
            explanation: `Swap ${value} and ${parent.value}; ${value} is now at index ${i}`,
          },
        ),
      );
    } else {
      steps.push(
        step(
          { mode, items },
          {
            line: 5,
            compare: [item.id, parent.id],
            found: [item.id],
            explanation: `${value} does not beat parent ${parent.value}: heap property holds, stop`,
          },
        ),
      );
      return { state: { mode, items }, steps };
    }
  }
  steps.push(
    step(
      { mode, items },
      {
        line: 2,
        found: [item.id],
        explanation: `${value} reached the root: it is the new ${mode === "min" ? "minimum" : "maximum"}`,
      },
    ),
  );
  return { state: { mode, items }, steps };
}

function extract(state) {
  const { mode } = state;
  if (!state.items.length)
    return failure(state, 1, "The heap is empty: nothing to extract.");
  const top = state.items[0];
  const steps = [
    step(state, {
      line: 2,
      active: [top.id],
      explanation: `The top (index 0) is the ${mode === "min" ? "minimum" : "maximum"}: ${top.value}`,
    }),
  ];
  if (state.items.length === 1) {
    const empty = { mode, items: [] };
    steps.push(
      step(empty, {
        line: 8,
        output: [top.value],
        explanation: `It was the only value. Extracted ${top.value}; the heap is empty`,
      }),
    );
    return { state: empty, steps };
  }

  const last = state.items.at(-1);
  let items = [last, ...state.items.slice(1, -1)];
  steps.push(
    step(
      { mode, items },
      {
        line: 3,
        active: [last.id],
        explanation: `Move the last value ${last.value} to the root`,
      },
    ),
  );
  let i = 0;
  for (;;) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left >= items.length) {
      steps.push(
        step(
          { mode, items },
          {
            line: 4,
            found: [last.id],
            explanation: `${last.value} has no children: done sifting down`,
          },
        ),
      );
      break;
    }
    const c =
      right < items.length && beats(mode, items[right].value, items[left].value)
        ? right
        : left;
    const child = items[c];
    const childIds = [
      items[left].id,
      ...(right < items.length ? [items[right].id] : []),
    ];
    if (beats(mode, child.value, last.value)) {
      steps.push(
        step(
          { mode, items },
          {
            line: 6,
            compare: [last.id, ...childIds],
            explanation: `Better child of ${last.value} is ${child.value}, and ${child.value} ${relation(mode)} ${last.value}: swap`,
          },
        ),
      );
      items = swapped(items, i, c);
      i = c;
      steps.push(
        step(
          { mode, items },
          {
            line: 6,
            swap: [last.id, child.id],
            explanation: `Swap ${last.value} and ${child.value}`,
          },
        ),
      );
    } else {
      steps.push(
        step(
          { mode, items },
          {
            line: 7,
            compare: [last.id, ...childIds],
            found: [last.id],
            explanation: `No child beats ${last.value}: heap property holds, stop`,
          },
        ),
      );
      break;
    }
  }
  steps.push(
    step(
      { mode, items },
      { line: 8, output: [top.value], explanation: `Extracted ${top.value}` },
    ),
  );
  return { state: { mode, items }, steps };
}

export const heap = {
  empty: ({ mode = "min" } = {}) => ({ mode, items: [] }),
  // Inserting values in array order rebuilds the same heap when they already form one
  fromValues: (values, { mode = "min" } = {}) =>
    values.reduce((state, value) => insert(state, value).state, {
      mode,
      items: [],
    }),
  toValues: (state) => state.items.map((item) => item.value),
  operations: {
    insert,
    extract,
    peek: (state) => {
      if (!state.items.length)
        return failure(state, 1, "The heap is empty: nothing to peek at.");
      const top = state.items[0];
      return {
        state,
        steps: [
          step(state, {
            line: 2,
            found: [top.id],
            output: [top.value],
            explanation: `The top is ${top.value}, read in O(1) without changing the heap`,
          }),
        ],
      };
    },
  },
};
