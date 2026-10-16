// Shared helper for array-based step generators (sorting + searching).
// Every recorded step is a snapshot the canvas, panels and pseudocode view read:
// {
//   state:       array values at this moment
//   comparisons: indices being compared (pairs for sorting)
//   swaps:       indices just written / swapped / found
//   sorted:      indices that are in their final position
//   marker:      one highlighted index (pivot, current min, key, mid)
//   range:       [start, end] active sub-range; values outside it are dimmed
//   line:        0-based pseudocode line that is executing (null = none)
//   explanation: plain-language description of the step
//   operations:  running totals { comparisons, swaps, reads, writes }
// }
export function createRecorder(input) {
  const array = [...input];
  const steps = [];
  const ops = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };
  const sorted = new Set();

  const record = ({
    comparisons = [],
    swaps = [],
    marker = null,
    range = null,
    line = null,
    explanation,
  }) => {
    steps.push({
      state: [...array],
      comparisons,
      swaps,
      sorted: [...sorted].sort((a, b) => a - b),
      marker,
      range,
      line,
      explanation,
      operations: { ...ops },
    });
  };

  const swap = (i, j) => {
    [array[i], array[j]] = [array[j], array[i]];
    ops.swaps++;
    ops.reads += 2;
    ops.writes += 2;
  };

  return { array, steps, ops, sorted, record, swap };
}
