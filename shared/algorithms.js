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
  dijkstra: {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    description:
      "Finds the shortest path from one vertex to every other vertex in a graph with non-negative edge weights.",
    category: "graph-algorithms",
    complexity: {
      time: {
        best: "O((V + E) log V)",
        average: "O((V + E) log V)",
        worst: "O((V + E) log V)",
      },
      space: "O(V)",
    },
    pseudoCode: `dijkstra(graph, start)
  dist[all] = ∞; dist[start] = 0; pq = {(0, start)}
  while pq not empty
    (d, u) = pq.popMin()
    if d > dist[u]: skip outdated entry
    for each edge (u, v, w)
      if dist[u] + w < dist[v]
        dist[v] = dist[u] + w; prev[v] = u; pq.push((dist[v], v))`,
    jsCode: `function dijkstra(graph, start) {
  // graph: Map<vertex, Array<{ to, weight }>>
  const dist = new Map([...graph.keys()].map((v) => [v, Infinity]));
  const prev = new Map();
  dist.set(start, 0);
  const pq = [[0, start]]; // use a binary heap for large graphs
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist.get(u)) continue;
    for (const { to: v, weight } of graph.get(u)) {
      const candidate = d + weight;
      if (candidate < dist.get(v)) {
        dist.set(v, candidate);
        prev.set(v, u);
        pq.push([candidate, v]);
      }
    }
  }
  return { dist, prev };
}`,
    difficulty: "advanced",
    tags: ["graph", "shortest-path", "greedy", "priority-queue"],
    howItWorks: [
      "Give the start distance 0 and every other vertex ∞.",
      "Repeatedly take the unfinished vertex with the smallest distance: its distance is now final.",
      "Relax its edges: if going through it gives a neighbour a shorter distance, update that neighbour.",
      "The edges that produced the final distances form the shortest-path tree.",
      "Negative weights break the greedy choice; use Bellman-Ford for those.",
    ],
    useCases: [
      "Maps and GPS routing",
      "Network routing protocols (OSPF)",
      "Cheapest path in any weighted network",
    ],
  },
  "bellman-ford": {
    id: "bellman-ford",
    name: "Bellman-Ford",
    description:
      "Finds shortest paths from one vertex even when some edges have negative weights, and detects negative cycles.",
    category: "graph-algorithms",
    complexity: {
      time: { best: "O(E)", average: "O(V · E)", worst: "O(V · E)" },
      space: "O(V)",
    },
    pseudoCode: `bellmanFord(graph, start)
  dist[all] = ∞; dist[start] = 0
  repeat V - 1 times (stop early if nothing changes)
    for each edge (u, v, w)
      if dist[u] + w < dist[v]
        dist[v] = dist[u] + w; prev[v] = u
  check every edge (u, v, w) once more
    if dist[u] + w < dist[v]: negative cycle!`,
    jsCode: `function bellmanFord(vertexCount, edges, start) {
  // edges: Array<[u, v, weight]> (directed, weights may be negative)
  const dist = Array(vertexCount).fill(Infinity);
  const prev = Array(vertexCount).fill(null);
  dist[start] = 0;
  for (let round = 1; round < vertexCount; round++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        changed = true;
      }
    }
    if (!changed) break;
  }
  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) throw new Error("Negative cycle");
  }
  return { dist, prev };
}`,
    difficulty: "advanced",
    tags: ["graph", "shortest-path", "negative weights", "dynamic programming"],
    howItWorks: [
      "Start with dist = 0 at the start and ∞ everywhere else.",
      "In each round, try every edge: if it gives a shorter way to its end vertex, update it (relax).",
      "A shortest path has at most V − 1 edges, so V − 1 rounds are enough; often it settles sooner.",
      "If an edge can still improve a distance after that, a negative cycle exists and 'shortest' has no meaning.",
      "Slower than Dijkstra, but correct with negative weights.",
    ],
    useCases: [
      "Graphs with negative costs (refunds, gains)",
      "Currency arbitrage detection (negative cycles)",
      "Distance-vector routing (RIP)",
    ],
  },
  prim: {
    id: "prim",
    name: "Prim's Algorithm",
    description:
      "Builds a minimum spanning tree by growing one tree from a start vertex, always adding the cheapest edge that reaches a new vertex.",
    category: "graph-algorithms",
    complexity: {
      time: { best: "O(E log V)", average: "O(E log V)", worst: "O(E log V)" },
      space: "O(V + E)",
    },
    pseudoCode: `prim(graph, start)
  tree = {start}; candidates = edges of start
  while candidates and tree is missing vertices
    (u, v, w) = cheapest candidate; if v in tree: skip
    add v and edge (u, v) to the tree
    add v's edges to vertices outside the tree as candidates`,
    jsCode: `function prim(graph, start) {
  // graph: Map<vertex, Array<{ to, weight }>> (undirected)
  const inTree = new Set([start]);
  const tree = [];
  let candidates = graph.get(start).map((e) => ({ from: start, ...e }));
  while (candidates.length && inTree.size < graph.size) {
    candidates.sort((a, b) => a.weight - b.weight);
    const { from, to, weight } = candidates.shift();
    if (inTree.has(to)) continue;
    inTree.add(to);
    tree.push([from, to, weight]);
    for (const edge of graph.get(to)) {
      if (!inTree.has(edge.to)) candidates.push({ from: to, ...edge });
    }
  }
  return tree;
}`,
    difficulty: "advanced",
    tags: ["graph", "minimum-spanning-tree", "greedy"],
    howItWorks: [
      "Start a tree with a single vertex.",
      "Look at every edge from the tree to a vertex outside it.",
      "Add the cheapest one, together with its new vertex.",
      "Repeat until every vertex is in the tree: the result has the smallest possible total weight.",
    ],
    useCases: [
      "Designing cheapest cable, road or pipe networks",
      "Clustering (cut the heaviest tree edges)",
      "Approximating the travelling salesman problem",
    ],
  },
  kruskal: {
    id: "kruskal",
    name: "Kruskal's Algorithm",
    description:
      "Builds a minimum spanning tree by taking edges from cheapest to most expensive and skipping any that would form a cycle.",
    category: "graph-algorithms",
    complexity: {
      time: { best: "O(E log E)", average: "O(E log E)", worst: "O(E log E)" },
      space: "O(V)",
    },
    pseudoCode: `kruskal(graph)
  sort edges by weight; make each vertex its own set
  for each edge (u, v, w) in sorted order
    if find(u) != find(v)
      union(u, v); add (u, v) to the tree
    else: skip, it would form a cycle`,
    jsCode: `function kruskal(vertexCount, edges) {
  // edges: Array<[u, v, weight]>
  const parent = Array.from({ length: vertexCount }, (_, v) => v);
  const find = (v) => (parent[v] === v ? v : (parent[v] = find(parent[v])));
  const tree = [];
  for (const [u, v, w] of [...edges].sort((a, b) => a[2] - b[2])) {
    const rootU = find(u);
    const rootV = find(v);
    if (rootU !== rootV) {
      parent[rootU] = rootV;
      tree.push([u, v, w]);
    }
  }
  return tree;
}`,
    difficulty: "advanced",
    tags: ["graph", "minimum-spanning-tree", "greedy", "union-find"],
    howItWorks: [
      "Sort all edges from cheapest to most expensive.",
      "Every vertex starts as its own little tree (a disjoint set).",
      "Take the next edge: if its ends are in different trees, add it and merge the trees.",
      "If both ends are already connected, the edge would make a cycle, so skip it.",
      "Union-find makes the 'already connected?' check almost O(1).",
    ],
    useCases: [
      "Cheapest network design on sparse graphs",
      "Image segmentation and clustering",
      "A classic use of the union-find data structure",
    ],
  },
  "topological-sort": {
    id: "topological-sort",
    name: "Topological Sort",
    description:
      "Orders the vertices of a directed acyclic graph so that every edge points from an earlier vertex to a later one (Kahn's algorithm).",
    category: "graph-algorithms",
    complexity: {
      time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
      space: "O(V)",
    },
    pseudoCode: `topologicalSort(graph)
  indegree[v] = incoming edges; queue = vertices with indegree 0
  while queue not empty
    u = queue.dequeue(); order.append(u)
    for each edge u → v
      indegree[v] = indegree[v] - 1
      if indegree[v] == 0: queue.enqueue(v)
  if order has fewer than V vertices: there is a cycle`,
    jsCode: `function topologicalSort(graph) {
  // graph: Map<vertex, Array<vertex>> (directed)
  const indegree = new Map([...graph.keys()].map((v) => [v, 0]));
  for (const targets of graph.values()) {
    for (const v of targets) indegree.set(v, indegree.get(v) + 1);
  }
  const queue = [...graph.keys()].filter((v) => indegree.get(v) === 0);
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of graph.get(u)) {
      indegree.set(v, indegree.get(v) - 1);
      if (indegree.get(v) === 0) queue.push(v);
    }
  }
  if (order.length < graph.size) throw new Error("Graph has a cycle");
  return order;
}`,
    difficulty: "intermediate",
    tags: ["graph", "directed", "DAG", "queue"],
    howItWorks: [
      "Count each vertex's incoming edges (its prerequisites).",
      "Vertices with no prerequisites can go first: put them in a queue.",
      "Take one out, add it to the order, and remove its outgoing edges.",
      "Any vertex whose count drops to 0 joins the queue.",
      "If some vertices never reach 0, the graph has a cycle and no valid order exists.",
    ],
    useCases: [
      "Task scheduling with dependencies",
      "Build systems and package managers",
      "Course prerequisite planning",
    ],
  },
  "a-star": {
    id: "a-star",
    name: "A* Search",
    description:
      "Finds the cheapest path on a grid by exploring cells in order of cost so far plus a guess of the distance left.",
    category: "pathfinding",
    complexity: {
      time: { best: "O(d)", average: "O(E log V)", worst: "O(E log V)" },
      space: "O(V)",
    },
    pseudoCode: `aStar(grid, start, goal)
  g[start] = 0; open = {start}
  while open is not empty
    current = cell in open with the lowest f = g + h
    if current == goal: follow parents back to start, done
    for each neighbour n of current that is not a wall
      cost = g[current] + cost(n)   // 1, or 5 for a heavy cell
      if cost < g[n]: g[n] = cost; parent[n] = current; add n to open
  no path: the goal is walled off`,
    jsCode: `function aStar(grid, start, goal) {
  // grid.neighbours(cell) -> open cells, grid.cost(cell) -> 1 or 5
  const h = (cell) => manhattan(cell, goal);
  const g = new Map([[start, 0]]);
  const parent = new Map();
  const open = [{ cell: start, f: h(start) }]; // use a binary heap for big grids
  const closed = new Set();
  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const { cell } = open.shift();
    if (closed.has(cell)) continue;
    if (cell === goal) return buildPath(parent, goal);
    closed.add(cell);
    for (const next of grid.neighbours(cell)) {
      const cost = g.get(cell) + grid.cost(next);
      if (cost < (g.get(next) ?? Infinity)) {
        g.set(next, cost);
        parent.set(next, cell);
        open.push({ cell: next, f: cost + h(next) });
      }
    }
  }
  return null; // no path
}`,
    difficulty: "advanced",
    tags: ["pathfinding", "heuristic", "grid", "optimal"],
    howItWorks: [
      "Every cell gets g = the cheapest known cost from the start, and h = a guess of the distance to the goal (Manhattan distance).",
      "Always explore the frontier cell with the smallest f = g + h: the most promising one.",
      "Update neighbours when going through the current cell is cheaper.",
      "Because h never overestimates, the first time the goal is explored the path is optimal.",
      "It explores far fewer cells than Dijkstra by heading towards the goal.",
    ],
    useCases: [
      "Game AI and unit movement",
      "Route planning on maps",
      "Robot navigation",
    ],
  },
  "grid-dijkstra": {
    id: "grid-dijkstra",
    name: "Dijkstra on a Grid",
    description:
      "Finds the cheapest path on a grid by always exploring the cell with the lowest cost so far, spreading out evenly in every direction.",
    category: "pathfinding",
    complexity: {
      time: { best: "O(E log V)", average: "O(E log V)", worst: "O(E log V)" },
      space: "O(V)",
    },
    pseudoCode: `dijkstra(grid, start, goal)
  g[start] = 0; open = {start}
  while open is not empty
    current = cell in open with the lowest cost g
    if current == goal: follow parents back to start, done
    for each neighbour n of current that is not a wall
      cost = g[current] + cost(n)   // 1, or 5 for a heavy cell
      if cost < g[n]: g[n] = cost; parent[n] = current; add n to open
  no path: the goal is walled off`,
    jsCode: `function dijkstraGrid(grid, start, goal) {
  const g = new Map([[start, 0]]);
  const parent = new Map();
  const open = [{ cell: start, g: 0 }];
  const closed = new Set();
  while (open.length) {
    open.sort((a, b) => a.g - b.g);
    const { cell } = open.shift();
    if (closed.has(cell)) continue;
    if (cell === goal) return buildPath(parent, goal);
    closed.add(cell);
    for (const next of grid.neighbours(cell)) {
      const cost = g.get(cell) + grid.cost(next);
      if (cost < (g.get(next) ?? Infinity)) {
        g.set(next, cost);
        parent.set(next, cell);
        open.push({ cell: next, g: cost });
      }
    }
  }
  return null;
}`,
    difficulty: "advanced",
    tags: ["pathfinding", "grid", "optimal", "weighted"],
    howItWorks: [
      "Start with cost 0 at the start cell.",
      "Always explore the frontier cell with the lowest cost so far.",
      "Entering a normal cell costs 1, a heavy cell costs 5.",
      "It finds the cheapest path but has no sense of direction, so it explores a growing 'circle' around the start.",
    ],
    useCases: [
      "Cheapest routes when terrain has different costs",
      "Baseline to compare A* against",
    ],
  },
  "grid-bfs": {
    id: "grid-bfs",
    name: "BFS on a Grid",
    description:
      "Explores the grid ring by ring from the start with a queue, finding the path with the fewest moves (ignoring cell costs).",
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
      "The first path to reach the goal has the fewest moves, but heavy cells are treated like normal ones.",
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
      time: { best: "O(d)", average: "O(E log V)", worst: "O(E log V)" },
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
      "Only the guess h (distance to the goal) decides what to explore next; the cost so far is ignored.",
      "It heads straight for the goal and often explores very few cells.",
      "Walls in the way can lead it into dead ends, and the path can be longer than necessary.",
      "Compare it with A*, which balances the guess with the real cost.",
    ],
    useCases: [
      "Quick 'good enough' paths",
      "Showing why A* adds the cost so far",
    ],
  },
};

export const ALGORITHM_CATEGORIES = {
  sorting: "Sorting",
  searching: "Searching",
  "graph-traversal": "Graph Traversal",
  "graph-algorithms": "Weighted & Directed Graphs",
  pathfinding: "Grid Pathfinding",
};

export const DIFFICULTIES = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
