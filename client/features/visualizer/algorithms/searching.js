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

export function jumpSearch(input, target) {
  const { array, steps, ops, sorted, record } = createRecorder(input);
  const n = array.length;
  const block = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0;
  let end = Math.min(block, n);
  record({
    line: 1,
    range: [0, n - 1],
    explanation: `The array is sorted. Jump ahead in blocks of √${n} ≈ ${block}`,
  });

  while (n && array[end - 1] < target) {
    ops.comparisons++;
    ops.reads++;
    record({
      comparisons: [end - 1],
      marker: end - 1,
      range: [prev, end - 1],
      line: 2,
      explanation: `Block end arr[${end - 1}] = ${array[end - 1]} < ${target}: the target is further right`,
    });
    prev = end;
    end = Math.min(end + block, n);
    if (prev >= n) {
      record({
        line: 4,
        explanation: `Jumped past the end: ${target} is bigger than every value, not in the array`,
      });
      return steps;
    }
    record({
      range: [prev, end - 1],
      line: 3,
      explanation: `Jump to the next block [${prev}..${end - 1}]`,
    });
  }
  if (n) {
    ops.comparisons++;
    ops.reads++;
    record({
      comparisons: [end - 1],
      marker: end - 1,
      range: [prev, end - 1],
      line: 2,
      explanation: `Block end arr[${end - 1}] = ${array[end - 1]} ≥ ${target}: if present, it is in [${prev}..${end - 1}]`,
    });
  }

  for (let i = prev; i < end; i++) {
    ops.comparisons++;
    ops.reads++;
    if (array[i] === target) {
      sorted.add(i);
      record({
        comparisons: [i],
        swaps: [i],
        range: [prev, end - 1],
        line: 6,
        explanation: `arr[${i}] = ${target}. Found at index ${i} after ${ops.comparisons} comparisons.`,
      });
      return steps;
    }
    record({
      comparisons: [i],
      range: [prev, end - 1],
      line: 6,
      explanation: `arr[${i}] = ${array[i]} ≠ ${target}: step forward inside the block`,
    });
  }
  record({
    line: 7,
    explanation: `Searched the whole block: ${target} is not in the array`,
  });
  return steps;
}

export function interpolationSearch(input, target) {
  const { array, steps, ops, sorted, record } = createRecorder(input);
  let low = 0;
  let high = array.length - 1;
  record({
    line: 1,
    range: [low, high],
    explanation: `The array is sorted. Guess where ${target} should be from its value, like opening a dictionary near the right letter`,
  });

  while (low <= high && target >= array[low] && target <= array[high]) {
    const span = array[high] - array[low];
    const pos =
      span === 0
        ? low
        : low + Math.floor(((target - array[low]) * (high - low)) / span);
    ops.comparisons++;
    ops.reads += 3;
    record({
      comparisons: [pos],
      marker: pos,
      range: [low, high],
      line: 3,
      explanation:
        span === 0
          ? `All values in [${low}..${high}] are equal: check index ${pos}`
          : `pos = ${low} + (${target} − ${array[low]}) × (${high} − ${low}) / (${array[high]} − ${array[low]}) = ${pos}, arr[pos] = ${array[pos]}`,
    });
    if (array[pos] === target) {
      sorted.add(pos);
      record({
        comparisons: [pos],
        swaps: [pos],
        marker: pos,
        range: [pos, pos],
        line: 4,
        explanation: `arr[${pos}] = ${target}. Found at index ${pos} after ${ops.comparisons} ${ops.comparisons === 1 ? "guess" : "guesses"}.`,
      });
      return steps;
    }
    if (array[pos] < target) {
      low = pos + 1;
      record({
        marker: pos,
        range: low <= high ? [low, high] : null,
        line: 5,
        explanation: `${array[pos]} < ${target}: search right of the guess, [${low}..${high}]`,
      });
    } else {
      high = pos - 1;
      record({
        marker: pos,
        range: low <= high ? [low, high] : null,
        line: 6,
        explanation: `${array[pos]} > ${target}: search left of the guess, [${low}..${high}]`,
      });
    }
  }

  record({
    line: 7,
    explanation: `${target} is outside the remaining range: not in the array`,
  });
  return steps;
}
