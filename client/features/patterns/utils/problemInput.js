// Parses LeetCode-style inputs ("[2,7,11,15]", "9", "\"abc\"", "[[1,0],[2,1]]")
// against a field definition from shared/problems.js, and keeps a problem's
// input in the URL so a run can be shared.
import { PROBLEMS } from "@shared/problems";
import { PROBLEM_SOLVERS } from "../problems";

const isInt = (value) => Number.isInteger(value);

function parseJson(text) {
  try {
    return { value: JSON.parse(text) };
  } catch {
    return { error: "is not valid. Use LeetCode's format, e.g. [1,2,3]." };
  }
}

function checkInt(value, field, where = "") {
  if (!isInt(value))
    return `${where}${JSON.stringify(value)} is not a whole number.`;
  if (value < field.min || value > field.max)
    return `${where}${value} must be between ${field.min} and ${field.max}.`;
  return null;
}

function checkLength(length, field, unit) {
  if (length < field.minLength)
    return `needs at least ${field.minLength} ${unit}.`;
  if (length > field.maxLength)
    return `can have at most ${field.maxLength} ${unit} here.`;
  return null;
}

/** -> { value } or { error } (the error starts with the field name). */
export function parseField(field, rawText) {
  // Allow pasting "nums = [1,2,3]" straight from LeetCode
  const text = rawText
    .trim()
    .replace(new RegExp(`^${field.name}\\s*=\\s*`), "")
    .trim();
  const fail = (message) => ({ error: `${field.name} ${message}` });

  if (field.type === "int") {
    if (!/^-?\d+$/.test(text)) return fail("must be a whole number.");
    const value = Number(text);
    return value < field.min || value > field.max
      ? fail(`must be between ${field.min} and ${field.max}.`)
      : { value };
  }

  if (field.type === "string") {
    let value = text;
    if (text.startsWith('"')) {
      const parsed = parseJson(text);
      if (parsed.error || typeof parsed.value !== "string")
        return fail('must be text in quotes, e.g. "abc".');
      value = parsed.value;
    }
    const lengthError = checkLength(value.length, field, "characters");
    if (lengthError) return fail(lengthError);
    if (field.letters && !/^[a-z]*$/.test(value))
      return fail("may only use lowercase English letters.");
    return { value };
  }

  const parsed = parseJson(text);
  if (parsed.error) return fail(parsed.error);
  const list = parsed.value;
  if (!Array.isArray(list)) return fail("must be a list in square brackets.");
  const unit =
    field.type === "int[]" ? "numbers" : field.tuple === 3 ? "edges" : "pairs";
  const lengthError = checkLength(list.length, field, unit);
  if (lengthError) return fail(lengthError);

  for (const [index, item] of list.entries()) {
    if (field.type === "int[]") {
      const error = checkInt(item, field);
      if (error) return fail(`has a problem: ${error}`);
      continue;
    }
    if (!Array.isArray(item) || item.length !== field.tuple)
      return fail(
        `item ${index + 1} must be a list of ${field.tuple} numbers, like [${Array.from({ length: field.tuple }, (_, i) => i + 1).join(",")}].`,
      );
    for (const value of item) {
      const error = checkInt(value, field, `[${item}]: `);
      if (error) return fail(`has a problem: ${error}`);
    }
  }
  return { value: list };
}

export const formatField = (field, value) => JSON.stringify(value);

/** Parses every field, then the problem's own rules. -> { input } or { errors } */
export function parseProblemInput(problemId, texts) {
  const problem = PROBLEMS[problemId];
  const input = {};
  const errors = {};
  for (const field of problem.fields) {
    const { value, error } = parseField(field, texts[field.name] ?? "");
    if (error) errors[field.name] = error;
    else input[field.name] = value;
  }
  if (Object.keys(errors).length) return { errors };
  const ruleError = PROBLEM_SOLVERS[problemId].check?.(input);
  return ruleError ? { errors: { _: ruleError } } : { input };
}

export const formatInput = (problemId, input) =>
  Object.fromEntries(
    PROBLEMS[problemId].fields.map((field) => [
      field.name,
      formatField(field, input[field.name]),
    ]),
  );

/** The input in the URL if it is complete and valid, else the first example. */
export function readProblemInput(problemId, params) {
  const problem = PROBLEMS[problemId];
  if (problem.fields.every((field) => params.has(field.name))) {
    const texts = Object.fromEntries(
      problem.fields.map((field) => [field.name, params.get(field.name)]),
    );
    const { input } = parseProblemInput(problemId, texts);
    if (input) return input;
  }
  return problem.examples[0];
}

export function buildProblemParams(problemId, input) {
  return new URLSearchParams({
    problem: problemId,
    ...formatInput(problemId, input),
  });
}

export function solveProblem(problemId, input) {
  return PROBLEM_SOLVERS[problemId].solve(input);
}
