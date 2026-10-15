// Static metadata for every algorithm, shared by the client (visualizer, home
// page) and the server (assistant). `pseudoCode` lines are referenced by index
// from the step generators in client/features/visualizer/algorithms, so keep
// them in sync when editing.
export const ALGORITHMS = {
  "bubble-sort": {
    id: "bubble-sort",
    name: "Bubble Sort",
    description:
      "Repeatedly steps through the list, compares neighbours and swaps them when they are out of order.",
    category: "sorting",
    complexity: {
      time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
    },
    pseudoCode: `for i = 0 to n-2
  swapped = false
  for j = 0 to n-i-2
    if arr[j] > arr[j+1]
      swap(arr[j], arr[j+1]); swapped = true
  if not swapped: break`,
    jsCode: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}`,
    difficulty: "beginner",
    tags: ["stable", "in-place", "comparison-based", "adaptive"],
    howItWorks: [
      "Look at the first pair of neighbours.",
      "If the left value is bigger, swap them.",
      "Move one position right and repeat until the end of the unsorted part.",
      "The largest value of this pass has now bubbled to the end and is sorted.",
      "Repeat passes; stop early when a whole pass makes no swaps.",
    ],
    useCases: ["Teaching the idea of sorting", "Tiny or almost-sorted lists"],
  },
  "selection-sort": {
    id: "selection-sort",
    name: "Selection Sort",
    description:
      "Splits the list into a sorted and an unsorted part and repeatedly moves the smallest unsorted value to the front.",
    category: "sorting",
    complexity: {
      time: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
    },
    pseudoCode: `for i = 0 to n-2
  minIndex = i
  for j = i+1 to n-1
    if arr[j] < arr[minIndex]
      minIndex = j
  swap(arr[i], arr[minIndex])`,
    jsCode: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
  }
  return arr;
}`,
    difficulty: "beginner",
    tags: ["unstable", "in-place", "comparison-based"],
    howItWorks: [
      "Assume the first unsorted value is the minimum.",
      "Scan the rest of the unsorted part, remembering any smaller value.",
      "Swap the minimum into the first unsorted position.",
      "That position is now sorted; repeat for the next one.",
    ],
    useCases: ["When writes are expensive (at most n-1 swaps)", "Small lists"],
  },
  "insertion-sort": {
    id: "insertion-sort",
    name: "Insertion Sort",
    description:
      "Builds the sorted array one item at a time by inserting each value into its correct place.",
    category: "sorting",
    complexity: {
      time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
    },
    pseudoCode: `for i = 1 to n-1
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = key`,
    jsCode: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    difficulty: "beginner",
    tags: ["stable", "in-place", "adaptive", "comparison-based"],
    howItWorks: [
      "Treat the first value as a sorted list of one.",
      "Pick the next value (the key).",
      "Shift every larger sorted value one place to the right.",
      "Drop the key into the gap that opens up.",
      "Repeat until every value has been inserted.",
    ],
    useCases: [
      "Nearly sorted data",
      "Small arrays (used inside hybrid sorts like Timsort)",
      "Online sorting as data arrives",
    ],
  },
  "merge-sort": {
    id: "merge-sort",
    name: "Merge Sort",
    description:
      "Divides the array into halves, sorts each half recursively and merges the sorted halves back together.",
    category: "sorting",
    complexity: {
      time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
      space: "O(n)",
    },
    pseudoCode: `mergeSort(arr, left, right)
  if left >= right: return
  mid = (left + right) / 2
  mergeSort(arr, left, mid)
  mergeSort(arr, mid+1, right)
  merge(arr, left, mid, right)
merge(arr, left, mid, right)
  while both halves have values
    copy the smaller front value into arr
  copy the remaining values into arr`,
    jsCode: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
    difficulty: "intermediate",
    tags: ["stable", "divide-and-conquer", "recursive"],
    howItWorks: [
      "Split the range in half until each piece has one value.",
      "A single value is already sorted.",
      "Merge two sorted pieces by repeatedly taking the smaller front value.",
      "Keep merging upwards until the whole array is one sorted piece.",
    ],
    useCases: [
      "Guaranteed O(n log n) even in the worst case",
      "Sorting linked lists",
      "External sorting of data too big for memory",
    ],
  },
  "quick-sort": {
    id: "quick-sort",
    name: "Quick Sort",
    description:
      "Picks a pivot, partitions smaller values to its left and larger to its right, then sorts both sides recursively.",
    category: "sorting",
    complexity: {
      time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
      space: "O(log n)",
    },
    pseudoCode: `quickSort(arr, low, high)
  if low < high
    p = partition(arr, low, high)
    quickSort(arr, low, p-1)
    quickSort(arr, p+1, high)
partition(arr, low, high)
  pivot = arr[high]; i = low - 1
  for j = low to high-1
    if arr[j] < pivot
      i = i + 1; swap(arr[i], arr[j])
  swap(arr[i+1], arr[high]); return i+1`,
    jsCode: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const p = partition(arr, low, high);
    quickSort(arr, low, p - 1);
    quickSort(arr, p + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    difficulty: "intermediate",
    tags: ["unstable", "in-place", "divide-and-conquer"],
    howItWorks: [
      "Choose the last value of the range as the pivot.",
      "Walk through the range; move every value smaller than the pivot to the left side.",
      "Swap the pivot right after the smaller values: it is now in its final place.",
      "Repeat on the left part and on the right part.",
    ],
    useCases: [
      "General-purpose in-memory sorting (very fast in practice)",
      "When extra memory must stay small",
    ],
  },
  "heap-sort": {
    id: "heap-sort",
    name: "Heap Sort",
    description:
      "Turns the array into a max-heap, then repeatedly moves the maximum to the end and repairs the heap.",
    category: "sorting",
    complexity: {
      time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
      space: "O(1)",
    },
    pseudoCode: `heapSort(arr)
  for i = n/2-1 down to 0: heapify(arr, n, i)
  for end = n-1 down to 1
    swap(arr[0], arr[end])
    heapify(arr, end, 0)
heapify(arr, n, i)
  largest = biggest of i, 2i+1, 2i+2
  if largest != i
    swap(arr[i], arr[largest]); heapify(arr, n, largest)`,
    jsCode: `function heapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    heapify(arr, end, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
    difficulty: "intermediate",
    tags: ["unstable", "in-place", "comparison-based"],
    howItWorks: [
      "View the array as a binary tree: children of i are 2i+1 and 2i+2.",
      "Heapify from the bottom up so every parent is bigger than its children.",
      "The root (index 0) is now the maximum: swap it to the end.",
      "Shrink the heap by one and heapify the root again.",
      "Repeat until the heap is empty.",
    ],
    useCases: [
      "Guaranteed O(n log n) with O(1) extra memory",
      "Priority queues and top-k problems",
    ],
  },
  "linear-search": {
    id: "linear-search",
    name: "Linear Search",
    description:
      "Checks every element one by one until the target is found or the list ends.",
    category: "searching",
    complexity: {
      time: { best: "O(1)", average: "O(n)", worst: "O(n)" },
      space: "O(1)",
    },
    pseudoCode: `for i = 0 to n-1
  if arr[i] == target
    return i
return -1`,
    jsCode: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
    difficulty: "beginner",
    tags: ["sequential", "unsorted"],
    howItWorks: [
      "Start at index 0.",
      "Compare the current value with the target.",
      "If they match, return the index.",
      "Otherwise move to the next index; if none are left, the target is missing.",
    ],
    useCases: ["Unsorted data", "Small lists", "Searching a stream once"],
  },
  "binary-search": {
    id: "binary-search",
    name: "Binary Search",
    description:
      "Searches a sorted array by comparing with the middle value and discarding half of the range each time.",
    category: "searching",
    complexity: {
      time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
      space: "O(1)",
    },
    pseudoCode: `left = 0, right = n-1
while left <= right
  mid = (left + right) / 2
  if arr[mid] == target
    return mid
  if arr[mid] < target
    left = mid + 1
  else
    right = mid - 1
return -1`,
    jsCode: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    difficulty: "intermediate",
    tags: ["divide-and-conquer", "sorted-array"],
    howItWorks: [
      "The array must be sorted. Search range = whole array.",
      "Look at the middle value of the range.",
      "If it is the target, you are done.",
      "If it is smaller, the target can only be in the right half; otherwise the left half.",
      "Repeat on the remaining half until the range is empty.",
    ],
    useCases: [
      "Looking up values in sorted data",
      "Finding boundaries (first/last position, lower bound)",
      "Binary search on the answer",
    ],
  },
  bfs: {
    id: "bfs",
    name: "Breadth-First Search",
    description:
      "Traverses a graph level by level using a queue, visiting all neighbours before going deeper.",
    category: "graph-traversal",
    complexity: {
      time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
      space: "O(V)",
    },
    pseudoCode: `queue = [start]; visited = {start}
while queue not empty
  current = queue.dequeue()
  for each neighbor of current
    if neighbor not visited
      visited.add(neighbor)
      queue.enqueue(neighbor)`,
    jsCode: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const result = [];
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    for (const neighbor of graph.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return result;
}`,
    difficulty: "intermediate",
    tags: ["graph", "queue", "shortest-path"],
    howItWorks: [
      "Put the start vertex in a queue and mark it visited.",
      "Take the vertex at the front of the queue.",
      "Add each unvisited neighbour to the back of the queue and mark it visited.",
      "Repeat until the queue is empty. Vertices come out in order of distance.",
    ],
    useCases: [
      "Shortest path in unweighted graphs",
      "Level-order traversal of trees",
      "Finding connected components",
    ],
  },
  dfs: {
    id: "dfs",
    name: "Depth-First Search",
    description:
      "Traverses a graph by going as deep as possible along each branch before backtracking.",
    category: "graph-traversal",
    complexity: {
      time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
      space: "O(V)",
    },
    pseudoCode: `visited = {}
dfs(v)
  visited.add(v)
  for each neighbor of v
    if neighbor not visited
      dfs(neighbor)
  backtrack from v`,
    jsCode: `function dfs(graph, start) {
  const visited = new Set();
  const result = [];
  function helper(v) {
    visited.add(v);
    result.push(v);
    for (const neighbor of graph.get(v) || []) {
      if (!visited.has(neighbor)) {
        helper(neighbor);
      }
    }
  }
  helper(start);
  return result;
}`,
    difficulty: "intermediate",
    tags: ["graph", "stack", "recursive"],
    howItWorks: [
      "Visit the start vertex and mark it visited.",
      "Go to the first unvisited neighbour and repeat from there.",
      "When a vertex has no unvisited neighbours, backtrack to the previous one.",
      "Finish when you have backtracked out of the start vertex.",
    ],
    useCases: [
      "Cycle detection",
      "Topological sorting",
      "Maze solving and path finding",
    ],
  },
};

export const ALGORITHM_CATEGORIES = {
  sorting: "Sorting",
  searching: "Searching",
  "graph-traversal": "Graph Traversal",
};

export const DIFFICULTIES = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
