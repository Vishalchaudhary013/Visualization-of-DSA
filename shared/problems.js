// Interactive practice problems (LeetCode style). The visualizer highlights
// lines of `code`: step generators in client/features/patterns/problems set
// each step's `line` to a 0-based line index of this code.
//
// Field types: "int", "int[]", "int[][]" (with `tuple` = inner length) and
// "string". Limits keep the visualization readable.

export const PROBLEM_DIFFICULTIES = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const PROBLEMS = {
  "two-sum": {
    id: "two-sum",
    title: "Two Sum",
    leetcode: 1,
    difficulty: "easy",
    pattern: "hashing",
    view: "array",
    statement:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may not use the same element twice.",
    fields: [
      {
        name: "nums",
        type: "int[]",
        minLength: 2,
        maxLength: 12,
        min: -99,
        max: 99,
      },
      { name: "target", type: "int", min: -999, max: 999 },
    ],
    examples: [
      { nums: [2, 7, 11, 15], target: 9 },
      { nums: [3, 2, 4], target: 6 },
      { nums: [3, 3], target: 6 },
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    idea: "For every number, the partner it needs is target − num. A hash map of the numbers seen so far answers “have I seen the partner?” in O(1).",
    code: `function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);
  }
  return []; // no pair adds up to target
}`,
  },
  "container-with-most-water": {
    id: "container-with-most-water",
    title: "Container With Most Water",
    leetcode: 11,
    difficulty: "medium",
    pattern: "two-pointers",
    view: "array",
    bars: true,
    statement:
      "height[i] is the height of a vertical line at position i. Pick two lines that, together with the x-axis, hold the most water. Return that amount of water.",
    fields: [
      {
        name: "height",
        type: "int[]",
        minLength: 2,
        maxLength: 12,
        min: 0,
        max: 20,
      },
    ],
    examples: [
      { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
      { height: [1, 1] },
      { height: [4, 3, 2, 1, 4] },
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    idea: "Start with the widest container. The shorter line limits the water, so moving the taller line inward can never help: always move the shorter one.",
    code: `function maxArea(height) {
  let left = 0, right = height.length - 1, best = 0;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    best = Math.max(best, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}`,
  },
  "longest-substring-without-repeating-characters": {
    id: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    leetcode: 3,
    difficulty: "medium",
    pattern: "sliding-window",
    view: "array",
    statement:
      "Given a string s, find the length of the longest substring (a contiguous part) that has no repeated characters.",
    fields: [{ name: "s", type: "string", minLength: 0, maxLength: 16 }],
    examples: [{ s: "abcabcbb" }, { s: "bbbbb" }, { s: "pwwkew" }],
    complexity: { time: "O(n)", space: "O(k)" },
    idea: "Grow a window to the right one character at a time. When the new character is already inside, shrink the window from the left until it is not.",
    code: `function lengthOfLongestSubstring(s) {
  const window = new Set();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) {
      window.delete(s[left]);
      left++;
    }
    window.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
  },
  "subarray-sum-equals-k": {
    id: "subarray-sum-equals-k",
    title: "Subarray Sum Equals K",
    leetcode: 560,
    difficulty: "medium",
    pattern: "prefix-sum",
    view: "array",
    statement:
      "Given an array of integers nums and an integer k, return the number of contiguous subarrays whose sum equals k.",
    fields: [
      {
        name: "nums",
        type: "int[]",
        minLength: 1,
        maxLength: 12,
        min: -20,
        max: 20,
      },
      { name: "k", type: "int", min: -99, max: 99 },
    ],
    examples: [
      { nums: [1, 1, 1], k: 2 },
      { nums: [1, 2, 3], k: 3 },
      { nums: [3, 4, 7, 2, -3, 1, 4, 2], k: 7 },
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    idea: "sum(i+1..j) = prefix[j] − prefix[i]. So at each j, count how many earlier prefix sums equal prefix[j] − k, using a hash map of prefix sums seen so far.",
    code: `function subarraySum(nums, k) {
  const count = new Map([[0, 1]]); // prefix sum -> times seen
  let prefix = 0, total = 0;
  for (let i = 0; i < nums.length; i++) {
    prefix += nums[i];
    total += count.get(prefix - k) ?? 0;
    count.set(prefix, (count.get(prefix) ?? 0) + 1);
  }
  return total;
}`,
  },
  "binary-search": {
    id: "binary-search",
    title: "Binary Search",
    leetcode: 704,
    difficulty: "easy",
    pattern: "binary-search",
    view: "array",
    statement:
      "Given an array of integers nums sorted in ascending order and an integer target, return the index of target, or -1 if it is not there. The solution must run in O(log n).",
    fields: [
      {
        name: "nums",
        type: "int[]",
        minLength: 1,
        maxLength: 16,
        min: -99,
        max: 99,
      },
      { name: "target", type: "int", min: -999, max: 999 },
    ],
    examples: [
      { nums: [-1, 0, 3, 5, 9, 12], target: 9 },
      { nums: [-1, 0, 3, 5, 9, 12], target: 2 },
      { nums: [1, 4, 8, 15, 16, 23, 42, 50, 63, 77], target: 63 },
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    idea: "Compare target with the middle element. Because the array is sorted, one half can never contain target, so every step throws half of the range away.",
    code: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  },
  "network-delay-time": {
    id: "network-delay-time",
    title: "Network Delay Time",
    leetcode: 743,
    difficulty: "medium",
    pattern: "dijkstra",
    view: "graph",
    statement:
      "There are n nodes labelled 1 to n. times[i] = [u, v, w] means a signal takes w time to travel from u to v. A signal is sent from node k. Return the time it takes for all n nodes to receive it, or -1 if some node never does.",
    fields: [
      {
        name: "times",
        type: "int[][]",
        tuple: 3,
        minLength: 0,
        maxLength: 16,
        min: 0,
        max: 99,
      },
      { name: "n", type: "int", min: 1, max: 8 },
      { name: "k", type: "int", min: 1, max: 8 },
    ],
    examples: [
      {
        times: [
          [2, 1, 1],
          [2, 3, 1],
          [3, 4, 1],
        ],
        n: 4,
        k: 2,
      },
      { times: [[1, 2, 1]], n: 2, k: 2 },
      {
        times: [
          [1, 2, 4],
          [1, 3, 1],
          [3, 2, 2],
          [2, 4, 1],
          [3, 4, 6],
          [4, 5, 3],
        ],
        n: 5,
        k: 1,
      },
    ],
    complexity: { time: "O(E log V)", space: "O(V + E)" },
    idea: "This is shortest paths from k with non-negative weights: Dijkstra. Always finalize the node with the smallest known time; the answer is the largest of those times.",
    code: `function networkDelayTime(times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) graph[u].push([v, w]);
  const dist = Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const heap = [[0, k]]; // [time, node]; use a real min-heap for big inputs
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]);
    const [time, node] = heap.shift();
    if (time > dist[node]) continue; // outdated entry
    for (const [next, w] of graph[node]) {
      if (time + w < dist[next]) {
        dist[next] = time + w;
        heap.push([dist[next], next]);
      }
    }
  }
  const slowest = Math.max(...dist.slice(1));
  return slowest === Infinity ? -1 : slowest;
}`,
  },
  "course-schedule-ii": {
    id: "course-schedule-ii",
    title: "Course Schedule II",
    leetcode: 210,
    difficulty: "medium",
    pattern: "topological-sort",
    view: "graph",
    statement:
      "There are numCourses courses labelled 0 to numCourses − 1. prerequisites[i] = [a, b] means you must take course b before course a. Return an order in which you can take all courses, or [] if it is impossible.",
    fields: [
      { name: "numCourses", type: "int", min: 1, max: 8 },
      {
        name: "prerequisites",
        type: "int[][]",
        tuple: 2,
        minLength: 0,
        maxLength: 16,
        min: 0,
        max: 7,
      },
    ],
    examples: [
      { numCourses: 2, prerequisites: [[1, 0]] },
      {
        numCourses: 4,
        prerequisites: [
          [1, 0],
          [2, 0],
          [3, 1],
          [3, 2],
        ],
      },
      {
        numCourses: 3,
        prerequisites: [
          [0, 1],
          [1, 2],
          [2, 0],
        ],
      },
    ],
    complexity: { time: "O(V + E)", space: "O(V + E)" },
    idea: "Kahn's algorithm: repeatedly take a course with no prerequisites left (in-degree 0) and remove its outgoing edges. If some courses are never freed, there is a cycle.",
    code: `function findOrder(numCourses, prerequisites) {
  const next = Array.from({ length: numCourses }, () => []);
  const indegree = Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {
    next[pre].push(course);
    indegree[course]++;
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);
  const order = [];
  while (queue.length) {
    const course = queue.shift();
    order.push(course);
    for (const after of next[course]) {
      if (--indegree[after] === 0) queue.push(after);
    }
  }
  return order.length === numCourses ? order : [];
}`,
  },
  knapsack: {
    id: "knapsack",
    title: "0/1 Knapsack",
    leetcode: null,
    difficulty: "medium",
    pattern: "dynamic-programming",
    view: "table",
    statement:
      "Item i weighs weights[i] and is worth values[i]. Each item can be packed at most once. Return the largest total value that fits in a bag that holds capacity weight.",
    fields: [
      {
        name: "weights",
        type: "int[]",
        minLength: 1,
        maxLength: 6,
        min: 1,
        max: 10,
      },
      {
        name: "values",
        type: "int[]",
        minLength: 1,
        maxLength: 6,
        min: 1,
        max: 99,
      },
      { name: "capacity", type: "int", min: 1, max: 15 },
    ],
    examples: [
      { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 },
      { weights: [2, 3, 4, 5], values: [3, 4, 5, 6], capacity: 5 },
      { weights: [5, 6], values: [10, 12], capacity: 4 },
    ],
    complexity: { time: "O(n · W)", space: "O(n · W)" },
    idea: "dp[i][w] = best value using the first i items with capacity w. For each item: skip it (row above) or take it (row above at w − weight, plus its value).",
    code: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // skip item i
      if (weights[i - 1] <= w) {
        const take = dp[i - 1][w - weights[i - 1]] + values[i - 1];
        dp[i][w] = Math.max(dp[i][w], take);
      }
    }
  }
  return dp[n][capacity];
}`,
  },
  "longest-common-subsequence": {
    id: "longest-common-subsequence",
    title: "Longest Common Subsequence",
    leetcode: 1143,
    difficulty: "medium",
    pattern: "dynamic-programming",
    view: "table",
    statement:
      "Given two strings text1 and text2, return the length of their longest common subsequence: letters that appear in both, in the same order, but not necessarily next to each other.",
    fields: [
      {
        name: "text1",
        type: "string",
        minLength: 1,
        maxLength: 10,
        letters: true,
      },
      {
        name: "text2",
        type: "string",
        minLength: 1,
        maxLength: 10,
        letters: true,
      },
    ],
    examples: [
      { text1: "abcde", text2: "ace" },
      { text1: "abc", text2: "abc" },
      { text1: "abc", text2: "def" },
    ],
    complexity: { time: "O(m · n)", space: "O(m · n)" },
    idea: "dp[i][j] = LCS of the first i letters of text1 and the first j of text2. Equal last letters extend the diagonal; otherwise take the better of dropping a letter from either string.",
    code: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}`,
  },
  "edit-distance": {
    id: "edit-distance",
    title: "Edit Distance",
    leetcode: 72,
    difficulty: "medium",
    pattern: "dynamic-programming",
    view: "table",
    statement:
      "Given two strings word1 and word2, return the minimum number of operations (insert, delete or replace a character) needed to turn word1 into word2.",
    fields: [
      {
        name: "word1",
        type: "string",
        minLength: 0,
        maxLength: 10,
        letters: true,
      },
      {
        name: "word2",
        type: "string",
        minLength: 0,
        maxLength: 10,
        letters: true,
      },
    ],
    examples: [
      { word1: "horse", word2: "ros" },
      { word1: "intention", word2: "execution" },
      { word1: "kitten", word2: "sitting" },
    ],
    complexity: { time: "O(m · n)", space: "O(m · n)" },
    idea: "dp[i][j] = edits to turn the first i letters of word1 into the first j of word2. Equal letters are free (diagonal); otherwise pay 1 for the cheapest of delete, insert or replace.",
    code: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}`,
  },
};
