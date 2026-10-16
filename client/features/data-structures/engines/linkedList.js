// Singly linked list engine. State: { items: [{ id, value }] } ordered head -> tail.
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { failure, newId, step } from "./common.js";

const capacity = DATA_STRUCTURES["linked-list"].capacity;
const isFull = (state) => state.items.length >= capacity;
const fullMessage = `The list is limited to ${capacity} nodes in this demo. Delete one first.`;

export const linkedList = {
  empty: () => ({ items: [] }),
  fromValues: (values) => ({
    items: values.map((value) => ({ id: newId(), value })),
  }),
  toValues: (state) => state.items.map((item) => item.value),
  operations: {
    insertHead: (state, value) => {
      if (isFull(state)) return failure(state, null, fullMessage);
      const node = { id: newId(), value };
      const next = { items: [node, ...state.items] };
      const oldHead = state.items[0];
      return {
        state: next,
        steps: [
          step(next, {
            line: 1,
            active: [node.id],
            explanation: `Create a new node holding ${value}`,
          }),
          step(next, {
            line: 2,
            active: [node.id],
            compare: oldHead ? [oldHead.id] : [],
            explanation: oldHead
              ? `Point its next to the old head (${oldHead.value})`
              : "The list was empty, so its next is null",
          }),
          step(next, {
            line: 3,
            found: [node.id],
            explanation: `head now points to ${value}. Done in O(1)`,
          }),
        ],
      };
    },
    insertTail: (state, value) => {
      if (isFull(state)) return failure(state, null, fullMessage);
      const node = { id: newId(), value };
      const next = { items: [...state.items, node] };
      if (!state.items.length) {
        return {
          state: next,
          steps: [
            step(next, {
              line: 2,
              found: [node.id],
              explanation: `The list was empty: ${value} becomes the head`,
            }),
          ],
        };
      }
      const steps = [
        step(state, {
          line: 3,
          active: [state.items[0].id],
          explanation: "Start at the head",
        }),
      ];
      for (let i = 0; i < state.items.length - 1; i++) {
        steps.push(
          step(state, {
            line: 4,
            active: [state.items[i + 1].id],
            explanation: `${state.items[i].value}.next is not null: move to ${state.items[i + 1].value}`,
          }),
        );
      }
      const last = state.items.at(-1);
      steps.push(
        step(next, {
          line: 5,
          compare: [last.id],
          found: [node.id],
          explanation: `${last.value} is the last node: link it to the new node ${value}`,
        }),
      );
      return { state: next, steps };
    },
    search: (state, value) => {
      const steps = [];
      for (let i = 0; i < state.items.length; i++) {
        const node = state.items[i];
        if (node.value === value) {
          steps.push(
            step(state, {
              line: 3,
              found: [node.id],
              output: [i],
              explanation: `${node.value} == ${value}: found at position ${i} after ${i + 1} ${i ? "checks" : "check"}`,
            }),
          );
          return { state, steps };
        }
        steps.push(
          step(state, {
            line: 4,
            compare: [node.id],
            explanation: `${node.value} ≠ ${value}: move to the next node`,
          }),
        );
      }
      steps.push(
        step(state, {
          line: 5,
          output: [-1],
          explanation: `Reached null: ${value} is not in the list`,
        }),
      );
      return { state, steps };
    },
    remove: (state, value) => {
      if (!state.items.length)
        return failure(state, 1, "The list is empty: nothing to delete.");
      const index = state.items.findIndex((item) => item.value === value);
      const steps = [];
      for (let i = 0; i < (index === -1 ? state.items.length : index); i++) {
        steps.push(
          step(state, {
            line: i === 0 ? 1 : 4,
            compare: [state.items[i].id],
            explanation: `${state.items[i].value} ≠ ${value}: keep walking`,
          }),
        );
      }
      if (index === -1) {
        steps.push(
          step(state, {
            line: 6,
            explanation: `Reached the end: ${value} is not in the list`,
          }),
        );
        return { state, steps };
      }
      const target = state.items[index];
      const next = {
        items: state.items.filter((item) => item.id !== target.id),
      };
      const previous = state.items[index - 1];
      steps.push(
        step(state, {
          line: index === 0 ? 1 : 5,
          swap: [target.id],
          explanation:
            index === 0
              ? `The head holds ${value}: move head to the next node`
              : `Found ${value}: link ${previous.value} past it`,
        }),
      );
      steps.push(
        step(next, {
          line: index === 0 ? 1 : 5,
          explanation: `Deleted ${value}`,
        }),
      );
      return { state: next, steps };
    },
  },
};
