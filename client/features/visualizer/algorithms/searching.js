// Step generators for the searching algorithms. A found value is marked in
// `sorted` (and `swaps`) on the final step so the summary panel can read it.
import { createRecorder } from "./recorder.js";

export function linearSearch(input, target) {
  const { array, steps, ops, sorted, record } = createRecorder(input);
  record({
    explanation: `Look for ${target} by checking each of the ${array.length} values in order`,
  });

  for (let i = 0; i < array.length; i++) {
    ops.comparisons++;
    ops.reads++;
    if (array[i] === target) {
      sorted.add(i);
      record({
        comparisons: [i],
        swaps: [i],
        line: 2,
        explanation: `arr[${i}] = ${array[i]} matches the target. Found at index ${i} after ${ops.comparisons} comparisons.`,
      });
      return steps;
    }
    record({
      comparisons: [i],
      line: 1,
      explanation: `arr[${i}] = ${array[i]} ≠ ${target}: move to the next index`,
    });
  }

  record({
    line: 3,
    explanation: `Checked all ${array.length} values: ${target} is not in the array`,
  });
  return steps;
}

export function binarySearch(input, target) {
  const { array, steps, ops, sorted, record } = createRecorder(input);
  let left = 0;
  let right = array.length - 1;
  record({
    range: [left, right],
    line: 0,
    explanation: `The array is sorted. Search for ${target} in the range [${left}..${right}]`,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    ops.comparisons++;
    ops.reads++;
    record({
      comparisons: [mid],
      marker: mid,
      range: [left, right],
      line: 2,
      explanation: `mid = (${left} + ${right}) / 2 = ${mid}, arr[mid] = ${array[mid]}`,
    });
    if (array[mid] === target) {
      sorted.add(mid);
      record({
        comparisons: [mid],
        swaps: [mid],
        marker: mid,
        range: [mid, mid],
        line: 4,
        explanation: `arr[${mid}] = ${target}. Found at index ${mid} after ${ops.comparisons} comparisons.`,
      });
      return steps;
    }
    if (array[mid] < target) {
      left = mid + 1;
      record({
        comparisons: [mid],
        marker: mid,
        range: left <= right ? [left, right] : null,
        line: 6,
        explanation: `${array[mid]} < ${target}: discard the left half, new range [${left}..${right}]`,
      });
    } else {
      right = mid - 1;
      record({
        comparisons: [mid],
        marker: mid,
        range: left <= right ? [left, right] : null,
        line: 8,
        explanation: `${array[mid]} > ${target}: discard the right half, new range [${left}..${right}]`,
      });
    }
  }

  record({
    range: null,
    line: 9,
    explanation: `The range is empty: ${target} is not in the array`,
  });
  return steps;
}
