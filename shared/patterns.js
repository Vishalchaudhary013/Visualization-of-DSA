// Problem-solving patterns, grouped in roadmap order (learn the groups top to
// bottom). `problems` are interactive problems from shared/problems.js;
// `visualizers` link to existing algorithm / data structure pages; `practice`
// lists well-known LeetCode problems that use the pattern.

export const PATTERN_GROUPS = [
  { id: "arrays-strings", name: "Arrays & Strings" },
  { id: "linked-list", name: "Linked List" },
  { id: "stack", name: "Stack" },
  { id: "trees", name: "Trees" },
  { id: "heap", name: "Heap" },
  { id: "intervals", name: "Intervals" },
  { id: "graphs", name: "Graphs" },
  { id: "backtracking", name: "Backtracking & Recursion" },
  { id: "greedy", name: "Greedy" },
  { id: "dp", name: "Dynamic Programming" },
];

export const PATTERN_LIST = [
  {
    id: "hashing",
    name: "HashMap / HashSet",
    group: "arrays-strings",
    summary:
      "Store what you have seen in a hash map or set so that “have I seen X?” and “how many times?” take O(1) instead of a second loop.",
    signals: [
      "You need pairs that add up to a target, or complements",
      "Counting frequencies, duplicates or anagrams",
      "Turning an O(n²) double loop into a single pass",
    ],
    complexity: "O(n) time, O(n) space",
    template: `const seen = new Map();
for (let i = 0; i < nums.length; i++) {
  if (seen.has(want(nums[i]))) return answer(i);
  seen.set(nums[i], i);
}`,
    problems: ["two-sum"],
    visualizers: [{ label: "Hash Table", to: "/data-structures/hash-table" }],
    practice: [
      "1. Two Sum",
      "49. Group Anagrams",
      "217. Contains Duplicate",
      "128. Longest Consecutive Sequence",
    ],
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    group: "arrays-strings",
    summary:
      "Move two indices through the array, usually from both ends towards each other, using the order of the data to skip work.",
    signals: [
      "The array is sorted, or you can sort it",
      "Pairs or triplets with a target sum",
      "Palindromes and reversing in place",
    ],
    complexity: "O(n) time, O(1) space",
    template: `let left = 0, right = nums.length - 1;
while (left < right) {
  if (good(left, right)) record(left, right);
  if (moveLeft(left, right)) left++;
  else right--;
}`,
    problems: ["container-with-most-water"],
    visualizers: [],
    practice: [
      "11. Container With Most Water",
      "15. 3Sum",
      "125. Valid Palindrome",
      "167. Two Sum II",
    ],
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    group: "arrays-strings",
    summary:
      "Keep a window [left, right] over a contiguous part of the array or string. Grow it on the right and shrink it on the left while keeping some condition true.",
    signals: [
      "Longest / shortest substring or subarray with a property",
      "“At most k distinct”, “no repeats”, “sum at least s”",
      "Fixed-size windows (max sum of k consecutive)",
    ],
    complexity: "O(n) time",
    template: `let left = 0;
for (let right = 0; right < s.length; right++) {
  add(s[right]);
  while (!valid()) remove(s[left++]);
  best = Math.max(best, right - left + 1);
}`,
    problems: ["longest-substring-without-repeating-characters"],
    visualizers: [],
    practice: [
      "3. Longest Substring Without Repeating Characters",
      "76. Minimum Window Substring",
      "424. Longest Repeating Character Replacement",
      "209. Minimum Size Subarray Sum",
    ],
  },
  {
    id: "prefix-sum",
    name: "Prefix Sum",
    group: "arrays-strings",
    summary:
      "prefix[i] = sum of the first i elements. Then any range sum is prefix[r + 1] − prefix[l] in O(1), and with a hash map you can count ranges with a given sum.",
    signals: [
      "Many range-sum queries",
      "Count subarrays whose sum equals k",
      "Balance problems (equal 0s and 1s)",
    ],
    complexity: "O(n) build, O(1) per range",
    template: `const prefix = [0];
for (const x of nums) prefix.push(prefix.at(-1) + x);
const rangeSum = (l, r) => prefix[r + 1] - prefix[l];`,
    problems: ["subarray-sum-equals-k"],
    visualizers: [],
    practice: [
      "560. Subarray Sum Equals K",
      "303. Range Sum Query",
      "238. Product of Array Except Self",
      "525. Contiguous Array",
    ],
  },
  {
    id: "binary-search",
    name: "Binary Search",
    group: "arrays-strings",
    summary:
      "Halve the search space each step by checking the middle. Works on sorted arrays and on any yes/no question whose answer flips only once (“binary search on the answer”).",
    signals: [
      "Sorted input and O(log n) required",
      "Find the first / last position where something becomes true",
      "Minimize the maximum, or maximize the minimum",
    ],
    complexity: "O(log n) time",
    template: `let left = 0, right = n - 1;
while (left <= right) {
  const mid = Math.floor((left + right) / 2);
  if (found(mid)) return mid;
  if (tooSmall(mid)) left = mid + 1;
  else right = mid - 1;
}`,
    problems: ["binary-search"],
    visualizers: [
      {
        label: "Binary Search visualizer",
        to: "/visualizer?algo=binary-search",
      },
    ],
    practice: [
      "704. Binary Search",
      "33. Search in Rotated Sorted Array",
      "153. Find Minimum in Rotated Sorted Array",
      "875. Koko Eating Bananas",
    ],
  },
  {
    id: "kadane",
    name: "Kadane's Algorithm",
    group: "arrays-strings",
    summary:
      "For the best subarray ending at each index, either extend the previous one or start fresh. Keep the best seen.",
    signals: [
      "Maximum (or minimum) sum of a contiguous subarray",
      "Maximum product subarray (track min too)",
      "Circular variants",
    ],
    complexity: "O(n) time, O(1) space",
    template: `let current = nums[0], best = nums[0];
for (let i = 1; i < nums.length; i++) {
  current = Math.max(nums[i], current + nums[i]);
  best = Math.max(best, current);
}`,
    problems: [],
    visualizers: [],
    practice: [
      "53. Maximum Subarray",
      "152. Maximum Product Subarray",
      "918. Maximum Sum Circular Subarray",
    ],
  },
  {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    group: "arrays-strings",
    summary:
      "Work on the binary form of numbers: XOR cancels pairs, x & (x − 1) drops the lowest set bit, and masks represent subsets.",
    signals: [
      "Find the single / missing number",
      "Count set bits",
      "Enumerate subsets with a bitmask",
    ],
    complexity: "O(n) or O(bits)",
    template: `let x = 0;
for (const n of nums) x ^= n;   // pairs cancel out
const lowest = x & -x;          // lowest set bit
const hasBit = (n, i) => (n >> i) & 1;`,
    problems: [],
    visualizers: [],
    practice: [
      "136. Single Number",
      "191. Number of 1 Bits",
      "268. Missing Number",
      "338. Counting Bits",
    ],
  },
  {
    id: "matrix",
    name: "Matrix Manipulation",
    group: "arrays-strings",
    summary:
      "Treat a 2-D grid with index arithmetic: transpose, rotate, spiral walks and in-place marking.",
    signals: [
      "Rotate or transpose an image",
      "Spiral or diagonal traversal",
      "Set rows/columns to zero in place",
    ],
    complexity: "O(rows × cols)",
    template: `// rotate 90° clockwise = transpose + reverse each row
for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++)
    [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
m.forEach((row) => row.reverse());`,
    problems: [],
    visualizers: [],
    practice: [
      "48. Rotate Image",
      "54. Spiral Matrix",
      "73. Set Matrix Zeroes",
    ],
  },
  {
    id: "linked-list",
    name: "Linked List (Reverse & Merge)",
    group: "linked-list",
    summary:
      "Rewire next pointers carefully. A dummy head simplifies edge cases; reversing uses prev / current / next.",
    signals: [
      "Reverse a whole list or part of it",
      "Merge sorted lists",
      "Remove or insert nodes in one pass",
    ],
    complexity: "O(n) time, O(1) space",
    template: `let prev = null, current = head;
while (current) {
  const next = current.next;
  current.next = prev;
  prev = current;
  current = next;
}
return prev; // new head`,
    problems: [],
    visualizers: [{ label: "Linked List", to: "/data-structures/linked-list" }],
    practice: [
      "206. Reverse Linked List",
      "21. Merge Two Sorted Lists",
      "92. Reverse Linked List II",
      "19. Remove Nth Node From End",
    ],
  },
  {
    id: "fast-slow-pointers",
    name: "Fast & Slow Pointers",
    group: "linked-list",
    summary:
      "Move one pointer twice as fast as the other. They meet if there is a cycle, and when fast reaches the end, slow is in the middle.",
    signals: [
      "Detect a cycle in a linked list",
      "Find the middle node",
      "Cycle start, happy numbers, duplicate number",
    ],
    complexity: "O(n) time, O(1) space",
    template: `let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow === fast) return true; // cycle
}
return false;`,
    problems: [],
    visualizers: [{ label: "Linked List", to: "/data-structures/linked-list" }],
    practice: [
      "141. Linked List Cycle",
      "876. Middle of the Linked List",
      "142. Linked List Cycle II",
      "287. Find the Duplicate Number",
    ],
  },
  {
    id: "stack",
    name: "Stack",
    group: "stack",
    summary:
      "Last in, first out. Push things you need to come back to and pop them when they are resolved.",
    signals: [
      "Matching brackets",
      "Undo / nested structures",
      "Evaluating expressions",
    ],
    complexity: "O(n) time",
    template: `const stack = [];
for (const ch of s) {
  if (opens(ch)) stack.push(ch);
  else if (stack.pop() !== partner(ch)) return false;
}
return stack.length === 0;`,
    problems: [],
    visualizers: [{ label: "Stack", to: "/data-structures/stack" }],
    practice: [
      "20. Valid Parentheses",
      "155. Min Stack",
      "150. Evaluate Reverse Polish Notation",
    ],
  },
  {
    id: "monotonic-stack",
    name: "Monotonic Stack",
    group: "stack",
    summary:
      "Keep the stack sorted (increasing or decreasing). When a new element breaks the order, everything popped has just found its next greater / smaller element.",
    signals: [
      "Next greater / smaller element",
      "Days until a warmer temperature",
      "Largest rectangle in a histogram",
    ],
    complexity: "O(n) time: each index is pushed and popped once",
    template: `const answer = Array(n).fill(-1), stack = [];
for (let i = 0; i < n; i++) {
  while (stack.length && nums[stack.at(-1)] < nums[i])
    answer[stack.pop()] = nums[i];
  stack.push(i);
}`,
    problems: [],
    visualizers: [],
    practice: [
      "739. Daily Temperatures",
      "496. Next Greater Element I",
      "84. Largest Rectangle in Histogram",
    ],
  },
  {
    id: "tree-dfs",
    name: "Tree DFS",
    group: "trees",
    summary:
      "Recurse into the children first and combine their answers (post-order), or pass information down (pre-order).",
    signals: [
      "Height, diameter, path sums",
      "Validate or compare trees",
      "Lowest common ancestor",
    ],
    complexity: "O(n) time, O(h) stack",
    template: `function dfs(node) {
  if (!node) return 0;
  const left = dfs(node.left);
  const right = dfs(node.right);
  return 1 + Math.max(left, right);
}`,
    problems: [],
    visualizers: [{ label: "Binary Search Tree", to: "/data-structures/bst" }],
    practice: [
      "104. Maximum Depth of Binary Tree",
      "543. Diameter of Binary Tree",
      "112. Path Sum",
      "236. Lowest Common Ancestor",
    ],
  },
  {
    id: "tree-bfs",
    name: "Tree BFS",
    group: "trees",
    summary:
      "Visit the tree level by level with a queue; the queue size at the start of a round is the size of that level.",
    signals: [
      "Level order traversal",
      "Right side view, zigzag order",
      "Minimum depth",
    ],
    complexity: "O(n) time, O(width) space",
    template: `const queue = [root], levels = [];
while (queue.length) {
  const level = [];
  for (let k = queue.length; k > 0; k--) {
    const node = queue.shift();
    level.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  levels.push(level);
}`,
    problems: [],
    visualizers: [{ label: "Binary Search Tree", to: "/data-structures/bst" }],
    practice: [
      "102. Binary Tree Level Order Traversal",
      "199. Binary Tree Right Side View",
      "111. Minimum Depth of Binary Tree",
    ],
  },
  {
    id: "bst",
    name: "Binary Search Tree",
    group: "trees",
    summary:
      "Left subtree < node < right subtree, so you can search like binary search and an in-order walk gives sorted order.",
    signals: [
      "Search, insert, delete in a BST",
      "kth smallest element",
      "Validate a BST with min / max bounds",
    ],
    complexity: "O(h) per operation",
    template: `function search(node, target) {
  while (node && node.val !== target)
    node = target < node.val ? node.left : node.right;
  return node;
}`,
    problems: [],
    visualizers: [{ label: "Binary Search Tree", to: "/data-structures/bst" }],
    practice: [
      "700. Search in a BST",
      "98. Validate Binary Search Tree",
      "230. Kth Smallest Element in a BST",
    ],
  },
  {
    id: "trie",
    name: "Tree",
    group: "trees",
    summary:
      "A tree of characters where each path from the root spells a prefix. Lookups take O(word length), whatever the number of words.",
    signals: [
      "Prefix search / autocomplete",
      "Word dictionaries and word search",
      "Longest common prefix",
    ],
    complexity: "O(L) per word",
    template: `const root = {};
function insert(word) {
  let node = root;
  for (const ch of word) node = node[ch] ??= {};
  node.end = true;
}`,
    problems: [],
    visualizers: [{ label: "Tree", to: "/data-structures/trie" }],
    practice: [
      "208. Implement Trie",
      "211. Design Add and Search Words",
      "212. Word Search II",
    ],
  },
  {
    id: "segment-tree",
    name: "Segment Tree / Fenwick Tree",
    group: "trees",
    summary:
      "Trees over array ranges that answer range queries (sum, min, max) and handle point updates, both in O(log n).",
    signals: [
      "Range sums with updates in between",
      "Count smaller elements after self",
      "Range minimum queries",
    ],
    complexity: "O(log n) query and update",
    template: `// Fenwick tree (1-indexed)
const add = (i, delta) => { for (; i <= n; i += i & -i) tree[i] += delta; };
const sum = (i) => { let s = 0; for (; i > 0; i -= i & -i) s += tree[i]; return s; };`,
    problems: [],
    visualizers: [],
    practice: [
      "307. Range Sum Query - Mutable",
      "315. Count of Smaller Numbers After Self",
      "218. The Skyline Problem",
    ],
  },
  {
    id: "heap",
    name: "Heap / Priority Queue",
    group: "heap",
    summary:
      "Always get the smallest (or largest) item in O(log n). Keep a heap of size k for “top k” questions.",
    signals: [
      "Top k / kth largest",
      "Merge k sorted lists",
      "Running median, scheduling by priority",
    ],
    complexity: "O(log n) push / pop",
    template: `// keep the k largest: a min-heap of size k
for (const x of nums) {
  heap.push(x);
  if (heap.size() > k) heap.pop(); // drops the smallest
}
return heap.peek(); // kth largest`,
    problems: [],
    visualizers: [{ label: "Binary Heap", to: "/data-structures/heap" }],
    practice: [
      "215. Kth Largest Element in an Array",
      "347. Top K Frequent Elements",
      "23. Merge k Sorted Lists",
      "295. Find Median from Data Stream",
    ],
  },
  {
    id: "merge-intervals",
    name: "Merge Intervals",
    group: "intervals",
    summary:
      "Sort intervals by start, then walk once: overlap with the last kept interval means merge, otherwise start a new one.",
    signals: [
      "Overlapping ranges or meetings",
      "Insert an interval",
      "Free time between schedules",
    ],
    complexity: "O(n log n) for the sort",
    template: `intervals.sort((a, b) => a[0] - b[0]);
const merged = [];
for (const [start, end] of intervals) {
  const last = merged.at(-1);
  if (last && start <= last[1]) last[1] = Math.max(last[1], end);
  else merged.push([start, end]);
}`,
    problems: [],
    visualizers: [],
    practice: [
      "56. Merge Intervals",
      "57. Insert Interval",
      "435. Non-overlapping Intervals",
    ],
  },
  {
    id: "sweep-line",
    name: "Sweep Line",
    group: "intervals",
    summary:
      "Turn intervals into +1 / −1 events, sort the events by time and sweep through them keeping a running count.",
    signals: [
      "Maximum number of overlapping intervals",
      "Meeting rooms needed",
      "Skyline / events over time",
    ],
    complexity: "O(n log n)",
    template: `const events = [];
for (const [s, e] of intervals) events.push([s, 1], [e, -1]);
events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
let active = 0, most = 0;
for (const [, change] of events) most = Math.max(most, (active += change));`,
    problems: [],
    visualizers: [],
    practice: [
      "253. Meeting Rooms II",
      "1094. Car Pooling",
      "218. The Skyline Problem",
    ],
  },
  {
    id: "graph-dfs",
    name: "Graph DFS",
    group: "graphs",
    summary:
      "Go as deep as possible before backtracking, marking visited nodes. Good for connectivity, components and exploring all paths.",
    signals: [
      "Count connected components",
      "Clone a graph",
      "Reachability from a node",
    ],
    complexity: "O(V + E)",
    template: `const visited = new Set();
function dfs(node) {
  if (visited.has(node)) return;
  visited.add(node);
  for (const next of graph[node]) dfs(next);
}`,
    problems: [],
    visualizers: [{ label: "DFS visualizer", to: "/visualizer?algo=dfs" }],
    practice: [
      "133. Clone Graph",
      "547. Number of Provinces",
      "797. All Paths From Source to Target",
    ],
  },
  {
    id: "graph-bfs",
    name: "Graph BFS",
    group: "graphs",
    summary:
      "Explore the graph in rings around the start with a queue. The first time you reach a node is by the fewest edges.",
    signals: [
      "Shortest path when every edge costs the same",
      "Word ladder style transformations",
      "Spreading from several sources at once",
    ],
    complexity: "O(V + E)",
    template: `const dist = new Map([[start, 0]]), queue = [start];
while (queue.length) {
  const node = queue.shift();
  for (const next of graph[node]) {
    if (dist.has(next)) continue;
    dist.set(next, dist.get(node) + 1);
    queue.push(next);
  }
}`,
    problems: [],
    visualizers: [{ label: "BFS visualizer", to: "/visualizer?algo=bfs" }],
    practice: [
      "127. Word Ladder",
      "1091. Shortest Path in Binary Matrix",
      "752. Open the Lock",
    ],
  },
  {
    id: "grid-traversal",
    name: "Grid / Matrix DFS-BFS",
    group: "graphs",
    summary:
      "A grid is a graph whose nodes are cells and whose edges go up, down, left and right. Flood fill with DFS, or BFS for fewest steps.",
    signals: [
      "Number of islands",
      "Rotting oranges / spreading in rounds",
      "Shortest path through a maze",
    ],
    complexity: "O(rows × cols)",
    template: `const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function fill(r, c) {
  if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== "1") return;
  grid[r][c] = "0";
  for (const [dr, dc] of dirs) fill(r + dr, c + dc);
}`,
    problems: [],
    visualizers: [
      { label: "BFS on a Grid", to: "/visualizer?algo=grid-bfs" },
      { label: "Greedy Best-First", to: "/visualizer?algo=greedy-best-first" },
    ],
    practice: [
      "200. Number of Islands",
      "994. Rotting Oranges",
      "695. Max Area of Island",
    ],
  },
  {
    id: "cycle-detection",
    name: "Cycle Detection",
    group: "graphs",
    summary:
      "Undirected: a visited neighbour that is not your parent means a cycle. Directed: a node that is still on the DFS path (gray) means a cycle.",
    signals: [
      "Can all courses be finished?",
      "Is this graph a valid tree?",
      "Deadlock / circular dependency checks",
    ],
    complexity: "O(V + E)",
    template: `const state = Array(n).fill(0); // 0 new, 1 on path, 2 done
function hasCycle(u) {
  if (state[u] === 1) return true;
  if (state[u] === 2) return false;
  state[u] = 1;
  if (graph[u].some(hasCycle)) return true;
  state[u] = 2;
  return false;
}`,
    problems: ["course-schedule-ii"],
    visualizers: [{ label: "DFS visualizer", to: "/visualizer?algo=dfs" }],
    practice: [
      "207. Course Schedule",
      "261. Graph Valid Tree",
      "802. Find Eventual Safe States",
    ],
  },
  {
    id: "topological-sort",
    name: "Topological Sort",
    group: "graphs",
    summary:
      "Order the nodes of a directed graph so every edge points forward. Kahn's algorithm repeatedly takes a node with no incoming edges left.",
    signals: [
      "Prerequisites / build order / task scheduling",
      "“Do X before Y” constraints",
      "Detect whether an order exists (no cycle)",
    ],
    complexity: "O(V + E)",
    template: `const queue = nodes.filter((v) => indegree[v] === 0), order = [];
while (queue.length) {
  const v = queue.shift();
  order.push(v);
  for (const next of graph[v]) if (--indegree[next] === 0) queue.push(next);
}
// order.length < n means there is a cycle`,
    problems: ["course-schedule-ii"],
    visualizers: [],
    practice: [
      "210. Course Schedule II",
      "207. Course Schedule",
      "269. Alien Dictionary",
    ],
  },
  {
    id: "union-find",
    name: "Union Find (DSU)",
    group: "graphs",
    summary:
      "Keep disjoint groups with a parent array. find follows parents to the group's root; union links two roots. Path compression makes both nearly O(1).",
    signals: [
      "Are these two nodes connected?",
      "Number of components as edges are added",
      "Redundant connection / Kruskal's MST",
    ],
    complexity: "≈ O(1) per operation",
    template: `const parent = Array.from({ length: n }, (_, i) => i);
const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
const union = (a, b) => {
  const [ra, rb] = [find(a), find(b)];
  if (ra === rb) return false; // already connected
  parent[ra] = rb;
  return true;
};`,
    problems: [],
    visualizers: [{ label: "Union-Find", to: "/data-structures/union-find" }],
    practice: [
      "684. Redundant Connection",
      "547. Number of Provinces",
      "721. Accounts Merge",
    ],
  },
  {
    id: "dijkstra",
    name: "Dijkstra",
    group: "graphs",
    summary:
      "Shortest paths with non-negative edge weights: always finalize the closest unfinished node (a min-heap), then relax its edges.",
    signals: [
      "Weighted shortest path / minimum time / cheapest cost",
      "All weights are ≥ 0",
      "Network delay, path with minimum effort",
    ],
    complexity: "O(E log V)",
    template: `dist[start] = 0; heap.push([0, start]);
while (heap.size()) {
  const [d, u] = heap.pop();
  if (d > dist[u]) continue;
  for (const [v, w] of graph[u])
    if (d + w < dist[v]) heap.push([(dist[v] = d + w), v]);
}`,
    problems: ["network-delay-time"],
    visualizers: [],
    practice: [
      "743. Network Delay Time",
      "1631. Path With Minimum Effort",
      "787. Cheapest Flights Within K Stops",
    ],
  },
  {
    id: "backtracking",
    name: "Backtracking",
    group: "backtracking",
    summary:
      "Build a solution one choice at a time; after exploring a choice, undo it and try the next. Prune branches that can't lead to an answer.",
    signals: [
      "All subsets, permutations or combinations",
      "N-Queens, Sudoku",
      "Word search in a grid",
    ],
    complexity: "Exponential; pruning keeps it practical",
    template: `function backtrack(path, choices) {
  if (isComplete(path)) return results.push([...path]);
  for (const choice of choices) {
    if (!allowed(choice)) continue;
    path.push(choice);
    backtrack(path, next(choices, choice));
    path.pop(); // undo
  }
}`,
    problems: [],
    visualizers: [],
    practice: [
      "78. Subsets",
      "46. Permutations",
      "39. Combination Sum",
      "51. N-Queens",
    ],
  },
  {
    id: "divide-and-conquer",
    name: "Divide & Conquer",
    group: "backtracking",
    summary:
      "Split the problem into independent halves, solve each recursively, then combine the answers.",
    signals: [
      "Sorting (merge sort, quick sort)",
      "Problems on halves of an array or tree",
      "Counting inversions, closest pair",
    ],
    complexity: "Often O(n log n)",
    template: `function solve(lo, hi) {
  if (hi - lo <= 1) return base(lo, hi);
  const mid = Math.floor((lo + hi) / 2);
  return combine(solve(lo, mid), solve(mid, hi));
}`,
    problems: [],
    visualizers: [
      { label: "Merge Sort", to: "/visualizer?algo=merge-sort" },
      { label: "Quick Sort", to: "/visualizer?algo=quick-sort" },
    ],
    practice: [
      "912. Sort an Array",
      "169. Majority Element",
      "108. Convert Sorted Array to BST",
    ],
  },
  {
    id: "greedy",
    name: "Greedy",
    group: "greedy",
    summary:
      "Make the locally best choice at every step and never look back. Works when you can argue the local choice never hurts the final answer.",
    signals: [
      "Interval scheduling (pick the earliest end)",
      "Jump game, gas station",
      "Assigning resources in sorted order",
    ],
    complexity: "Usually O(n) or O(n log n)",
    template: `items.sort(byBestFirst);
let result = 0;
for (const item of items) {
  if (fits(item)) {
    take(item);
    result++;
  }
}`,
    problems: [],
    visualizers: [],
    practice: [
      "55. Jump Game",
      "134. Gas Station",
      "435. Non-overlapping Intervals",
      "763. Partition Labels",
    ],
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    group: "dp",
    summary:
      "Break the problem into overlapping subproblems, store each answer once (in a table or memo) and build bigger answers from smaller ones. Common shapes: 1-D, 2-D grids, knapsack, string DP and state machines.",
    signals: [
      "“Number of ways”, “minimum cost”, “maximum value”",
      "Choices at each step that depend on earlier choices",
      "A brute-force recursion that repeats the same calls",
    ],
    complexity: "Number of states × work per state",
    template: `// 1. define dp[state]  2. base cases  3. transition  4. order
const dp = Array(n + 1).fill(0);
dp[0] = base;
for (let i = 1; i <= n; i++)
  dp[i] = best(dp[i - 1], dp[i - 2] /* ... */);
return dp[n];`,
    problems: ["knapsack", "longest-common-subsequence", "edit-distance"],
    visualizers: [
      { label: "Fibonacci (1-D DP)", to: "/visualizer?algo=fibonacci" },
    ],
    practice: [
      "70. Climbing Stairs (1-D)",
      "62. Unique Paths (2-D)",
      "416. Partition Equal Subset Sum (knapsack)",
      "1143. Longest Common Subsequence (string)",
      "309. Best Time to Buy and Sell Stock with Cooldown (state)",
    ],
  },
];

export const PATTERNS = Object.fromEntries(
  PATTERN_LIST.map((pattern) => [pattern.id, pattern]),
);
