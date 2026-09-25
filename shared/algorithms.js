export const ALGORITHMS = {
    'bubble-sort': {
        id: 'bubble-sort',
        name: 'Bubble Sort',
        description: 'A simple sorting algorithm that repeatedly steps through the list and compares adjacent elements.',
        category: 'sorting',
        complexity: {
            time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
            space: 'O(1)',
        },
        pseudoCode: `for i = 0 to n-1
  for j = 0 to n-i-2
    if arr[j] > arr[j+1]
      swap(arr[j], arr[j+1])`,
        jsCode: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
        difficulty: 'beginner',
        tags: ['stable', 'in-place', 'comparison-based'],
    },
    'selection-sort': {
        id: 'selection-sort',
        name: 'Selection Sort',
        description: 'Divides the list into sorted and unsorted parts, repeatedly selecting the minimum element.',
        category: 'sorting',
        complexity: {
            time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
            space: 'O(1)',
        },
        pseudoCode: `for i = 0 to n-1
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
        difficulty: 'beginner',
        tags: ['unstable', 'in-place', 'comparison-based'],
    },
    'insertion-sort': {
        id: 'insertion-sort',
        name: 'Insertion Sort',
        description: 'Builds the sorted array one item at a time by inserting elements into their correct position.',
        category: 'sorting',
        complexity: {
            time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
            space: 'O(1)',
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
        difficulty: 'beginner',
        tags: ['stable', 'in-place', 'adaptive', 'comparison-based'],
    },
    'merge-sort': {
        id: 'merge-sort',
        name: 'Merge Sort',
        description: 'Divides the array into halves, recursively sorts them, and merges back together.',
        category: 'sorting',
        complexity: {
            time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
            space: 'O(n)',
        },
        pseudoCode: `function mergeSort(arr, left, right)
  if left < right
    mid = (left + right) / 2
    mergeSort(arr, left, mid)
    mergeSort(arr, mid+1, right)
    merge(arr, left, mid, right)`,
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
    result.push(left[i] < right[j] ? left[i++] : right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
        difficulty: 'intermediate',
        tags: ['stable', 'divide-and-conquer', 'recursive'],
    },
    'quick-sort': {
        id: 'quick-sort',
        name: 'Quick Sort',
        description: 'Selects a pivot element and partitions the array around it, then recursively sorts parts.',
        category: 'sorting',
        complexity: {
            time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
            space: 'O(log n)',
        },
        pseudoCode: `function quickSort(arr, low, high)
  if low < high
    pi = partition(arr, low, high)
    quickSort(arr, low, pi-1)
    quickSort(arr, pi+1, high)`,
        jsCode: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
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
        difficulty: 'intermediate',
        tags: ['unstable', 'in-place', 'divide-and-conquer'],
    },
    'heap-sort': {
        id: 'heap-sort',
        name: 'Heap Sort',
        description: 'Uses a heap data structure to sort elements by repeatedly extracting the maximum.',
        category: 'sorting',
        complexity: {
            time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
            space: 'O(1)',
        },
        pseudoCode: `function heapSort(arr)
  buildMaxHeap(arr)
  for i = n-1 down to 1
    swap(arr[0], arr[i])
    heapify(arr, 0, i)`,
        jsCode: `function heapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
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
        difficulty: 'intermediate',
        tags: ['unstable', 'in-place'],
    },
    'linear-search': {
        id: 'linear-search',
        name: 'Linear Search',
        description: 'Searches for an element by checking each element sequentially.',
        category: 'searching',
        complexity: {
            time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
            space: 'O(1)',
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
        difficulty: 'beginner',
        tags: ['sequential', 'unsorted'],
    },
    'binary-search': {
        id: 'binary-search',
        name: 'Binary Search',
        description: 'Efficiently searches a sorted array by halving the search space each iteration.',
        category: 'searching',
        complexity: {
            time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
            space: 'O(1)',
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
        difficulty: 'intermediate',
        tags: ['divide-and-conquer', 'sorted-array'],
    },
    'bfs': {
        id: 'bfs',
        name: 'Breadth-First Search',
        description: 'Traverses a graph level by level, exploring all neighbors at the current depth.',
        category: 'graph-traversal',
        complexity: {
            time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
            space: 'O(V)',
        },
        pseudoCode: `queue = [start]
visited = {start}
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
        difficulty: 'intermediate',
        tags: ['graph', 'tree', 'shortest-path'],
    },
    'dfs': {
        id: 'dfs',
        name: 'Depth-First Search',
        description: 'Traverses a graph by exploring as far as possible along each branch.',
        category: 'graph-traversal',
        complexity: {
            time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
            space: 'O(V)',
        },
        pseudoCode: `visited = {}
function dfs(v)
  visited.add(v)
  for each neighbor of v
    if neighbor not visited
      dfs(neighbor)`,
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
        difficulty: 'intermediate',
        tags: ['graph', 'tree', 'recursive'],
    },
};
export const ALGORITHM_CATEGORIES = {
    'sorting': 'Sorting',
    'searching': 'Searching',
    'graph-traversal': 'Graph Traversal',
    'data-structure': 'Data Structures',
};
export const DIFFICULTIES = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
};