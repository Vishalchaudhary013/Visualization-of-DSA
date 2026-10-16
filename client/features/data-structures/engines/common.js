// Shared helpers for data structure engines.
//
// Every engine exposes:
//   empty(options)          -> state
//   fromValues(values, opt) -> state (rebuilt without animation, for URLs/history)
//   toValues(state)         -> number[] (round-trips through fromValues)
//   operations[name](state, value) -> { state, steps }
//
// A step is a snapshot the views render:
// {
//   state,                      structure at this moment
//   highlight: { compare, swap, found, active }   ids of items to colour
//   line,                       0-based line in the operation's pseudocode
//   explanation,                plain-language description
//   error,                      true for overflow/underflow/empty errors
//   output,                     values produced so far (traversals, pop/peek)
// }

let sequence = 0;
/** Stable id per item so views can animate items as they move. */
export const newId = () => `n${++sequence}`;

export function step(
  state,
  { line = null, explanation, error = false, output, ...highlight },
) {
  return {
    state,
    highlight: {
      compare: highlight.compare ?? [],
      swap: highlight.swap ?? [],
      found: highlight.found ?? [],
      active: highlight.active ?? [],
    },
    line,
    explanation,
    error,
    output,
  };
}

/** Result for an operation that cannot run (e.g. pop on an empty stack). */
export const failure = (state, line, explanation) => ({
  state,
  steps: [step(state, { line, explanation, error: true })],
});
