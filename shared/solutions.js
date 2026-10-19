// Solutions of the problems in shared/problems.js in more languages, written
// the way LeetCode expects them (a Solution class). The JavaScript solution
// lives in problems.js; step generators point at its lines. For every other
// language, lines[i] is the line that matches line i of the JavaScript code,
// so the highlight follows the animation whichever language is shown.

export const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
];

export const SOLUTIONS = {
  "two-sum": {
    python: {
      code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  # value -> index
        for i, num in enumerate(nums):
            need = target - num
            if need in seen:
                return [seen[need], i]
            seen[num] = i
        return []  # no pair adds up to target`,
      lines: [1, 2, 3, 4, 5, 6, 6, 7, 7, 8, 8],
    },
    java: {
      code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // value -> index
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[] { seen.get(need), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0]; // no pair adds up to target
    }
}`,
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
    cpp: {
      code: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen; // value -> index
        for (int i = 0; i < nums.size(); i++) {
            int need = target - nums[i];
            if (seen.count(need)) {
                return {seen[need], i};
            }
            seen[nums[i]] = i;
        }
        return {}; // no pair adds up to target
    }
};`,
      lines: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
  },
  "container-with-most-water": {
    python: {
      code: `class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right, best = 0, len(height) - 1, 0
        while left < right:
            area = min(height[left], height[right]) * (right - left)
            best = max(best, area)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return best`,
      lines: [1, 2, 3, 4, 5, 7, 9, 9, 10, 10],
    },
    java: {
      code: `class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1, best = 0;
        while (left < right) {
            int area = Math.min(height[left], height[right]) * (right - left);
            best = Math.max(best, area);
            if (height[left] < height[right]) left++;
            else right--;
        }
        return best;
    }
}`,
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    cpp: {
      code: `class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1, best = 0;
        while (left < right) {
            int area = min(height[left], height[right]) * (right - left);
            best = max(best, area);
            if (height[left] < height[right]) left++;
            else right--;
        }
        return best;
    }
};`,
      lines: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
  },
  "longest-substring-without-repeating-characters": {
    python: {
      code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        window = set()
        left = best = 0
        for right in range(len(s)):
            while s[right] in window:
                window.remove(s[left])
                left += 1
            window.add(s[right])
            best = max(best, right - left + 1)
        return best`,
      lines: [1, 2, 3, 4, 5, 6, 7, 7, 8, 9, 9, 10, 10],
    },
    java: {
      code: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            while (window.contains(s.charAt(right))) {
                window.remove(s.charAt(left));
                left++;
            }
            window.add(s.charAt(right));
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
    cpp: {
      code: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> window;
        int left = 0, best = 0;
        for (int right = 0; right < s.size(); right++) {
            while (window.count(s[right])) {
                window.erase(s[left]);
                left++;
            }
            window.insert(s[right]);
            best = max(best, right - left + 1);
        }
        return best;
    }
};`,
      lines: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
  },
  "subarray-sum-equals-k": {
    python: {
      code: `class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = {0: 1}  # prefix sum -> times seen
        prefix = total = 0
        for num in nums:
            prefix += num
            total += count.get(prefix - k, 0)
            count[prefix] = count.get(prefix, 0) + 1
        return total`,
      lines: [1, 2, 3, 4, 5, 6, 7, 7, 8, 8],
    },
    java: {
      code: `class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>(); // prefix sum -> times seen
        count.put(0, 1);
        int prefix = 0, total = 0;
        for (int num : nums) {
            prefix += num;
            total += count.getOrDefault(prefix - k, 0);
            count.merge(prefix, 1, Integer::sum);
        }
        return total;
    }
}`,
      lines: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
    },
    cpp: {
      code: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> count{{0, 1}}; // prefix sum -> times seen
        int prefix = 0, total = 0;
        for (int num : nums) {
            prefix += num;
            total += count.count(prefix - k) ? count[prefix - k] : 0;
            count[prefix]++;
        }
        return total;
    }
};`,
      lines: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
  },
  "binary-search": {
    python: {
      code: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1`,
      lines: [1, 2, 3, 4, 6, 8, 10, 10, 11, 11],
    },
    java: {
      code: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    cpp: {
      code: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`,
      lines: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
  },
  "network-delay-time": {
    python: {
      code: `class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = [[] for _ in range(n + 1)]
        for u, v, w in times:
            graph[u].append((v, w))
        dist = [math.inf] * (n + 1)
        dist[k] = 0
        heap = [(0, k)]  # (time, node)
        while heap:
            time, node = heapq.heappop(heap)
            if time > dist[node]:
                continue  # outdated entry
            for nxt, w in graph[node]:
                if time + w < dist[nxt]:
                    dist[nxt] = time + w
                    heapq.heappush(heap, (dist[nxt], nxt))
        slowest = max(dist[1:])
        return -1 if slowest == math.inf else slowest`,
      lines: [
        1, 2, 3, 5, 6, 7, 8, 9, 9, 10, 12, 13, 14, 15, 15, 15, 15, 16, 17, 17,
      ],
    },
    java: {
      code: `class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        for (int[] t : times) graph.get(t[0]).add(new int[] { t[1], t[2] });
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]); // [time, node]
        heap.add(new int[] { 0, k });
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int time = top[0], node = top[1];
            if (time > dist[node]) continue; // outdated entry
            for (int[] edge : graph.get(node)) {
                int next = edge[0], w = edge[1];
                if (time + w < dist[next]) {
                    dist[next] = time + w;
                    heap.add(new int[] { dist[next], next });
                }
            }
        }
        int slowest = 0;
        for (int i = 1; i <= n; i++) slowest = Math.max(slowest, dist[i]);
        return slowest == Integer.MAX_VALUE ? -1 : slowest;
    }
}`,
      lines: [
        1, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 24,
        25,
      ],
    },
    cpp: {
      code: `class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> graph(n + 1);
        for (auto& t : times) graph[t[0]].push_back({t[1], t[2]});
        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap; // {time, node}
        heap.push({0, k});
        while (!heap.empty()) {
            auto [time, node] = heap.top();
            heap.pop();
            if (time > dist[node]) continue; // outdated entry
            for (auto [next, w] : graph[node]) {
                if (time + w < dist[next]) {
                    dist[next] = time + w;
                    heap.push({dist[next], next});
                }
            }
        }
        int slowest = *max_element(dist.begin() + 1, dist.end());
        return slowest == INT_MAX ? -1 : slowest;
    }
};`,
      lines: [
        2, 3, 4, 5, 6, 8, 9, 10, 10, 12, 13, 14, 15, 16, 17, 18, 18, 20, 21, 22,
      ],
    },
  },
  "course-schedule-ii": {
    python: {
      code: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        nxt = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses
        for course, pre in prerequisites:
            nxt[pre].append(course)
            indegree[course] += 1
        queue = deque(c for c in range(numCourses) if indegree[c] == 0)
        order = []
        while queue:
            course = queue.popleft()
            order.append(course)
            for after in nxt[course]:
                indegree[after] -= 1
                if indegree[after] == 0:
                    queue.append(after)
        return order if len(order) == numCourses else []`,
      lines: [1, 2, 3, 4, 5, 6, 6, 7, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 16],
    },
    java: {
      code: `class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> next = new ArrayList<>();
        for (int c = 0; c < numCourses; c++) next.add(new ArrayList<>());
        int[] indegree = new int[numCourses];
        for (int[] p : prerequisites) {
            next.get(p[1]).add(p[0]);
            indegree[p[0]]++;
        }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int c = 0; c < numCourses; c++) if (indegree[c] == 0) queue.add(c);
        int[] order = new int[numCourses];
        int taken = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            order[taken++] = course;
            for (int after : next.get(course)) {
                if (--indegree[after] == 0) queue.add(after);
            }
        }
        return taken == numCourses ? order : new int[0];
    }
}`,
      lines: [
        1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      ],
    },
    cpp: {
      code: `class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> next(numCourses);
        vector<int> indegree(numCourses, 0);
        for (auto& p : prerequisites) {
            next[p[1]].push_back(p[0]);
            indegree[p[0]]++;
        }
        queue<int> q;
        for (int c = 0; c < numCourses; c++) if (indegree[c] == 0) q.push(c);
        vector<int> order;
        while (!q.empty()) {
            int course = q.front();
            q.pop();
            order.push_back(course);
            for (int after : next[course]) {
                if (--indegree[after] == 0) q.push(after);
            }
        }
        return order.size() == numCourses ? order : vector<int>{};
    }
};`,
      lines: [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21,
      ],
    },
  },
  knapsack: {
    python: {
      code: `class Solution:
    def knapsack(self, weights: List[int], values: List[int], capacity: int) -> int:
        n = len(weights)
        dp = [[0] * (capacity + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for w in range(capacity + 1):
                dp[i][w] = dp[i - 1][w]  # skip item i
                if weights[i - 1] <= w:
                    take = dp[i - 1][w - weights[i - 1]] + values[i - 1]
                    dp[i][w] = max(dp[i][w], take)
        return dp[n][capacity]`,
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9, 10, 10],
    },
    java: {
      code: `class Solution {
    public int knapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w]; // skip item i
                if (weights[i - 1] <= w) {
                    int take = dp[i - 1][w - weights[i - 1]] + values[i - 1];
                    dp[i][w] = Math.max(dp[i][w], take);
                }
            }
        }
        return dp[n][capacity];
    }
}`,
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
    cpp: {
      code: `class Solution {
public:
    int knapsack(vector<int>& weights, vector<int>& values, int capacity) {
        int n = weights.size();
        vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w]; // skip item i
                if (weights[i - 1] <= w) {
                    int take = dp[i - 1][w - weights[i - 1]] + values[i - 1];
                    dp[i][w] = max(dp[i][w], take);
                }
            }
        }
        return dp[n][capacity];
    }
};`,
      lines: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
  },
  "longest-common-subsequence": {
    python: {
      code: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]`,
      lines: [1, 2, 3, 4, 5, 7, 9, 9, 9, 10, 10],
    },
    java: {
      code: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        return dp[m][n];
    }
}`,
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
    cpp: {
      code: `class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.size(), n = text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1[i - 1] == text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
                else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        return dp[m][n];
    }
};`,
      lines: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
  },
  "edit-distance": {
    python: {
      code: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[i if j == 0 else j if i == 0 else 0 for j in range(n + 1)]
              for i in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        return dp[m][n]`,
      lines: [1, 2, 3, 4, 5, 6, 8, 10, 10, 10, 11, 11],
    },
    java: {
      code: `class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
            }
        }
        return dp[m][n];
    }
}`,
      lines: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
    cpp: {
      code: `class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
        return dp[m][n];
    }
};`,
      lines: [2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
  },
};

/** The code to show for a problem in a language, and where a JavaScript line lands in it. */
export function solutionIn(problem, language) {
  const solution = SOLUTIONS[problem.id]?.[language];
  if (!solution) return { code: problem.code, lineOf: (line) => line };
  return {
    code: solution.code,
    lineOf: (line) => (line == null ? line : solution.lines[line]),
  };
}
