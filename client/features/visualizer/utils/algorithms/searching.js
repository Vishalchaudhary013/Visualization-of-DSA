function createStep(
  state,
  comparisons,
  current,
  tracker,
  explanation,
  found = false,
) {
  return {
    state,
    comparisons,
    swaps: found ? [current] : [],
    sorted: found ? [current] : [],
    explanation,
    operations: {
      comparisons: tracker.comparisons,
      swaps: 0,
      reads: tracker.reads,
      writes: 0,
    },
  };
}
export function linearSearch(arr, target) {
  const array = [...arr];
  const steps = [];
  const tracker = {
    comparisons: 0,
    reads: 0,
  };
  for (let i = 0; i < array.length; i++) {
    tracker.comparisons++;
    tracker.reads++;
    if (array[i] === target) {
      steps.push(
        createStep(
          array,
          [i],
          i,
          tracker,
          `Found ${target} at index ${i}`,
          true,
        ),
      );
      return steps;
    }
    steps.push(
      createStep(
        array,
        [i],
        i,
        tracker,
        `Comparing ${array[i]} with target ${target}. No match.`,
      ),
    );
  }
  steps.push(
    createStep(array, [], -1, tracker, `Element ${target} not found in array`),
  );
  return steps;
}
export function binarySearch(arr, target) {
  const array = [...arr];
  const steps = [];
  const tracker = {
    comparisons: 0,
    reads: 0,
  };
  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    tracker.comparisons++;
    tracker.reads++;
    if (array[mid] === target) {
      steps.push(
        createStep(
          array,
          [mid],
          mid,
          tracker,
          `Found ${target} at index ${mid}`,
          true,
        ),
      );
      return steps;
    }
    if (array[mid] < target) {
      tracker.reads++;
      steps.push(
        createStep(
          array,
          [mid],
          mid,
          tracker,
          `${array[mid]} < ${target}. Searching right half`,
        ),
      );
      left = mid + 1;
    } else {
      tracker.reads++;
      steps.push(
        createStep(
          array,
          [mid],
          mid,
          tracker,
          `${array[mid]} > ${target}. Searching left half`,
        ),
      );
      right = mid - 1;
    }
  }
  steps.push(
    createStep(array, [], -1, tracker, `Element ${target} not found in array`),
  );
  return steps;
}
