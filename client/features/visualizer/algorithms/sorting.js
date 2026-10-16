// Step generators for the sorting algorithms. `line` values index into the
// matching `pseudoCode` in shared/algorithms.js.
import { createRecorder } from "./recorder.js";

function recordStart(record, array) {
  record({
    explanation: `Start with ${array.length} values: [${array.join(", ")}]`,
  });
}

function recordDone(record, sorted, array, ops) {
  array.forEach((_, index) => sorted.add(index));
  record({
    explanation: `Sorted! ${ops.comparisons} comparisons and ${ops.swaps} swaps.`,
  });
}

export function bubbleSort(input) {
  const { array, steps, ops, sorted, record, swap } = createRecorder(input);
  const n = array.length;
  recordStart(record, array);

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      ops.comparisons++;
      ops.reads += 2;
      const [left, right] = [array[j], array[j + 1]];
      const outOfOrder = left > right;
      record({
        comparisons: [j, j + 1],
        line: 3,
        explanation: outOfOrder
          ? `${left} > ${right}: they are out of order`
          : `${left} ≤ ${right}: already in order, no swap`,
      });
      if (outOfOrder) {
        swap(j, j + 1);
        swapped = true;
        record({
          swaps: [j, j + 1],
          line: 4,
          explanation: `Swap ${left} and ${right}`,
        });
      }
    }
    sorted.add(n - 1 - i);
    if (!swapped) {
      record({
        line: 5,
        explanation: `Pass ${i + 1} made no swaps, so the array is already sorted. Stop early.`,
      });
      break;
    }
    record({
      line: 0,
      explanation: `End of pass ${i + 1}: ${array[n - 1 - i]} is now in its final position`,
    });
  }

  recordDone(record, sorted, array, ops);
  return steps;
}

export function selectionSort(input) {
  const { array, steps, ops, sorted, record, swap } = createRecorder(input);
  const n = array.length;
  recordStart(record, array);

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    record({
      marker: i,
      line: 1,
      explanation: `Assume ${array[i]} (index ${i}) is the minimum of the unsorted part`,
    });
    for (let j = i + 1; j < n; j++) {
      ops.comparisons++;
      ops.reads += 2;
      const isSmaller = array[j] < array[minIndex];
      record({
        comparisons: [j, minIndex],
        marker: minIndex,
        line: 3,
        explanation: isSmaller
          ? `${array[j]} < ${array[minIndex]}: found a smaller value`
          : `${array[j]} ≥ ${array[minIndex]}: minimum stays ${array[minIndex]}`,
      });
      if (isSmaller) {
        minIndex = j;
        record({
          marker: minIndex,
          line: 4,
          explanation: `New minimum is ${array[minIndex]} at index ${minIndex}`,
        });
      }
    }
    if (minIndex !== i) {
      const [a, b] = [array[i], array[minIndex]];
      swap(i, minIndex);
      sorted.add(i);
      record({
        swaps: [i, minIndex],
        line: 5,
        explanation: `Swap ${a} with the minimum ${b}; index ${i} is sorted`,
      });
    } else {
      sorted.add(i);
      record({
        swaps: [i],
        line: 5,
        explanation: `${array[i]} is already the minimum; index ${i} is sorted`,
      });
    }
  }

  recordDone(record, sorted, array, ops);
  return steps;
}

// Shifting is drawn as adjacent swaps so each value visibly slides into place;
// operation counts still follow the shift-based pseudocode.
export function insertionSort(input) {
  const { array, steps, ops, sorted, record } = createRecorder(input);
  const n = array.length;
  recordStart(record, array);

  for (let i = 1; i < n; i++) {
    const key = array[i];
    ops.reads++;
    let j = i - 1;
    record({
      marker: i,
      range: [0, i],
      line: 1,
      explanation: `Pick key = ${key}. Insert it into the sorted part [0..${i - 1}]`,
    });
    while (j >= 0) {
      ops.comparisons++;
      ops.reads++;
      if (array[j] <= key) {
        record({
          comparisons: [j, j + 1],
          marker: j + 1,
          range: [0, i],
          line: 3,
          explanation: `${array[j]} ≤ ${key}: stop shifting`,
        });
        break;
      }
      record({
        comparisons: [j, j + 1],
        marker: j + 1,
        range: [0, i],
        line: 3,
        explanation: `${array[j]} > ${key}: shift ${array[j]} one place right`,
      });
      array[j + 1] = array[j];
      array[j] = key;
      ops.writes++;
      record({
        swaps: [j, j + 1],
        marker: j,
        range: [0, i],
        line: 4,
        explanation: `Shifted ${array[j + 1]} to index ${j + 1}`,
      });
      j--;
    }
    ops.writes++;
    record({
      swaps: [j + 1],
      marker: j + 1,
      range: [0, i],
      line: 6,
      explanation: `Insert ${key} at index ${j + 1}. Sorted part: [${array.slice(0, i + 1).join(", ")}]`,
    });
  }

  recordDone(record, sorted, array, ops);
  return steps;
}

// While merging, the segment is drawn as merged-so-far + left rest + right rest,
// which is always a permutation of the segment, so nothing "disappears".
export function mergeSort(input) {
  const { array, steps, ops, sorted, record } = createRecorder(input);
  recordStart(record, array);

  function merge(left, mid, right) {
    const leftPart = array.slice(left, mid + 1);
    const rightPart = array.slice(mid + 1, right + 1);
    const merged = [];
    let i = 0;
    let j = 0;
    const redraw = () => {
      const segment = [...merged, ...leftPart.slice(i), ...rightPart.slice(j)];
      segment.forEach((value, offset) => {
        array[left + offset] = value;
      });
    };

    record({
      range: [left, right],
      line: 6,
      explanation: `Merge [${leftPart.join(", ")}] and [${rightPart.join(", ")}]`,
    });
    while (i < leftPart.length && j < rightPart.length) {
      ops.comparisons++;
      ops.reads += 2;
      const a = left + merged.length;
      const b = a + (leftPart.length - i);
      const takeLeft = leftPart[i] <= rightPart[j];
      record({
        comparisons: [a, b],
        range: [left, right],
        line: 8,
        explanation: takeLeft
          ? `${leftPart[i]} ≤ ${rightPart[j]}: take ${leftPart[i]} from the left half`
          : `${leftPart[i]} > ${rightPart[j]}: take ${rightPart[j]} from the right half`,
      });
      merged.push(takeLeft ? leftPart[i++] : rightPart[j++]);
      ops.writes++;
      redraw();
    }
    const rest = leftPart.length - i + (rightPart.length - j);
    if (rest > 0) {
      ops.writes += rest;
      const start = left + merged.length;
      merged.push(...leftPart.slice(i), ...rightPart.slice(j));
      i = leftPart.length;
      j = rightPart.length;
      redraw();
      record({
        swaps: Array.from({ length: rest }, (_, k) => start + k),
        range: [left, right],
        line: 9,
        explanation: `Copy the remaining ${rest === 1 ? "value" : "values"} [${array.slice(start, right + 1).join(", ")}]`,
      });
    }
    record({
      range: [left, right],
      line: 5,
      explanation: `Merged segment [${left}..${right}] → [${array.slice(left, right + 1).join(", ")}]`,
    });
  }

  function sort(left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    record({
      range: [left, right],
      line: 2,
      explanation: `Split [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}]`,
    });
    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  }

  sort(0, array.length - 1);
  recordDone(record, sorted, array, ops);
  return steps;
}

export function quickSort(input) {
  const { array, steps, ops, sorted, record, swap } = createRecorder(input);
  recordStart(record, array);

  function partition(low, high) {
    const pivot = array[high];
    let i = low - 1;
    record({
      marker: high,
      range: [low, high],
      line: 6,
      explanation: `Partition [${low}..${high}] around pivot ${pivot}`,
    });
    for (let j = low; j < high; j++) {
      ops.comparisons++;
      ops.reads += 2;
      const isSmaller = array[j] < pivot;
      record({
        comparisons: [j, high],
        marker: high,
        range: [low, high],
        line: 8,
        explanation: isSmaller
          ? `${array[j]} < pivot ${pivot}: move it to the left side`
          : `${array[j]} ≥ pivot ${pivot}: leave it on the right side`,
      });
      if (isSmaller) {
        i++;
        if (i !== j) {
          const [a, b] = [array[i], array[j]];
          swap(i, j);
          record({
            swaps: [i, j],
            marker: high,
            range: [low, high],
            line: 9,
            explanation: `Swap ${a} and ${b}`,
          });
        }
      }
    }
    const p = i + 1;
    if (p !== high) swap(p, high);
    sorted.add(p);
    record({
      swaps: [p, high].filter((v, k, all) => all.indexOf(v) === k),
      marker: p,
      range: [low, high],
      line: 10,
      explanation: `Place pivot ${pivot} at index ${p}: everything left is smaller, everything right is bigger`,
    });
    return p;
  }

  function sort(low, high) {
    if (low > high) return;
    if (low === high) {
      sorted.add(low);
      return;
    }
    const p = partition(low, high);
    sort(low, p - 1);
    sort(p + 1, high);
  }

  sort(0, array.length - 1);
  recordDone(record, sorted, array, ops);
  return steps;
}

export function heapSort(input) {
  const { array, steps, ops, sorted, record, swap } = createRecorder(input);
  const n = array.length;
  recordStart(record, array);

  function heapify(size, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    const comparisons = [];
    for (const child of [left, right]) {
      if (child < size) {
        ops.comparisons++;
        ops.reads += 2;
        comparisons.push(largest, child);
        if (array[child] > array[largest]) largest = child;
      }
    }
    if (!comparisons.length) return;
    record({
      comparisons,
      marker: largest,
      range: [0, size - 1],
      line: 6,
      explanation:
        largest === i
          ? `${array[i]} (index ${i}) is bigger than its children: heap property holds`
          : `Largest of index ${i} and its children is ${array[largest]} (index ${largest})`,
    });
    if (largest !== i) {
      const [a, b] = [array[i], array[largest]];
      swap(i, largest);
      record({
        swaps: [i, largest],
        range: [0, size - 1],
        line: 8,
        explanation: `Swap ${a} and ${b}, then keep sifting down from index ${largest}`,
      });
      heapify(size, largest);
    }
  }

  record({
    range: [0, n - 1],
    line: 1,
    explanation:
      "Build a max-heap: every parent must be bigger than its children",
  });
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);

  for (let end = n - 1; end > 0; end--) {
    const max = array[0];
    swap(0, end);
    sorted.add(end);
    record({
      swaps: [0, end],
      range: [0, end],
      line: 3,
      explanation: `Move the maximum ${max} to index ${end}; the heap shrinks to [0..${end - 1}]`,
    });
    heapify(end, 0);
  }

  recordDone(record, sorted, array, ops);
  return steps;
}
