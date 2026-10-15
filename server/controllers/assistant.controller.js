import { ALGORITHMS } from "../../shared/algorithms.js";
import { hasWord, toWords } from "../utils/fuzzyMatch.js";

const ALGORITHM_LIST = Object.values(ALGORITHMS);

const CUSTOM_EXPLANATIONS = {
  "binary-search": `Binary Search halves the search space each time. Example with sorted array [2, 4, 5, 8, 12, 17, 21]:

- Step 1: low=0, high=6 → mid=(0+6)//2=3 → value 8. Target 8 found immediately.
- Searching for 5: low=0, high=6 → mid=3 (value 8). 5 < 8 so move left: new range low=0, high=2.
- mid=(0+2)//2=1 → value 4. 5 > 4 so move right: new range low=2, high=2.
- mid=2 → value 5, target found.

Each comparison halves the remaining segment, giving O(log n) time.`,
  "bubble-sort": `Bubble Sort compares adjacent pairs and "bubbles" the largest item to the end each pass. Keep repeating passes until no swaps remain. Time: O(n^2) average/worst, O(1) space.`,
  "selection-sort": `Selection Sort repeatedly picks the smallest element from the unsorted suffix and swaps it to the front. Requires O(n^2) comparisons but only O(1) swaps per pass.`,
  "merge-sort": `Merge Sort splits the array into halves until size 1, then merges them back in sorted order. Generates a balanced recursion tree of depth log n, so runtime is O(n log n) with O(n) extra space.`,
  "quick-sort": `Quick Sort selects a pivot, partitions smaller elements to the left and larger to the right, then recurses on both partitions. Average runtime O(n log n); choose pivots carefully to avoid worst-case O(n^2).`,
};

const CATEGORY_KEYWORDS = {
  sorting: ["sort", "sorts", "sorting"],
  searching: ["search", "searches", "searching"],
  "graph-traversal": ["graph", "graphs", "traversal", "traverse", "traversing"],
};

function findMatchingAlgorithms(question) {
  const words = toWords(question);
  const compact = words.join("");
  return ALGORITHM_LIST.filter((algo) => {
    // Exact name, joined name ("quicksort") or id ("bfs")
    const nameWords = toWords(algo.name);
    if (
      compact.includes(nameWords.join("")) ||
      words.includes(algo.id.replace(/-/g, ""))
    )
      return true;
    // Every word of the name present, allowing typos ("bubble srot", "binary serach")
    return nameWords.every((nameWord) => {
      const variants = CATEGORY_KEYWORDS.sorting.includes(nameWord)
        ? CATEGORY_KEYWORDS.sorting
        : CATEGORY_KEYWORDS.searching.includes(nameWord)
          ? CATEGORY_KEYWORDS.searching
          : [nameWord];
      return hasWord(words, variants);
    });
  });
}

function findMatchingCategory(question) {
  const words = toWords(question);
  return Object.keys(CATEGORY_KEYWORDS).find((category) =>
    hasWord(words, CATEGORY_KEYWORDS[category]),
  );
}

function buildAlgorithmSummary(algoId) {
  const algo = ALGORITHMS[algoId];
  if (!algo) return null;
  const explanation = CUSTOM_EXPLANATIONS[algoId];
  const lines = [
    `**${algo.name}**`,
    `${algo.description}`,
    `Time Complexity → Best ${algo.complexity.time.best}, Avg ${algo.complexity.time.average}, Worst ${algo.complexity.time.worst}`,
    `Space Complexity → ${algo.complexity.space}`,
  ];
  if (explanation) {
    lines.push(`Detail: ${explanation}`);
  } else if (algo.howItWorks) {
    lines.push(
      "How it works:",
      ...algo.howItWorks.map((item, index) => `${index + 1}. ${item}`),
    );
  }
  if (algo.useCases) {
    lines.push(`Use it for: ${algo.useCases.join("; ")}.`);
  }
  return lines.join("\n");
}

function buildCategoryMessage(category, algos) {
  const lines = algos.map(
    (algo) =>
      `- **${algo.name}**: ${algo.description} Average time ${algo.complexity.time.average}, space ${algo.complexity.space}.`,
  );
  return `Here are the ${category.replace("-", " ")} algorithms I know:\n\n${lines.join("\n")}\n\nAsk about one by name for a detailed explanation (e.g., "Explain ${algos[0].name.toLowerCase()}").`;
}

function buildFallbackMessage() {
  const categories = ALGORITHM_LIST.reduce((acc, algo) => {
    if (!acc[algo.category]) acc[algo.category] = [];
    acc[algo.category].push(algo.name);
    return acc;
  }, {});
  const categoryLines = Object.entries(categories)
    .map(
      ([category, items]) => `- ${category}: ${items.slice(0, 4).join(", ")}`,
    )
    .join("\n");
  return `I can answer questions about sorting, searching, and graph algorithms. Try referencing an algorithm name (e.g., "Explain quick sort").\n\nAvailable families:\n${categoryLines}`;
}

// POST /api/assistant  { question, algorithmId? } -> { reply, matchedIds }
// algorithmId is the algorithm open in the visualizer; it answers questions
// that don't name one ("how does this work?").
export const askAssistant = (req, res) => {
  const { question, algorithmId } = req.body ?? {};
  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Please provide a question." });
  }

  const matches = findMatchingAlgorithms(question);
  if (matches.length) {
    const reply = matches
      .slice(0, 3)
      .map((algo) => buildAlgorithmSummary(algo.id))
      .filter(Boolean)
      .join("\n\n");
    return res.json({ reply, matchedIds: matches.map((algo) => algo.id) });
  }

  // No specific algorithm named, but a family was ("explain a searching algorithm")
  const category = findMatchingCategory(question);
  if (category) {
    const algos = ALGORITHM_LIST.filter((algo) => algo.category === category);
    return res.json({
      reply: buildCategoryMessage(category, algos),
      matchedIds: algos.map((algo) => algo.id),
    });
  }

  if (
    typeof algorithmId === "string" &&
    Object.hasOwn(ALGORITHMS, algorithmId)
  ) {
    return res.json({
      reply: buildAlgorithmSummary(algorithmId),
      matchedIds: [algorithmId],
    });
  }

  return res.json({ reply: buildFallbackMessage(), matchedIds: [] });
};
