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
  "shell-sort": {
    id: "shell-sort",
    name: "Shell Sort",
    description:
      "Insertion sort on values far apart first (a big gap), then on smaller and smaller gaps, so values move long distances early.",
    category: "sorting",
    complexity: {
      time: { best: "O(n log n)", average: "O(n^1.5)", worst: "O(n²)" },
      space: "O(1)",
    },
    pseudoCode: `shellSort(arr)
  gap = n / 2
  while gap > 0
    for i = gap to n-1
      temp = arr[i]; j = i
      while j >= gap and arr[j - gap] > temp
        arr[j] = arr[j - gap]; j = j - gap
      arr[j] = temp
    gap = gap / 2`,
    jsCode: `function shellSort(arr) {
  for (let gap = Math.floor(arr.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < arr.length; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
  return arr;
}`,
    difficulty: "intermediate",
    tags: ["unstable", "in-place", "comparison-based", "gap sequence"],
    howItWorks: [
      "Pick a gap (start with half the length).",
      "Insertion-sort each group of values that are 'gap' apart.",
      "Halve the gap and repeat; small values have already travelled far to the left.",
      "The last pass (gap 1) is a normal insertion sort, but on almost sorted data, so it is fast.",
    ],
    useCases: [
      "Medium-sized arrays with no extra memory",
      "Embedded systems (simple code, no recursion)",
    ],
  },
  "counting-sort": {
    id: "counting-sort",
    name: "Counting Sort",
    description:
      "Counts how many times each value appears, then writes the values back in order. No comparisons at all.",
    category: "sorting",
    complexity: {
      time: { best: "O(n + k)", average: "O(n + k)", worst: "O(n + k)" },
      space: "O(k)",
    },
    pseudoCode: `countingSort(arr)
  make a counter for every value from min to max
  for each value v in arr: count[v] = count[v] + 1
  i = 0
  for v from min to max
    repeat count[v] times: arr[i] = v; i = i + 1`,
    jsCode: `function countingSort(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const count = new Array(max - min + 1).fill(0);
  for (const v of arr) count[v - min]++;
  let i = 0;
  for (let v = min; v <= max; v++) {
    for (let c = 0; c < count[v - min]; c++) arr[i++] = v;
  }
  return arr;
}`,
    difficulty: "intermediate",
    tags: ["non-comparison", "integer keys", "linear time"],
    howItWorks: [
      "Find the smallest and largest value; k is the size of that range.",
      "Walk the array once, counting each value.",
      "Walk the counters from smallest to largest and write each value as many times as it was counted.",
      "Linear time, but only practical when the range k is small compared with n.",
    ],
    useCases: [
      "Sorting ages, grades, small integer IDs",
      "As the digit sort inside radix sort",
    ],
  },
  "radix-sort": {
    id: "radix-sort",
    name: "Radix Sort",
    description:
      "Sorts numbers digit by digit, from the ones place up, using stable buckets 0–9 for each digit.",
    category: "sorting",
    complexity: {
      time: {
        best: "O(d·(n + 10))",
        average: "O(d·(n + 10))",
        worst: "O(d·(n + 10))",
      },
      space: "O(n)",
    },
    pseudoCode: `radixSort(arr)
  for each digit place: ones, tens, hundreds…
    put each value into bucket[digit] (0–9), keeping their order
    read the buckets back in order 0..9 into arr`,
    jsCode: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let place = 1; Math.floor(max / place) > 0; place *= 10) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (const v of arr) buckets[Math.floor(v / place) % 10].push(v);
    arr = buckets.flat();
  }
  return arr;
}`,
    difficulty: "intermediate",
    tags: ["non-comparison", "stable", "digits"],
    howItWorks: [
      "Look only at the ones digit and drop each value into bucket 0–9.",
      "Collect the buckets in order: the array is now sorted by its last digit.",
      "Repeat for the tens digit, then hundreds. Buckets keep the earlier order (stable), so ties stay sorted.",
      "After the largest digit place, the whole array is sorted, with d passes for d-digit numbers.",
    ],
    useCases: [
      "Sorting many integers or fixed-length keys (phone numbers, IDs)",
      "Suffix arrays and string sorting",
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
  "jump-search": {
    id: "jump-search",
    name: "Jump Search",
    description:
      "Searches a sorted array by jumping ahead in blocks of √n until it passes the target, then scanning that block.",
    category: "searching",
    complexity: {
      time: { best: "O(1)", average: "O(√n)", worst: "O(√n)" },
      space: "O(1)",
    },
    pseudoCode: `jumpSearch(arr, target)
  step = √n; prev = 0
  while arr[min(step, n) - 1] < target
    prev = step; step = step + √n
    if prev >= n: return -1
  for i = prev to min(step, n) - 1
    if arr[i] == target: return i
  return -1`,
    jsCode: `function jumpSearch(arr, target) {
  const n = arr.length;
  const block = Math.floor(Math.sqrt(n));
  let prev = 0;
  let step = block;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += block;
    if (prev >= n) return -1;
  }
  for (let i = prev; i < Math.min(step, n); i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    difficulty: "beginner",
    tags: ["sorted-array", "blocks"],
    howItWorks: [
      "Split the sorted array into blocks of about √n values.",
      "Check the last value of each block until one is at least the target.",
      "The target can only be in that block: scan it one by one.",
      "At most √n jumps plus √n steps: between linear and binary search.",
    ],
    useCases: [
      "Sorted data where jumping back is expensive (e.g. tapes, linked blocks)",
      "Teaching the trade-off between linear and binary search",
    ],
  },
  "interpolation-search": {
    id: "interpolation-search",
    name: "Interpolation Search",
    description:
      "Searches a sorted array by guessing the position from the target's value, like opening a dictionary near the right letter.",
    category: "searching",
    complexity: {
      time: { best: "O(1)", average: "O(log log n)", worst: "O(n)" },
      space: "O(1)",
    },
    pseudoCode: `interpolationSearch(arr, target)
  low = 0, high = n - 1
  while low <= high and arr[low] <= target <= arr[high]
    pos = low + (target - arr[low]) × (high - low) / (arr[high] - arr[low])
    if arr[pos] == target: return pos
    if arr[pos] < target: low = pos + 1
    else: high = pos - 1
  return -1`,
    jsCode: `function interpolationSearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    const span = arr[high] - arr[low];
    const pos = span === 0 ? low
      : low + Math.floor(((target - arr[low]) * (high - low)) / span);
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`,
    difficulty: "intermediate",
    tags: ["sorted-array", "uniform data"],
    howItWorks: [
      "Instead of the middle, estimate where the target should be from how big it is compared with the ends of the range.",
      "If the guess is too small, search to its right; too big, to its left.",
      "On evenly spread values it needs only about log log n guesses.",
      "On skewed data (e.g. 1, 2, 3, 1000) guesses are poor and it can degrade to O(n).",
    ],
    useCases: [
      "Large sorted arrays of evenly distributed numbers",
      "Looking up keys like timestamps or IDs",
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
  "grid-bfs": {
    id: "grid-bfs",
    name: "BFS on a Grid",
    description:
      "Explores the grid ring by ring from the start with a queue, finding the path with the fewest moves.",
    category: "pathfinding",
    complexity: {
      time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
      space: "O(V)",
    },
    pseudoCode: `bfs(grid, start, goal)
  queue = [start]; seen = {start}
  while open is not empty
    current = queue.dequeue()   // oldest cell first
    if current == goal: follow parents back to start, done
    for each neighbour n of current that is not a wall or seen
      parent[n] = current; seen.add(n)
      add n to the back of the queue
  no path: the goal is walled off`,
    jsCode: `function bfsGrid(grid, start, goal) {
  const parent = new Map();
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cell = queue.shift();
    if (cell === goal) return buildPath(parent, goal);
    for (const next of grid.neighbours(cell)) {
      if (!seen.has(next)) {
        seen.add(next);
        parent.set(next, cell);
        queue.push(next);
      }
    }
  }
  return null;
}`,
    difficulty: "intermediate",
    tags: ["pathfinding", "grid", "queue", "unweighted"],
    howItWorks: [
      "Put the start in a queue.",
      "Take the oldest cell from the queue and add its unseen neighbours to the back.",
      "Cells come out in order of how many moves they are from the start.",
      "The first path to reach the goal has the fewest moves.",
    ],
    useCases: [
      "Shortest paths when every move costs the same",
      "Flood fill, 'paint bucket' tools",
      "Maze solving",
    ],
  },
  "greedy-best-first": {
    id: "greedy-best-first",
    name: "Greedy Best-First Search",
    description:
      "Rushes towards the goal by always exploring the cell that looks closest to it. Fast, but the path it finds is not always the shortest.",
    category: "pathfinding",
    complexity: {
      time: { best: "O(d)", average: "O(V log V)", worst: "O(V log V)" },
      space: "O(V)",
    },
    pseudoCode: `greedyBestFirst(grid, start, goal)
  open = {start}; seen = {start}
  while open is not empty
    current = cell in open with the smallest h (closest guess)
    if current == goal: follow parents back to start, done
    for each neighbour n of current that is not a wall or seen
      parent[n] = current; seen.add(n)
      add n to open
  no path: the goal is walled off`,
    jsCode: `function greedyBestFirst(grid, start, goal) {
  const h = (cell) => manhattan(cell, goal);
  const parent = new Map();
  const seen = new Set([start]);
  const open = [start];
  while (open.length) {
    open.sort((a, b) => h(a) - h(b));
    const cell = open.shift();
    if (cell === goal) return buildPath(parent, goal);
    for (const next of grid.neighbours(cell)) {
      if (!seen.has(next)) {
        seen.add(next);
        parent.set(next, cell);
        open.push(next);
      }
    }
  }
  return null;
}`,
    difficulty: "intermediate",
    tags: ["pathfinding", "heuristic", "grid", "not optimal"],
    howItWorks: [
      "Only the guess h (distance to the goal, ignoring walls) decides what to explore next; the moves so far are ignored.",
      "It heads straight for the goal and often explores very few cells.",
      "Walls in the way can lead it into dead ends, and the path can be longer than necessary.",
      "Compare it with BFS on a Grid, which always finds the fewest moves but explores more cells.",
    ],
    useCases: [
      "Quick 'good enough' paths",
      "Showing why a good guess is not enough for the shortest path",
    ],
  },
  fibonacci: {
    id: "fibonacci",
    name: "Fibonacci (Bottom-Up)",
    description:
      "Computes Fibonacci numbers by filling a table from the smallest case up, so each value is calculated exactly once.",
    category: "dynamic-programming",
    complexity: {
      time: { best: "O(n)", average: "O(n)", worst: "O(n)" },
      space: "O(n)",
    },
    pseudoCode: `fib(n)
  dp[0] = 0; dp[1] = 1
  for i from 2 to n
    dp[i] = dp[i-1] + dp[i-2]
  return dp[n]`,
    jsCode: `function fib(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`,
    difficulty: "beginner",
    tags: ["dynamic programming", "tabulation", "1-D table"],
    howItWorks: [
      "Plain recursion recomputes the same values again and again: fib(n) makes about 1.6ⁿ calls.",
      "Dynamic programming stores each answer in a table the first time it is computed.",
      "Bottom-up (tabulation) fills the table from the base cases fib(0) and fib(1) upwards.",
      "Each cell only needs the two cells before it, so the whole table takes n − 1 additions.",
    ],
    useCases: [
      "The classic first example of overlapping subproblems",
      "Counting ways to climb stairs or tile a board",
    ],
  },
};

export const ALGORITHM_CATEGORIES = {
  sorting: "Sorting",
  searching: "Searching",
  "graph-traversal": "Graph Traversal",
  pathfinding: "Grid Pathfinding",
  "dynamic-programming": "Dynamic Programming",
};

export const DIFFICULTIES = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
