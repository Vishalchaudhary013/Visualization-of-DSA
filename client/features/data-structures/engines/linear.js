// Stack and queue engines. State: { items: [{ id, value }] }
// Stack items are ordered bottom -> top, queue items front -> rear.
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { failure, newId, step } from "./common.js";

const toItems = (values) => values.map((value) => ({ id: newId(), value }));
const shared = {
  empty: () => ({ items: [] }),
  fromValues: (values) => ({ items: toItems(values) }),
  toValues: (state) => state.items.map((item) => item.value),
};

function add(state, value, { capacity, name, where }) {
  if (state.items.length >= capacity) {
    return failure(
      state,
      1,
      `The ${name} is full (capacity ${capacity}): overflow. Remove an item first.`,
    );
  }
  const item = { id: newId(), value };
  const next = { items: [...state.items, item] };
  return {
    state: next,
    steps: [
      step(state, {
        line: 1,
        explanation: `Size ${state.items.length} < capacity ${capacity}, so there is room`,
      }),
      step(next, {
        line: 3,
        found: [item.id],
        explanation: `${value} is placed at the ${where}`,
      }),
    ],
  };
}

export const stack = {
  ...shared,
  operations: {
    push: (state, value) =>
      add(state, value, {
        capacity: DATA_STRUCTURES.stack.capacity,
        name: "stack",
        where: "top",
      }),
    pop: (state) => {
      if (!state.items.length)
        return failure(
          state,
          1,
          "The stack is empty: underflow. Push something first.",
        );
      const top = state.items.at(-1);
      const next = { items: state.items.slice(0, -1) };
      return {
        state: next,
        steps: [
          step(state, {
            line: 2,
            active: [top.id],
            explanation: `Read the top value: ${top.value}`,
          }),
          step(next, {
            line: 4,
            output: [top.value],
            explanation: `Remove it; the top moves down. Popped ${top.value}`,
          }),
        ],
      };
    },
    peek: (state) => {
      if (!state.items.length)
        return failure(state, 1, "The stack is empty: nothing to peek at.");
      const top = state.items.at(-1);
      return {
        state,
        steps: [
          step(state, {
            line: 2,
            found: [top.id],
            output: [top.value],
            explanation: `The top value is ${top.value} (the stack is unchanged)`,
          }),
        ],
      };
    },
  },
};

export const queue = {
  ...shared,
  operations: {
    enqueue: (state, value) =>
      add(state, value, {
        capacity: DATA_STRUCTURES.queue.capacity,
        name: "queue",
        where: "rear",
      }),
    dequeue: (state) => {
      if (!state.items.length)
        return failure(
          state,
          1,
          "The queue is empty: underflow. Enqueue something first.",
        );
      const front = state.items[0];
      const next = { items: state.items.slice(1) };
      return {
        state: next,
        steps: [
          step(state, {
            line: 2,
            active: [front.id],
            explanation: `Read the front value: ${front.value}`,
          }),
          step(next, {
            line: 4,
            output: [front.value],
            explanation: `Remove it; the next item becomes the front. Dequeued ${front.value}`,
          }),
        ],
      };
    },
    peek: (state) => {
      if (!state.items.length)
        return failure(state, 1, "The queue is empty: nothing to peek at.");
      const front = state.items[0];
      return {
        state,
        steps: [
          step(state, {
            line: 2,
            found: [front.id],
            output: [front.value],
            explanation: `The front value is ${front.value} (the queue is unchanged)`,
          }),
        ],
      };
    },
  },
};
