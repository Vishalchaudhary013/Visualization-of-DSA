// Dynamic programming problems, drawn by DpTableVisualizer. Each step has:
// {
//   table, headers { rows, cols, rowTitle?, colTitle? }, current [row, col],
//   reads (cells the value comes from), path (cells of the walk back),
//   vars, line, explanation, output
// }

function createTableRecorder(rows, cols, headers) {
  const table = Array.from({ length: rows }, () => Array(cols).fill(null));
  const steps = [];
  const path = [];
  const record = ({
    current = null,
    reads = [],
    vars = {},
    line,
    explanation,
    output,
  }) => {
    steps.push({
      table: table.map((row) => [...row]),
      headers,
      current,
      reads,
      path: [...path],
      vars: { ...vars },
      line,
      explanation,
      output,
    });
  };
  return { table, steps, path, record };
}

const range = (count) => Array.from({ length: count }, (_, index) => index);

export function knapsack({ weights, values, capacity }) {
  const n = weights.length;
  const headers = {
    rows: ["none", ...weights.map((w, i) => `#${i + 1} w${w} v${values[i]}`)],
    cols: range(capacity + 1),
    rowTitle: "items",
    colTitle: "capacity",
  };
  const {
    table: dp,
    steps,
    path,
    record,
  } = createTableRecorder(n + 1, capacity + 1, headers);

  dp[0].fill(0);
  record({
    line: 2,
    explanation: "With no items (row “none”), every capacity holds value 0.",
  });
  for (let i = 1; i <= n; i++) {
    const [weight, value] = [weights[i - 1], values[i - 1]];
    for (let w = 0; w <= capacity; w++) {
      const skip = dp[i - 1][w];
      const vars = { i, w, "weights[i-1]": weight, "values[i-1]": value };
      if (weight > w) {
        dp[i][w] = skip;
        record({
          current: [i, w],
          reads: [[i - 1, w]],
          vars,
          line: 5,
          explanation: `Item ${i} (weight ${weight}) doesn't fit in capacity ${w}: keep ${skip} from the row above.`,
        });
        continue;
      }
      const take = dp[i - 1][w - weight] + value;
      dp[i][w] = Math.max(skip, take);
      record({
        current: [i, w],
        reads: [
          [i - 1, w],
          [i - 1, w - weight],
        ],
        vars: { ...vars, take },
        line: 8,
        explanation: `Capacity ${w}: skip item ${i} → ${skip}, or take it → ${dp[i - 1][w - weight]} + ${value} = ${take}. ${
          take > skip ? `Take it (${take})` : `Skip it (${skip})`
        }.`,
      });
    }
  }

  // Walk back to show which items make up the answer
  const taken = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    path.push([i, w]);
    const changed = dp[i][w] !== dp[i - 1][w];
    record({
      current: [i, w],
      reads: [[i - 1, w]],
      line: 12,
      explanation: changed
        ? `${dp[i][w]} differs from the row above (${dp[i - 1][w]}), so item ${i} is in the bag. Capacity left: ${w} − ${weights[i - 1]} = ${w - weights[i - 1]}.`
        : `${dp[i][w]} equals the row above, so item ${i} is not taken.`,
    });
    if (changed) {
      taken.unshift(i);
      w -= weights[i - 1];
    }
  }
  path.push([0, w]);
  const best = dp[n][capacity];
  record({
    line: 12,
    explanation: taken.length
      ? `Best value ${best} with items ${taken.map((i) => `#${i}`).join(", ")} (weight ${taken.reduce((sum, i) => sum + weights[i - 1], 0)} of ${capacity}).`
      : `No item fits in capacity ${capacity}, so the best value is 0.`,
    output: String(best),
  });
  return steps;
}

const stringHeaders = (a, b) => ({
  rows: ["“”", ...a],
  cols: ["“”", ...b],
});

export function longestCommonSubsequence({ text1, text2 }) {
  const [m, n] = [text1.length, text2.length];
  const {
    table: dp,
    steps,
    path,
    record,
  } = createTableRecorder(m + 1, n + 1, stringHeaders(text1, text2));

  dp[0].fill(0);
  for (const row of dp) row[0] = 0;
  record({
    line: 2,
    explanation:
      "An empty prefix has nothing in common with anything: the first row and column are 0.",
  });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const [a, b] = [text1[i - 1], text2[j - 1]];
      const vars = { i, j, "text1[i-1]": a, "text2[j-1]": b };
      if (a === b) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        record({
          current: [i, j],
          reads: [[i - 1, j - 1]],
          vars,
          line: 5,
          explanation: `'${a}' = '${b}': extend the diagonal, ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}.`,
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        record({
          current: [i, j],
          reads: [
            [i - 1, j],
            [i, j - 1],
          ],
          vars,
          line: 6,
          explanation: `'${a}' ≠ '${b}': the larger of above (${dp[i - 1][j]}) and left (${dp[i][j - 1]}) = ${dp[i][j]}.`,
        });
      }
    }
  }

  let common = "";
  let [i, j] = [m, n];
  while (i > 0 && j > 0) {
    path.push([i, j]);
    if (text1[i - 1] === text2[j - 1]) {
      common = text1[i - 1] + common;
      record({
        current: [i, j],
        reads: [[i - 1, j - 1]],
        line: 9,
        explanation: `'${text1[i - 1]}' is in both strings: it belongs to the subsequence. Go diagonally.`,
      });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      record({
        current: [i, j],
        reads: [[i - 1, j]],
        line: 9,
        explanation: `The value came from above (${dp[i - 1][j]}): go up.`,
      });
      i--;
    } else {
      record({
        current: [i, j],
        reads: [[i, j - 1]],
        line: 9,
        explanation: `The value came from the left (${dp[i][j - 1]}): go left.`,
      });
      j--;
    }
  }
  path.push([i, j]);
  record({
    line: 9,
    explanation: common
      ? `A longest common subsequence is "${common}" (length ${common.length}).`
      : "The strings share no letter: the answer is 0.",
    output: String(dp[m][n]),
  });
  return steps;
}

export function minDistance({ word1, word2 }) {
  const [m, n] = [word1.length, word2.length];
  const {
    table: dp,
    steps,
    path,
    record,
  } = createTableRecorder(m + 1, n + 1, stringHeaders(word1, word2));

  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  record({
    line: 2,
    explanation:
      "Turning a prefix into an empty string takes one delete per letter (first column); building a prefix from nothing takes one insert per letter (first row).",
  });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const [a, b] = [word1[i - 1], word2[j - 1]];
      const vars = { i, j, "word1[i-1]": a, "word2[j-1]": b };
      if (a === b) {
        dp[i][j] = dp[i - 1][j - 1];
        record({
          current: [i, j],
          reads: [[i - 1, j - 1]],
          vars,
          line: 6,
          explanation: `'${a}' = '${b}': keep it for free, copy the diagonal ${dp[i][j]}.`,
        });
      } else {
        const [remove, insert, replace] = [
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1],
        ];
        dp[i][j] = 1 + Math.min(remove, insert, replace);
        record({
          current: [i, j],
          reads: [
            [i - 1, j],
            [i, j - 1],
            [i - 1, j - 1],
          ],
          vars,
          line: 7,
          explanation: `'${a}' ≠ '${b}': 1 + min(delete ${remove}, insert ${insert}, replace ${replace}) = ${dp[i][j]}.`,
        });
      }
    }
  }

  const edits = [];
  let [i, j] = [m, n];
  while (i > 0 || j > 0) {
    path.push([i, j]);
    let move;
    if (i > 0 && j > 0 && word1[i - 1] === word2[j - 1]) {
      move = { di: 1, dj: 1, text: `keep '${word1[i - 1]}'` };
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      move = {
        di: 1,
        dj: 1,
        text: `replace '${word1[i - 1]}' with '${word2[j - 1]}'`,
      };
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      move = { di: 1, dj: 0, text: `delete '${word1[i - 1]}'` };
    } else {
      move = { di: 0, dj: 1, text: `insert '${word2[j - 1]}'` };
    }
    if (!move.text.startsWith("keep")) edits.unshift(move.text);
    record({
      current: [i, j],
      reads: [[i - move.di, j - move.dj]],
      line: 10,
      explanation: `${move.text[0].toUpperCase()}${move.text.slice(1)}.`,
    });
    i -= move.di;
    j -= move.dj;
  }
  path.push([0, 0]);
  record({
    line: 10,
    explanation: edits.length
      ? `${edits.length} ${edits.length === 1 ? "edit" : "edits"}: ${edits.join(", ")}.`
      : "The strings are already equal: 0 edits.",
    output: String(dp[m][n]),
  });
  return steps;
}
