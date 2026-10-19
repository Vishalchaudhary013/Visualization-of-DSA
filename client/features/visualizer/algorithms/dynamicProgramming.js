// Dynamic programming: fill a table of sub-answers from the smallest case up.
// Each step is:
// {
//   table:   2-D array of cell values (null = not computed yet)
//   headers: { rows, cols, colTitle } labels around the table
//   current: [row, col] of the cell being written (null when none)
//   reads:   cells the current value is computed from
//   path:    cells that hold the final answer
//   line, explanation, operations (reads = table cells read,
//     writes = cells filled)
// }
// `state`, `comparisons`, `swaps` and `sorted` are kept empty for the shared panels.

function createTableRecorder(rows, cols, headers) {
  const table = Array.from({ length: rows }, () => Array(cols).fill(null));
  const ops = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };
  const steps = [];
  const path = [];

  const record = ({ current = null, reads = [], line, explanation }) => {
    ops.reads += reads.length;
    steps.push({
      state: [],
      comparisons: [],
      swaps: [],
      sorted: [],
      table: table.map((row) => [...row]),
      headers,
      current,
      reads,
      path: [...path],
      line,
      explanation,
      operations: { ...ops },
    });
  };
  return { table, ops, steps, path, record };
}

const range = (count) => Array.from({ length: count }, (_, index) => index);

export function fibonacci(n) {
  const headers = { rows: ["fib"], cols: range(n + 1), colTitle: "i" };
  const { table, ops, steps, path, record } = createTableRecorder(
    1,
    n + 1,
    headers,
  );
  const dp = table[0];

  dp[0] = 0;
  dp[1] = 1;
  ops.writes += 2;
  record({
    line: 1,
    explanation: "Base cases: fib(0) = 0 and fib(1) = 1.",
  });
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    ops.writes++;
    record({
      current: [0, i],
      reads: [
        [0, i - 1],
        [0, i - 2],
      ],
      line: 3,
      explanation: `fib(${i}) = fib(${i - 1}) + fib(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
    });
  }
  path.push([0, n]);
  // Plain recursion calls itself 2·fib(n+1) − 1 times
  const recursiveCalls = 2 * (dp[n] + dp[n - 1]) - 1;
  record({
    current: [0, n],
    line: 4,
    explanation: `fib(${n}) = ${dp[n]}. Every value was computed once (${n - 1} additions); plain recursion would make ${recursiveCalls} calls.`,
  });
  return steps;
}
