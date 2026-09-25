function createStep(state, comparisons, swaps, sorted, tracker, explanation) {
  return {
    state: [...state],
    comparisons: [...comparisons],
    swaps: [...swaps],
    sorted: [...sorted],
    explanation,
    operations: {
      comparisons: tracker.comparisons,
      swaps: tracker.swaps,
      reads: tracker.reads,
      writes: tracker.writes,
    },
  };
}
export function bubbleSort(arr) {
  const array = [...arr];
  const steps = [];
  const tracker = {
    steps: [],
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const comparisons = [j, j + 1];
      tracker.comparisons++;
      tracker.reads += 2;
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        tracker.swaps++;
        tracker.writes += 2;
        steps.push(
          createStep(
            array,
            comparisons,
            [j, j + 1],
            Array.from({ length: i + 1 }, (_, k) => n - 1 - k),
            tracker,
            `Comparing ${array[j + 1]} and ${array[j]}, swapped`,
          ),
        );
      } else {
        steps.push(
          createStep(
            array,
            comparisons,
            [],
            Array.from({ length: i + 1 }, (_, k) => n - 1 - k),
            tracker,
            `Comparing ${array[j]} and ${array[j + 1]}, no swap needed`,
          ),
        );
      }
    }
  }
  return steps;
}
export function selectionSort(arr) {
  const array = [...arr];
  const steps = [];
  const tracker = {
    steps: [],
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      tracker.comparisons++;
      tracker.reads += 2;
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
      steps.push(
        createStep(
          array,
          [i, j],
          [],
          Array.from({ length: i }, (_, k) => k),
          tracker,
          `Comparing ${array[j]} with minimum ${array[minIndex]}`,
        ),
      );
    }
    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      tracker.swaps++;
      tracker.writes += 2;
      steps.push(
        createStep(
          array,
          [],
          [i, minIndex],
          Array.from({ length: i + 1 }, (_, k) => k),
          tracker,
          `Swapping elements at positions ${i} and ${minIndex}`,
        ),
      );
    }
  }
  return steps;
}
export function insertionSort(arr) {
  const array = [...arr];
  const steps = [];
  const tracker = {
    steps: [],
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };
  for (let i = 1; i < array.length; i++) {
    const key = array[i];
    let j = i - 1;
    tracker.reads++;
    while (j >= 0 && array[j] > key) {
      tracker.comparisons++;
      tracker.reads++;
      array[j + 1] = array[j];
      tracker.writes++;
      steps.push(
        createStep(
          array,
          [j, i],
          [],
          Array.from({ length: i }, (_, k) => k),
          tracker,
          `Shifting ${array[j]} to the right`,
        ),
      );
      j--;
    }
    array[j + 1] = key;
    tracker.writes++;
    steps.push(
      createStep(
        array,
        [],
        [j + 1],
        Array.from({ length: i + 1 }, (_, k) => k),
        tracker,
        `Inserted ${key} into sorted position`,
      ),
    );
  }
  return steps;
}
export function mergeSort(arr) {
  const array = [...arr];
  const steps = [];
  const tracker = {
    steps: [],
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };
  function merge(left, mid, right) {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;
    while (i < leftArr.length && j < rightArr.length) {
      tracker.comparisons++;
      tracker.reads += 2;
      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        array[k] = rightArr[j];
        j++;
      }
      tracker.writes++;
      k++;
      steps.push(
        createStep(
          array,
          [left + i, mid + 1 + j],
          [],
          [],
          tracker,
          `Merging elements from left and right subarrays`,
        ),
      );
    }
    while (i < leftArr.length) {
      array[k] = leftArr[i];
      tracker.writes++;
      i++;
      k++;
      steps.push(
        createStep(
          array,
          [],
          [],
          [],
          tracker,
          `Copying remaining elements from left subarray`,
        ),
      );
    }
    while (j < rightArr.length) {
      array[k] = rightArr[j];
      tracker.writes++;
      j++;
      k++;
      steps.push(
        createStep(
          array,
          [],
          [],
          [],
          tracker,
          `Copying remaining elements from right subarray`,
        ),
      );
    }
  }
  function mergeSortHelper(left, right) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSortHelper(left, mid);
      mergeSortHelper(mid + 1, right);
      merge(left, mid, right);
    }
  }
  mergeSortHelper(0, array.length - 1);
  return steps;
}
export function quickSort(arr) {
  const array = [...arr];
  const steps = [];
  const tracker = {
    steps: [],
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };
  function partition(low, high) {
    const pivot = array[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      tracker.comparisons++;
      tracker.reads++;
      if (array[j] < pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        tracker.swaps++;
        tracker.writes += 2;
        steps.push(
          createStep(
            array,
            [j, high],
            [i, j],
            [],
            tracker,
            `Partitioning: element ${array[i]} is less than pivot ${pivot}`,
          ),
        );
      }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    tracker.swaps++;
    tracker.writes += 2;
    steps.push(
      createStep(
        array,
        [],
        [i + 1, high],
        [],
        tracker,
        `Placed pivot ${pivot} in correct position`,
      ),
    );
    return i + 1;
  }
  function quickSortHelper(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    }
  }
  quickSortHelper(0, array.length - 1);
  return steps;
}
export function heapSort(arr) {
  const array = [...arr];
  const steps = [];
  const tracker = {
    steps: [],
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
  };
  function heapify(n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && array[left] > array[largest]) {
      tracker.comparisons++;
      largest = left;
    }
    if (right < n && array[right] > array[largest]) {
      tracker.comparisons++;
      largest = right;
    }
    if (largest !== i) {
      [array[i], array[largest]] = [array[largest], array[i]];
      tracker.swaps++;
      tracker.writes += 2;
      tracker.reads += 2;
      steps.push(
        createStep(
          array,
          [i, largest],
          [i, largest],
          [],
          tracker,
          `Heapifying: swapped element at position ${i} with ${largest}`,
        ),
      );
      heapify(n, largest);
    }
  }
  const n = array.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    tracker.swaps++;
    tracker.writes += 2;
    steps.push(
      createStep(
        array,
        [],
        [0, i],
        Array.from({ length: n - i }, (_, k) => i + k),
        tracker,
        `Moved max element to end, heapifying remaining`,
      ),
    );
    heapify(i, 0);
  }
  return steps;
}
