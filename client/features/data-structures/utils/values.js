// Parsing for the value box and the ?values= URL parameter of data structure pages.

const WORD = /^[a-z]{1,12}$/;
const isSmallInt = (n) => Number.isInteger(n) && n >= 0 && n <= 999;

/**
 * Text typed for an operation -> { value } or { error }.
 * Words for the trie, two numbers for union-find's union/connected, else one number.
 */
export function parseOperationValue(
  text,
  { valueKind = "number", arity = 1 } = {},
) {
  const trimmed = text.trim().toLowerCase();
  if (valueKind === "word") {
    return WORD.test(trimmed)
      ? { value: trimmed }
      : { error: "Enter one word using letters a–z (up to 12)" };
  }
  const numbers = trimmed
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (arity === 2) {
    return numbers.length === 2 && numbers.every(isSmallInt)
      ? { value: numbers }
      : { error: "Enter two whole numbers, e.g. 3 5" };
  }
  return numbers.length === 1 && isSmallInt(numbers[0])
    ? { value: numbers[0] }
    : { error: "Enter a whole number from 0 to 999" };
}

/** "?values=" text -> array, or null when missing/invalid (the page then uses its starter values). */
export function parseValuesParam(text, valueKind = "number") {
  if (!text) return null;
  const parts = text.split(",");
  if (valueKind === "word") {
    return parts.every((part) => WORD.test(part)) ? parts.slice(0, 15) : null;
  }
  const values = parts.map(Number);
  return values.every(isSmallInt) ? values.slice(0, 15) : null;
}

export const formatValue = (value) =>
  Array.isArray(value) ? value.join(", ") : String(value);
