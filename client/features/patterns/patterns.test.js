import { describe, expect, it } from "vitest";
import { PATTERNS, PATTERN_GROUPS, PATTERN_LIST } from "@shared/patterns";
import { PROBLEMS } from "@shared/problems";
import { ALGORITHMS } from "@shared/algorithms";
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { ALGORITHM_RUNNERS } from "@/features/visualizer/algorithms";

describe("patterns", () => {
  it("has unique ids and every group is used", () => {
    expect(Object.keys(PATTERNS)).toHaveLength(PATTERN_LIST.length);
    for (const group of PATTERN_GROUPS) {
      expect(PATTERN_LIST.some((pattern) => pattern.group === group.id)).toBe(
        true,
      );
    }
  });

  it.each(PATTERN_LIST.map((pattern) => [pattern.id, pattern]))(
    "%s is complete and links to things that exist",
    (_, pattern) => {
      expect(PATTERN_GROUPS.some((group) => group.id === pattern.group)).toBe(
        true,
      );
      expect(pattern.summary.length).toBeGreaterThan(20);
      expect(pattern.signals.length).toBeGreaterThan(0);
      expect(pattern.template.length).toBeGreaterThan(0);
      expect(pattern.practice.length).toBeGreaterThan(0);
      for (const id of pattern.problems) expect(PROBLEMS[id]).toBeDefined();
      for (const { to } of pattern.visualizers) {
        const algo = /^\/visualizer\?algo=([a-z-]+)$/.exec(to)?.[1];
        const structure = /^\/data-structures\/([a-z-]+)$/.exec(to)?.[1];
        if (algo)
          expect(ALGORITHMS[algo] && ALGORITHM_RUNNERS[algo]).toBeTruthy();
        else expect(DATA_STRUCTURES[structure]).toBeDefined();
      }
    },
  );

  it("every problem belongs to a pattern that lists it", () => {
    for (const problem of Object.values(PROBLEMS)) {
      expect(PATTERNS[problem.pattern].problems).toContain(problem.id);
    }
  });
});
