// Connects a problem id (shared/problems.js) to its step generator and to the
// extra input rules LeetCode states in the problem's constraints.
import {
  binarySearch,
  lengthOfLongestSubstring,
  maxArea,
  subarraySum,
  twoSum,
} from "./arrays.js";
import { findOrder, networkDelayTime } from "./graphs.js";
import { knapsack, longestCommonSubsequence, minDistance } from "./dp.js";

const duplicatePair = (pairs) => {
  const seen = new Set();
  for (const [a, b] of pairs) {
    const key = `${a}-${b}`;
    if (seen.has(key)) return [a, b];
    seen.add(key);
  }
  return null;
};

export const PROBLEM_SOLVERS = {
  "two-sum": { solve: twoSum },
  "container-with-most-water": { solve: maxArea },
  "longest-substring-without-repeating-characters": {
    solve: lengthOfLongestSubstring,
  },
  "subarray-sum-equals-k": { solve: subarraySum },
  "binary-search": {
    solve: binarySearch,
    check: ({ nums }) =>
      nums.some((value, i) => i > 0 && value <= nums[i - 1])
        ? "nums must be sorted in ascending order with no duplicates."
        : null,
  },
  "network-delay-time": {
    solve: networkDelayTime,
    check: ({ times, n, k }) => {
      if (k > n) return `k must be a node from 1 to n (${n}).`;
      const bad = times.find(([u, v]) => u < 1 || v < 1 || u > n || v > n);
      if (bad) return `[${bad}] uses a node outside 1..${n}.`;
      const loop = times.find(([u, v]) => u === v);
      if (loop) return `[${loop}] goes from a node to itself.`;
      const repeated = duplicatePair(times);
      return repeated
        ? `There are two edges ${repeated[0]} → ${repeated[1]}.`
        : null;
    },
  },
  "course-schedule-ii": {
    solve: findOrder,
    check: ({ numCourses, prerequisites }) => {
      const bad = prerequisites.find(
        ([a, b]) => a >= numCourses || b >= numCourses,
      );
      if (bad) return `[${bad}] uses a course outside 0..${numCourses - 1}.`;
      const loop = prerequisites.find(([a, b]) => a === b);
      if (loop) return `[${loop}] makes a course its own prerequisite.`;
      return duplicatePair(prerequisites)
        ? "Each prerequisite pair may appear only once."
        : null;
    },
  },
  knapsack: {
    solve: knapsack,
    check: ({ weights, values }) =>
      weights.length === values.length
        ? null
        : `weights has ${weights.length} items but values has ${values.length}.`,
  },
  "longest-common-subsequence": { solve: longestCommonSubsequence },
  "edit-distance": { solve: minDistance },
};
