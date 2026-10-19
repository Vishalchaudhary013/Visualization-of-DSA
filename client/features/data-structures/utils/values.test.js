import { describe, expect, it } from "vitest";
import {
  formatValue,
  parseOperationValue,
  parseValuesParam,
} from "./values.js";

describe("parseOperationValue", () => {
  it("parses numbers", () => {
    expect(parseOperationValue(" 42 ")).toEqual({ value: 42 });
    expect(parseOperationValue("1000").error).toMatch(/0 to 999/);
    expect(parseOperationValue("4.5").error).toBeTruthy();
    expect(parseOperationValue("").error).toBeTruthy();
  });

  it("parses pairs for two-argument operations", () => {
    expect(parseOperationValue("3 5", { arity: 2 })).toEqual({ value: [3, 5] });
    expect(parseOperationValue("3,5", { arity: 2 })).toEqual({ value: [3, 5] });
    expect(parseOperationValue("3", { arity: 2 }).error).toMatch(
      /two whole numbers/,
    );
  });

  it("parses lowercase words", () => {
    expect(parseOperationValue(" Card ", { valueKind: "word" })).toEqual({
      value: "card",
    });
    expect(
      parseOperationValue("two words", { valueKind: "word" }).error,
    ).toMatch(/a–z/);
    expect(
      parseOperationValue("abc1", { valueKind: "word" }).error,
    ).toBeTruthy();
  });
});

describe("parseValuesParam", () => {
  it("reads numbers and words, rejecting bad input", () => {
    expect(parseValuesParam("1,2,3")).toEqual([1, 2, 3]);
    expect(parseValuesParam("1,x")).toBeNull();
    expect(parseValuesParam("car,cat", "word")).toEqual(["car", "cat"]);
    expect(parseValuesParam("car,c4t", "word")).toBeNull();
    expect(parseValuesParam(null)).toBeNull();
  });

  it("formats values for the operation log", () => {
    expect(formatValue([3, 5])).toBe("3, 5");
    expect(formatValue("car")).toBe("car");
  });
});
