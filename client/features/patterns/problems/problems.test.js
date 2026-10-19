import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@shared/problems";
import { PROBLEM_SOLVERS } from "./index.js";
import {
  buildProblemParams,
  parseField,
  parseProblemInput,
  readProblemInput,
  solveProblem,
} from "../utils/problemInput.js";

const IDS = Object.keys(PROBLEMS);

/** Runs the solution code exactly as it is shown on the page. */
function runShownCode(problem, input) {
  const name = /function (\w+)/.exec(problem.code)[1];
  const solution = new Function(`${problem.code}\nreturn ${name};`)();
  return solution(...problem.fields.map((field) => input[field.name]));
}

const randomInt = (min, max) =>
  min + Math.floor(Math.random() * (max - min + 1));
const randomLetters = (length, alphabet = "abcd") =>
  Array.from(
    { length },
    () => alphabet[randomInt(0, alphabet.length - 1)],
  ).join("");

// Random valid inputs per problem, on top of the examples
const RANDOM_INPUTS = {
  "two-sum": () => {
    const nums = Array.from({ length: randomInt(2, 12) }, () =>
      randomInt(-9, 9),
    );
    return { nums, target: nums[0] + nums.at(-1) };
  },
  "container-with-most-water": () => ({
    height: Array.from({ length: randomInt(2, 12) }, () => randomInt(0, 20)),
  }),
  "longest-substring-without-repeating-characters": () => ({
    s: randomLetters(randomInt(0, 16), "abcde "),
  }),
  "subarray-sum-equals-k": () => ({
    nums: Array.from({ length: randomInt(1, 12) }, () => randomInt(-5, 5)),
    k: randomInt(-5, 5),
  }),
  "binary-search": () => {
    const nums = [
      ...new Set(
        Array.from({ length: randomInt(1, 16) }, () => randomInt(-50, 50)),
      ),
    ].sort((a, b) => a - b);
    return { nums, target: Math.random() < 0.5 ? nums[0] : randomInt(-50, 50) };
  },
  "network-delay-time": () => {
    const n = randomInt(1, 8);
    const times = [];
    for (let u = 1; u <= n; u++)
      for (let v = 1; v <= n; v++)
        if (u !== v && Math.random() < 0.3 && times.length < 16)
          times.push([u, v, randomInt(0, 9)]);
    return { times, n, k: randomInt(1, n) };
  },
  "course-schedule-ii": () => {
    const numCourses = randomInt(1, 8);
    const prerequisites = [];
    for (let a = 0; a < numCourses; a++)
      for (let b = 0; b < numCourses; b++)
        if (a !== b && Math.random() < 0.15 && prerequisites.length < 16)
          prerequisites.push([a, b]);
    return { numCourses, prerequisites };
  },
  knapsack: () => {
    const n = randomInt(1, 6);
    return {
      weights: Array.from({ length: n }, () => randomInt(1, 10)),
      values: Array.from({ length: n }, () => randomInt(1, 30)),
      capacity: randomInt(1, 15),
    };
  },
  "longest-common-subsequence": () => ({
    text1: randomLetters(randomInt(1, 10)),
    text2: randomLetters(randomInt(1, 10)),
  }),
  "edit-distance": () => ({
    word1: randomLetters(randomInt(0, 10)),
    word2: randomLetters(randomInt(0, 10)),
  }),
};

function checkSteps(problem, steps) {
  const lines = problem.code.split("\n").length;
  expect(steps.length).toBeGreaterThan(1);
  for (const step of steps) {
    expect(step.explanation.length).toBeGreaterThan(0);
    expect(step.line).toBeGreaterThanOrEqual(0);
    expect(step.line).toBeLessThan(lines);
  }
  expect(steps.slice(0, -1).every((step) => step.output === undefined)).toBe(
    true,
  );
  return steps.at(-1).output;
}

describe.each(IDS)("%s", (id) => {
  const problem = PROBLEMS[id];

  it("has a solver, examples and valid field limits", () => {
    expect(PROBLEM_SOLVERS[id]).toBeDefined();
    expect(problem.examples.length).toBeGreaterThan(0);
    for (const example of problem.examples) {
      expect(parseProblemInput(id, buildTexts(problem, example))).toEqual({
        input: example,
      });
    }
  });

  it("matches the shown code on every example", () => {
    for (const example of problem.examples) {
      const output = checkSteps(problem, solveProblem(id, example));
      expect(output).toBe(JSON.stringify(runShownCode(problem, example)));
    }
  });

  it("matches the shown code on random inputs", () => {
    for (let run = 0; run < 40; run++) {
      const input = RANDOM_INPUTS[id]();
      if (parseProblemInput(id, buildTexts(problem, input)).errors) continue;
      const output = checkSteps(problem, solveProblem(id, input));
      expect(output).toBe(JSON.stringify(runShownCode(problem, input)));
    }
  });

  it("round-trips its input through the URL", () => {
    const input = problem.examples.at(-1);
    const params = buildProblemParams(id, input);
    expect(params.get("problem")).toBe(id);
    expect(readProblemInput(id, params)).toEqual(input);
  });
});

function buildTexts(problem, input) {
  return Object.fromEntries(
    problem.fields.map((field) => [
      field.name,
      JSON.stringify(input[field.name]),
    ]),
  );
}

describe("parseField", () => {
  const nums = PROBLEMS["two-sum"].fields[0];
  const target = PROBLEMS["two-sum"].fields[1];
  const s =
    PROBLEMS["longest-substring-without-repeating-characters"].fields[0];
  const times = PROBLEMS["network-delay-time"].fields[0];
  const word = PROBLEMS["edit-distance"].fields[0];

  it("accepts LeetCode's format, with or without the name", () => {
    expect(parseField(nums, "nums = [2,7,11,15]")).toEqual({
      value: [2, 7, 11, 15],
    });
    expect(parseField(target, " 9 ")).toEqual({ value: 9 });
    expect(parseField(s, '"a b"')).toEqual({ value: "a b" });
    expect(parseField(s, "abc")).toEqual({ value: "abc" });
    expect(parseField(s, '""')).toEqual({ value: "" });
    expect(parseField(times, "[[2,1,1],[2,3,1]]")).toEqual({
      value: [
        [2, 1, 1],
        [2, 3, 1],
      ],
    });
  });

  it.each([
    [nums, "[1]", /at least 2/],
    [nums, "[1,2", /not valid/],
    [nums, "5", /list in square brackets/],
    [nums, "[1, 2.5]", /not a whole number/],
    [nums, "[1, 100]", /between -99 and 99/],
    [target, "x", /whole number/],
    [target, "1000", /between -999 and 999/],
    [times, "[[1,2]]", /list of 3 numbers/],
    [times, "[[1,2,100]]", /between 0 and 99/],
    [word, '"Hello"', /lowercase English letters/],
    [word, '"abcdefghijk"', /at most 10/],
  ])("rejects %#", (field, text, message) => {
    expect(parseField(field, text).error).toMatch(message);
  });
});

describe("problem rules", () => {
  it.each([
    ["binary-search", { nums: "[3,1,2]", target: "1" }, /sorted/],
    ["network-delay-time", { times: "[[1,2,1]]", n: "2", k: "3" }, /k must be/],
    [
      "network-delay-time",
      { times: "[[1,5,1]]", n: "2", k: "1" },
      /outside 1..2/,
    ],
    [
      "network-delay-time",
      { times: "[[1,2,1],[1,2,3]]", n: "2", k: "1" },
      /two edges/,
    ],
    [
      "course-schedule-ii",
      { numCourses: "2", prerequisites: "[[0,0]]" },
      /own prerequisite/,
    ],
    [
      "course-schedule-ii",
      { numCourses: "2", prerequisites: "[[2,0]]" },
      /outside 0..1/,
    ],
    ["knapsack", { weights: "[1,2]", values: "[3]", capacity: "4" }, /2 items/],
  ])("%s rejects %j", (id, texts, message) => {
    expect(parseProblemInput(id, texts).errors._).toMatch(message);
  });

  it("falls back to the first example for an invalid URL", () => {
    const params = new URLSearchParams("problem=two-sum&nums=oops&target=9");
    expect(readProblemInput("two-sum", params)).toEqual(
      PROBLEMS["two-sum"].examples[0],
    );
  });
});
