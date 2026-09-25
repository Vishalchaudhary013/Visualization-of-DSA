// Edit distance that counts a swap of two neighbouring letters as one typo
export function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// Short words only tolerate two swapped letters ("srot"); longer words one typo (two for 8+ letters)
export function isSimilar(word, target) {
  if (word === target) return true;
  if (target.length <= 4) {
    return (
      word.length === target.length &&
      [...word].sort().join("") === [...target].sort().join("") &&
      editDistance(word, target) === 1
    );
  }
  return editDistance(word, target) <= (target.length >= 8 ? 2 : 1);
}

// True if any of the words is similar to any of the targets
export function hasWord(words, targets) {
  return words.some((word) =>
    targets.some((target) => isSimilar(word, target)),
  );
}

// Lowercase words and numbers of a sentence
export function toWords(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}
