import { describe, expect, it } from "vitest";
import { ALGORITHMS } from "@shared/algorithms";
import { ALGORITHM_KINDS, ALGORITHM_RUNNERS, runAlgorithm } from "./index.js";

const DP_IDS = Object.keys(ALGORITHM_RUNNERS).filter(
  (id) => ALGORITHM_RUNNERS[id].kind === ALGORITHM_KINDS.DP,
);
const run = (id, n = 10) => runAlgorithm(id, { n });

describe.each(DP_IDS)("%s", (id) => {
  it("produces valid steps", () => {
    const steps = run(id);
    const lines = ALGORITHMS[id].pseudoCode.split("\n").length;
    expect(steps.length).toBeGreaterThan(1);
    let previous = null;
    for (const step of steps) {
      expect(step.explanation.length).toBeGreaterThan(0);
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(lines);
      expect(step.table.length).toBe(step.headers.rows.length);
      expect(step.table[0].length).toBe(step.headers.cols.length);
      if (previous) {
        for (const key of Object.keys(step.operations))
          expect(step.operations[key]).toBeGreaterThanOrEqual(
            previous.operations[key],
          );
      }
      previous = step;
    }
    // The table is complete at the end
    expect(steps.at(-1).table.flat()).not.toContain(null);
  });
});

describe("fibonacci", () => {
  it.each([
    [2, 1],
    [10, 55],
    [20, 6765],
  ])("fib(%i) = %i", (n, expected) => {
    const last = run("fibonacci", n).at(-1);
    expect(last.table[0][n]).toBe(expected);
    expect(last.operations.writes).toBe(n + 1);
  });

  it("counts the calls plain recursion would make", () => {
    expect(run("fibonacci", 10).at(-1).explanation).toMatch(/177 calls/);
  });
});
