// Test helpers shared by the problem tests: the JavaScript solution as shown
// on the page, and random valid inputs for every problem.
import { PROBLEMS } from "@shared/problems";
import { parseProblemInput } from "../utils/problemInput.js";

/** Runs the solution code exactly as it is shown on the page. */
export function runShownCode(problem, input) {
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
export const RANDOM_INPUTS = {
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

export const textsOf = (problem, input) =>
  Object.fromEntries(
    problem.fields.map((field) => [
      field.name,
      JSON.stringify(input[field.name]),
    ]),
  );

/** The examples plus `count` random valid inputs of a problem. */
export function sampleInputs(id, count) {
  const problem = PROBLEMS[id];
  const inputs = [...problem.examples];
  for (
    let tries = 0;
    inputs.length < problem.examples.length + count && tries < count * 5;
    tries++
  ) {
    const input = RANDOM_INPUTS[id]();
    if (!parseProblemInput(id, textsOf(problem, input)).errors)
      inputs.push(input);
  }
  return inputs;
}
