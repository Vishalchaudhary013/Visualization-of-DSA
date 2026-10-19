// Array / string problems. Each step is read by ArrayProblemView:
// {
//   array:    the input values (numbers or characters)
//   pointers: { name: index } labels drawn under cells (i, L, R, mid…)
//   window:   [from, to] highlighted range, or null
//   active:   indices being looked at right now
//   found:    indices that form the answer
//   dim:      indices ruled out (greyed)
//   rows:     extra rows under the array: [{ label, values }]
//   map:      { title, entries: [[key, value]], active } hash map / set contents
//   vars:     { name: value } variables of the solution code
//   line:     0-based line of the solution code (shared/problems.js)
//   explanation, output (final answer, on the last step)
// }

function createArrayRecorder(array) {
  const steps = [];
  const record = ({
    pointers = {},
    window = null,
    active = [],
    found = [],
    dim = [],
    rows = [],
    map = null,
    vars = {},
    line,
    explanation,
    output,
  }) => {
    steps.push({
      array,
      pointers,
      window,
      active,
      found,
      dim,
      rows: rows.map((row) => ({ ...row, values: [...row.values] })),
      map: map && { ...map, entries: map.entries.map((entry) => [...entry]) },
      vars: { ...vars },
      line,
      explanation,
      output,
    });
  };
  return { steps, record };
}

const show = (value) => JSON.stringify(value);

export function twoSum({ nums, target }) {
  const { steps, record } = createArrayRecorder(nums);
  const seen = new Map();
  const mapView = (active) => ({
    title: "seen (value → index)",
    entries: [...seen],
    active,
  });

  record({
    map: mapView(),
    line: 1,
    explanation: `Look for two numbers that add up to ${target}. Start with an empty map of numbers seen so far.`,
  });
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    const vars = { i, "nums[i]": nums[i], need };
    if (seen.has(need)) {
      const j = seen.get(need);
      record({
        pointers: { i },
        found: [j, i],
        map: mapView(need),
        vars,
        line: 5,
        explanation: `${nums[i]} needs ${target} − ${nums[i]} = ${need}, and ${need} was seen at index ${j}: ${nums[j]} + ${nums[i]} = ${target}.`,
        output: show([j, i]),
      });
      return steps;
    }
    record({
      pointers: { i },
      active: [i],
      map: mapView(need),
      vars,
      line: 4,
      explanation: `${nums[i]} needs ${target} − ${nums[i]} = ${need}. ${need} is not in the map yet.`,
    });
    seen.set(nums[i], i);
    record({
      pointers: { i },
      active: [i],
      map: mapView(nums[i]),
      vars,
      line: 7,
      explanation: `Remember ${nums[i]} at index ${i} so a later number can pair with it.`,
    });
  }
  record({
    map: mapView(),
    line: 9,
    explanation: `No two numbers add up to ${target}.`,
    output: "[]",
  });
  return steps;
}

export function maxArea({ height }) {
  const { steps, record } = createArrayRecorder(height);
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  let bestPair = [left, right];

  record({
    pointers: { L: left, R: right },
    window: [left, right],
    vars: { left, right, best },
    line: 1,
    explanation: "Start with the widest container: one pointer at each end.",
  });
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    if (area > best) {
      best = area;
      bestPair = [left, right];
    }
    record({
      pointers: { L: left, R: right },
      window: [left, right],
      active: [left, right],
      vars: { left, right, area, best },
      line: 3,
      explanation: `min(${height[left]}, ${height[right]}) × (${right} − ${left}) = ${area} water. Best so far: ${best}.`,
    });
    const moveLeft = height[left] < height[right];
    record({
      pointers: { L: left, R: right },
      window: [left, right],
      active: [moveLeft ? left : right],
      vars: { left, right, area, best },
      line: moveLeft ? 5 : 6,
      explanation: moveLeft
        ? `The left line (${height[left]}) is shorter, so it limits the water: move left inward.`
        : `The right line (${height[right]}) is not taller than the left (${height[left]}): move right inward.`,
    });
    if (moveLeft) left++;
    else right--;
  }
  record({
    found: bestPair,
    window: bestPair,
    vars: { best },
    line: 8,
    explanation: `The pointers met. The best container uses lines ${bestPair[0]} and ${bestPair[1]} and holds ${best}.`,
    output: String(best),
  });
  return steps;
}

export function lengthOfLongestSubstring({ s }) {
  const chars = [...s];
  const { steps, record } = createArrayRecorder(chars);
  const window = new Set();
  let left = 0;
  let best = 0;
  let bestRange = null;
  const mapView = (active) => ({
    title: "window (set of characters)",
    entries: [...window].map((char) => [char]),
    active,
  });
  const range = (right) => (right >= left ? [left, right] : null);

  record({
    map: mapView(),
    vars: { left, best },
    line: 1,
    explanation: chars.length
      ? "Start with an empty window. The right end will move over every character."
      : "The string is empty, so the answer is 0.",
  });
  for (let right = 0; right < chars.length; right++) {
    const char = chars[right];
    if (window.has(char)) {
      record({
        pointers: { L: left, R: right },
        window: range(right - 1),
        active: [right],
        map: mapView(char),
        vars: { left, right, best },
        line: 4,
        explanation: `'${char}' is already in the window: shrink it from the left until it is gone.`,
      });
    }
    while (window.has(char)) {
      const removed = chars[left];
      window.delete(removed);
      left++;
      record({
        pointers: { L: left, R: right },
        window: range(right - 1),
        active: [left - 1],
        map: mapView(),
        vars: { left, right, best },
        line: 6,
        explanation: `Remove '${removed}' and move left to ${left}.`,
      });
    }
    window.add(char);
    const length = right - left + 1;
    if (length > best) {
      best = length;
      bestRange = [left, right];
    }
    record({
      pointers: { L: left, R: right },
      window: [left, right],
      active: [right],
      map: mapView(char),
      vars: { left, right, best },
      line: 9,
      explanation: `Add '${char}'. The window "${chars.slice(left, right + 1).join("")}" has length ${length}; best is ${best}.`,
    });
  }
  record({
    window: bestRange,
    found: bestRange
      ? Array.from({ length: best }, (_, k) => bestRange[0] + k)
      : [],
    map: mapView(),
    vars: { best },
    line: 11,
    explanation: bestRange
      ? `The longest substring without repeats is "${chars.slice(bestRange[0], bestRange[1] + 1).join("")}" (length ${best}).`
      : "The answer is 0.",
    output: String(best),
  });
  return steps;
}

export function subarraySum({ nums, k }) {
  const { steps, record } = createArrayRecorder(nums);
  const count = new Map([[0, 1]]);
  const prefixes = nums.map(() => null);
  // Where each prefix sum ended (-1 = before the array), to draw a matching subarray
  const endsAt = new Map([[0, [-1]]]);
  let prefix = 0;
  let total = 0;
  const mapView = (active) => ({
    title: "count (prefix sum → times seen)",
    entries: [...count],
    active,
  });
  const rows = () => [{ label: "prefix", values: prefixes }];

  record({
    rows: rows(),
    map: mapView(0),
    vars: { prefix, total },
    line: 1,
    explanation: `Count subarrays that sum to ${k}. The empty prefix (sum 0) has been seen once.`,
  });
  for (let i = 0; i < nums.length; i++) {
    prefix += nums[i];
    prefixes[i] = prefix;
    const want = prefix - k;
    const matches = count.get(want) ?? 0;
    total += matches;
    const start = matches ? endsAt.get(want).at(-1) + 1 : null;
    record({
      pointers: { i },
      active: [i],
      window: matches ? [start, i] : null,
      found: matches
        ? Array.from({ length: i - start + 1 }, (_, d) => start + d)
        : [],
      rows: rows(),
      map: mapView(want),
      vars: { i, prefix, "prefix - k": want, total },
      line: 5,
      explanation: matches
        ? `prefix = ${prefix}. ${prefix} − ${k} = ${want} was seen ${matches}×, so ${matches} subarray${matches === 1 ? "" : "s"} ending here sum${matches === 1 ? "s" : ""} to ${k} (e.g. index ${start}..${i}). total = ${total}.`
        : `prefix = ${prefix}. ${prefix} − ${k} = ${want} was never seen: no subarray ending here sums to ${k}.`,
    });
    count.set(prefix, (count.get(prefix) ?? 0) + 1);
    endsAt.set(prefix, [...(endsAt.get(prefix) ?? []), i]);
    record({
      pointers: { i },
      active: [i],
      rows: rows(),
      map: mapView(prefix),
      vars: { i, prefix, total },
      line: 6,
      explanation: `Record prefix sum ${prefix} (seen ${count.get(prefix)}× now).`,
    });
  }
  record({
    rows: rows(),
    map: mapView(),
    vars: { total },
    line: 8,
    explanation: `${total} subarray${total === 1 ? "" : "s"} sum to ${k}.`,
    output: String(total),
  });
  return steps;
}

export function binarySearch({ nums, target }) {
  const { steps, record } = createArrayRecorder(nums);
  let left = 0;
  let right = nums.length - 1;
  const outside = () =>
    nums.flatMap((_, index) => (index < left || index > right ? [index] : []));

  record({
    pointers: { L: left, R: right },
    window: [left, right],
    vars: { left, right },
    line: 1,
    explanation: `Search for ${target}. The whole array is still possible.`,
  });
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const pointers = { L: left, mid, R: right };
    if (nums[mid] === target) {
      record({
        pointers,
        found: [mid],
        dim: outside(),
        vars: { left, right, mid },
        line: 4,
        explanation: `nums[${mid}] = ${nums[mid]} is the target. Return ${mid}.`,
        output: String(mid),
      });
      return steps;
    }
    record({
      pointers,
      window: [left, right],
      active: [mid],
      dim: outside(),
      vars: { left, right, mid },
      line: 3,
      explanation: `mid = ⌊(${left} + ${right}) / 2⌋ = ${mid}. nums[${mid}] = ${nums[mid]} ${nums[mid] < target ? "<" : ">"} ${target}.`,
    });
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
    record({
      pointers: { L: left, R: right },
      window: left <= right ? [left, right] : null,
      dim: outside(),
      vars: { left, right, mid },
      line: nums[mid] < target ? 5 : 6,
      explanation:
        nums[mid] < target
          ? `${target} can only be to the right: left = ${left}.`
          : `${target} can only be to the left: right = ${right}.`,
    });
  }
  record({
    dim: nums.map((_, index) => index),
    vars: { left, right },
    line: 8,
    explanation: `left passed right: ${target} is not in the array. Return -1.`,
    output: "-1",
  });
  return steps;
}
