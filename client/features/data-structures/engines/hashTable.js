// Hash table with separate chaining.
// State: { buckets: [[{ id, value }], ...] }, hash(x) = x mod m.
// Buckets have stable ids ("bucket-i") so the view can highlight them.
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { failure, newId, step } from "./common.js";

const { capacity, buckets: BUCKETS } = DATA_STRUCTURES["hash-table"];
export const bucketId = (index) => `bucket-${index}`;
const hash = (value) => value % BUCKETS;
const count = (state) =>
  state.buckets.reduce((sum, chain) => sum + chain.length, 0);

function withChain(state, index, chain) {
  const buckets = [...state.buckets];
  buckets[index] = chain;
  return { buckets };
}

const hashStep = (state, value, line = 1) =>
  step(state, {
    line,
    active: [bucketId(hash(value))],
    explanation: `hash(${value}) = ${value} mod ${BUCKETS} = ${hash(value)}: look in bucket ${hash(value)}`,
  });

/** Walks the chain of `value`'s bucket, recording one comparison step per item. */
function scan(state, value, steps, { missLine, hitLine, hitExplanation }) {
  const index = hash(value);
  for (const item of state.buckets[index]) {
    if (item.value === value) {
      steps.push(
        step(state, {
          line: hitLine,
          found: [item.id],
          explanation: hitExplanation(item),
        }),
      );
      return item;
    }
    steps.push(
      step(state, {
        line: missLine,
        compare: [item.id],
        active: [bucketId(index)],
        explanation: `${item.value} ≠ ${value}: check the next item in the chain`,
      }),
    );
  }
  return null;
}

function insertQuietly(state, value) {
  const index = hash(value);
  if (state.buckets[index].some((item) => item.value === value)) return state;
  return withChain(state, index, [
    ...state.buckets[index],
    { id: newId(), value },
  ]);
}

export const hashTable = {
  empty: () => ({ buckets: Array.from({ length: BUCKETS }, () => []) }),
  fromValues: (values) => values.reduce(insertQuietly, hashTable.empty()),
  // Bucket by bucket, chain order kept: re-inserting rebuilds identical chains
  toValues: (state) => state.buckets.flat().map((item) => item.value),
  randomValues: () =>
    Array.from({ length: 8 }, () => Math.floor(Math.random() * 99) + 1),
  operations: {
    insert: (state, value) => {
      if (count(state) >= capacity) {
        return failure(
          state,
          null,
          `This demo table holds ${capacity} values. Delete one first.`,
        );
      }
      const steps = [hashStep(state, value)];
      const existing = scan(state, value, steps, {
        missLine: 3,
        hitLine: 3,
        hitExplanation: () =>
          `${value} is already in bucket ${hash(value)}: nothing to insert`,
      });
      if (existing) return { state, steps };
      const item = { id: newId(), value };
      const index = hash(value);
      const next = withChain(state, index, [...state.buckets[index], item]);
      const length = next.buckets[index].length;
      steps.push(
        step(next, {
          line: 4,
          found: [item.id],
          explanation:
            length === 1
              ? `Bucket ${index} was empty: ${value} is stored there`
              : `Collision: bucket ${index} already had ${length - 1} ${length === 2 ? "value" : "values"}, so ${value} joins its chain`,
        }),
      );
      return { state: next, steps };
    },
    search: (state, value) => {
      const steps = [hashStep(state, value)];
      const found = scan(state, value, steps, {
        missLine: 3,
        hitLine: 3,
        hitExplanation: () => `Found ${value} in bucket ${hash(value)}`,
      });
      if (found) {
        steps.at(-1).output = [value];
      } else {
        steps.push(
          step(state, {
            line: 4,
            active: [bucketId(hash(value))],
            explanation: `End of bucket ${hash(value)}'s chain: ${value} is not in the table`,
          }),
        );
      }
      return { state, steps };
    },
    remove: (state, value) => {
      const steps = [hashStep(state, value)];
      const found = scan(state, value, steps, {
        missLine: 3,
        hitLine: 3,
        hitExplanation: () =>
          `Found ${value}: unlink it from bucket ${hash(value)}`,
      });
      if (!found) {
        steps.push(
          step(state, {
            line: 4,
            active: [bucketId(hash(value))],
            explanation: `${value} is not in the table: nothing to delete`,
          }),
        );
        return { state, steps };
      }
      steps.at(-1).highlight.swap = [found.id];
      steps.at(-1).highlight.found = [];
      const index = hash(value);
      const next = withChain(
        state,
        index,
        state.buckets[index].filter((item) => item.id !== found.id),
      );
      steps.push(step(next, { line: 3, explanation: `Deleted ${value}` }));
      return { state: next, steps };
    },
  },
};
