import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PROBLEMS } from "@shared/problems";
import { LANGUAGES, SOLUTIONS } from "@shared/solutions";
import { solveProblem } from "../utils/problemInput.js";
import { runShownCode, sampleInputs } from "./testInputs.js";

const IDS = Object.keys(PROBLEMS);
const OTHER_LANGUAGES = LANGUAGES.filter(({ id }) => id !== "javascript");
const methodOf = (problem) => /function (\w+)/.exec(problem.code)[1];
const usedLines = (id) =>
  new Set(
    PROBLEMS[id].examples.flatMap((input) =>
      solveProblem(id, input).map((step) => step.line),
    ),
  );

describe.each(IDS)("%s solutions", (id) => {
  const problem = PROBLEMS[id];
  const jsLines = problem.code.split("\n").length;

  it.each(OTHER_LANGUAGES.map(({ id: language }) => [language]))(
    "%s maps every JavaScript line to a line of its code",
    (language) => {
      const solution = SOLUTIONS[id][language];
      expect(solution).toBeDefined();
      expect(solution.code).toContain(methodOf(problem));
      expect(solution.lines).toHaveLength(jsLines);
      const lines = solution.code.split("\n").length;
      for (const line of solution.lines) {
        expect(line).toBeGreaterThanOrEqual(0);
        expect(line).toBeLessThan(lines);
      }
      // Lines that steps highlight are never blank or a lone closing brace
      for (const line of usedLines(id)) {
        expect(
          solution.code.split("\n")[solution.lines[line]].trim(),
        ).not.toMatch(/^[{}]?;?$/);
      }
    },
  );
});

// ---------------------------------------------------------------------------
// Compile and run the Python, Java and C++ solutions on the same inputs as the
// JavaScript one. Skipped when the compilers aren't installed.

const available = (command, args) =>
  spawnSync(command, args, { stdio: "ignore" }).status === 0;
const HAS_TOOLS =
  available("python3", ["--version"]) &&
  available("javac", ["-version"]) &&
  available("g++", ["--version"]);

const CASES = IDS.map((id) => {
  const problem = PROBLEMS[id];
  const inputs = sampleInputs(id, 15);
  return {
    id,
    problem,
    inputs,
    expected: inputs.map((input) =>
      JSON.stringify(runShownCode(problem, input)),
    ),
  };
});
const argsOf = (problem, input) =>
  problem.fields.map((field) => input[field.name]);

// Reads [{ code, method, cases }] on stdin and prints one answer per line
function pythonProgram() {
  return `import heapq, json, math, sys
from collections import deque
from typing import List

for group in json.loads(sys.stdin.read()):
    scope = {"List": List, "deque": deque, "heapq": heapq, "math": math}
    exec(group["code"], scope)
    method = getattr(scope["Solution"](), group["method"])
    for args in group["cases"]:
        print(json.dumps(method(*args), separators=(",", ":")))
`;
}

const javaValue = (field, value) => {
  if (field.type === "int") return String(value);
  if (field.type === "string") return JSON.stringify(value);
  if (field.type === "int[]") return `new int[] {${value.join(",")}}`;
  return `new int[][] {${value.map((row) => `{${row.join(",")}}`).join(",")}}`;
};

function javaProgram() {
  const classes = CASES.map(({ id }, index) =>
    SOLUTIONS[id].java.code.replace("class Solution", `class Solution${index}`),
  );
  const calls = CASES.flatMap(({ problem, inputs }, index) =>
    inputs.map(
      (input) =>
        `    System.out.println(show(new Solution${index}().${methodOf(problem)}(${problem.fields
          .map((field) => javaValue(field, input[field.name]))
          .join(", ")})));`,
    ),
  );
  return `import java.util.*;
${classes.join("\n")}
public class Main {
  static String show(int value) { return String.valueOf(value); }
  static String show(int[] values) {
    StringJoiner joiner = new StringJoiner(",", "[", "]");
    for (int value : values) joiner.add(String.valueOf(value));
    return joiner.toString();
  }
  public static void main(String[] args) {
${calls.join("\n")}
  }
}
`;
}

const CPP_TYPES = {
  int: "int",
  string: "string",
  "int[]": "vector<int>",
  "int[][]": "vector<vector<int>>",
};
const cppValue = (field, value) => {
  if (field.type === "int") return String(value);
  if (field.type === "string") return JSON.stringify(value);
  if (field.type === "int[]") return `{${value.join(",")}}`;
  return `{${value.map((row) => `{${row.join(",")}}`).join(",")}}`;
};

function cppProgram() {
  const namespaces = CASES.map(
    ({ id }, index) => `namespace p${index} {\n${SOLUTIONS[id].cpp.code}\n}`,
  );
  const calls = CASES.flatMap(({ problem, inputs }, index) =>
    inputs.map((input) => {
      const declarations = problem.fields
        .map(
          (field, k) =>
            `${CPP_TYPES[field.type]} a${k} = ${cppValue(field, input[field.name])};`,
        )
        .join(" ");
      const args = problem.fields.map((_, k) => `a${k}`).join(", ");
      return `  { ${declarations} cout << show(p${index}::Solution().${methodOf(problem)}(${args})) << "\\n"; }`;
    }),
  );
  return `#include <bits/stdc++.h>
using namespace std;
${namespaces.join("\n")}
string show(int value) { return to_string(value); }
string show(const vector<int>& values) {
  string text = "[";
  for (size_t i = 0; i < values.size(); i++) text += (i ? "," : "") + to_string(values[i]);
  return text + "]";
}
int main() {
${calls.join("\n")}
}
`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0)
    throw new Error(`${command} failed:\n${result.stderr || result.stdout}`);
  return result.stdout.trim().split("\n");
}

const expectedLines = CASES.flatMap(({ expected }) => expected);
const labels = CASES.flatMap(({ id, inputs }) =>
  inputs.map((input) => `${id} ${JSON.stringify(input)}`),
);
const compare = (actual) => {
  expect(actual).toHaveLength(expectedLines.length);
  actual.forEach((line, index) =>
    expect(`${labels[index]} -> ${line}`).toBe(
      `${labels[index]} -> ${expectedLines[index]}`,
    ),
  );
};

describe.skipIf(!HAS_TOOLS)(
  "solutions in other languages give the same answers",
  () => {
    it("Python", () => {
      const groups = CASES.map(({ id, problem, inputs }) => ({
        code: SOLUTIONS[id].python.code,
        method: methodOf(problem),
        cases: inputs.map((input) => argsOf(problem, input)),
      }));
      compare(
        run("python3", ["-I", "-c", pythonProgram()], {
          input: JSON.stringify(groups),
        }),
      );
    });

    it("Java", () => {
      const dir = mkdtempSync(join(tmpdir(), "dsa-java-"));
      try {
        writeFileSync(join(dir, "Main.java"), javaProgram());
        run("javac", ["Main.java"], { cwd: dir });
        compare(run("java", ["-cp", dir, "Main"]));
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }, 60_000);

    it("C++", () => {
      const dir = mkdtempSync(join(tmpdir(), "dsa-cpp-"));
      try {
        writeFileSync(join(dir, "main.cpp"), cppProgram());
        run("g++", ["-std=c++17", "-w", "-o", join(dir, "main"), "main.cpp"], {
          cwd: dir,
        });
        compare(run(join(dir, "main"), []));
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }, 60_000);
  },
);
