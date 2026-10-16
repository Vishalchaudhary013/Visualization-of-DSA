// Trie (prefix tree) of lowercase words.
// State: { root: id, nodes: { [id]: { id, char, children: { [char]: id }, end } } }
// Updates copy the nodes map, so earlier step snapshots stay unchanged.
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { failure, newId, step } from "./common.js";

const { capacity } = DATA_STRUCTURES.trie;
const WORD_POOL = [
  "car",
  "card",
  "care",
  "cart",
  "cat",
  "dog",
  "do",
  "dot",
  "tea",
  "ten",
  "tree",
  "trie",
  "trip",
  "to",
  "toy",
  "art",
];

function emptyTrie() {
  const root = { id: newId(), char: "", children: {}, end: false };
  return { root: root.id, nodes: { [root.id]: root } };
}

const withNode = (state, id, changes) => ({
  ...state,
  nodes: { ...state.nodes, [id]: { ...state.nodes[id], ...changes } },
});

function addChild(state, parentId, char) {
  const child = { id: newId(), char, children: {}, end: false };
  const parent = state.nodes[parentId];
  const next = withNode(state, parentId, {
    children: { ...parent.children, [char]: child.id },
  });
  next.nodes[child.id] = child;
  return { state: next, childId: child.id };
}

/** All words below `id`, alphabetically, with the ids of their end nodes. */
function collect(state, id, prefix) {
  const words = [];
  const ends = [];
  const walk = (nodeId, text) => {
    const node = state.nodes[nodeId];
    if (node.end) {
      words.push(text);
      ends.push(nodeId);
    }
    for (const char of Object.keys(node.children).sort()) {
      walk(node.children[char], text + char);
    }
  };
  walk(id, prefix);
  return { words, ends };
}

function insertQuietly(state, word) {
  let next = state;
  let id = next.root;
  for (const char of word) {
    const childId = next.nodes[id].children[char];
    if (childId) id = childId;
    else ({ state: next, childId: id } = addChild(next, id, char));
  }
  return withNode(next, id, { end: true });
}

/** Follows `text` letter by letter. Returns the path of node ids, stopping early if a letter is missing. */
function walk(state, text) {
  const path = [state.root];
  for (const char of text) {
    const childId = state.nodes[path.at(-1)].children[char];
    if (!childId) return { path, missing: char };
    path.push(childId);
  }
  return { path, missing: null };
}

/** Steps for walking `text`: one per letter, highlighting the node reached. */
function walkSteps(state, text, { line, lineMissing, missingText }) {
  const steps = [
    step(state, {
      line: 1,
      active: [state.root],
      explanation: "Start at the root",
    }),
  ];
  const { path, missing } = walk(state, text);
  path.slice(1).forEach((id, index) => {
    steps.push(
      step(state, {
        line,
        active: [id],
        explanation: `Letter '${text[index]}': follow the existing child (prefix "${text.slice(0, index + 1)}")`,
      }),
    );
  });
  if (missing) {
    steps.push(
      step(state, {
        line: lineMissing,
        compare: [path.at(-1)],
        explanation: missingText(missing, path.length - 1),
      }),
    );
  }
  return { steps, path, missing };
}

export const trie = {
  empty: emptyTrie,
  fromValues: (words) => words.reduce(insertQuietly, emptyTrie()),
  toValues: (state) => collect(state, state.root, "").words,
  randomValues: () =>
    [...WORD_POOL].sort(() => Math.random() - 0.5).slice(0, 5),
  operations: {
    insert: (state, word) => {
      if (Object.keys(state.nodes).length + word.length > capacity + 1) {
        return failure(
          state,
          null,
          `This demo trie is limited to ${capacity} letter nodes. Delete a word first.`,
        );
      }
      let next = state;
      let id = next.root;
      const steps = [
        step(next, {
          line: 1,
          active: [id],
          explanation: `Insert "${word}": start at the root`,
        }),
      ];
      for (const [index, char] of [...word].entries()) {
        const childId = next.nodes[id].children[char];
        if (childId) {
          id = childId;
          steps.push(
            step(next, {
              line: 4,
              active: [id],
              explanation: `'${char}' already exists: share it (prefix "${word.slice(0, index + 1)}")`,
            }),
          );
        } else {
          ({ state: next, childId: id } = addChild(next, id, char));
          steps.push(
            step(next, {
              line: 3,
              found: [id],
              explanation: `No '${char}' child yet: create it`,
            }),
          );
        }
      }
      const already = next.nodes[id].end;
      next = withNode(next, id, { end: true });
      steps.push(
        step(next, {
          line: 5,
          found: [id],
          explanation: already
            ? `"${word}" was already in the trie`
            : `Mark the last letter as the end of the word "${word}"`,
        }),
      );
      return { state: next, steps };
    },
    search: (state, word) => {
      const { steps, path, missing } = walkSteps(state, word, {
        line: 4,
        lineMissing: 3,
        missingText: (char) =>
          `No '${char}' child: "${word}" is not in the trie`,
      });
      if (!missing) {
        const node = state.nodes[path.at(-1)];
        steps.push(
          step(state, {
            line: 5,
            ...(node.end ? { found: [node.id] } : { compare: [node.id] }),
            output: node.end ? [word] : undefined,
            explanation: node.end
              ? `The last letter is marked as a word end: found "${word}"`
              : `"${word}" is only a prefix of other words, not a stored word`,
          }),
        );
      }
      return { state, steps };
    },
    startsWith: (state, prefix) => {
      const { steps, path, missing } = walkSteps(state, prefix, {
        line: 4,
        lineMissing: 3,
        missingText: (char) =>
          `No '${char}' child: no word starts with "${prefix}"`,
      });
      if (!missing) {
        const { words, ends } = collect(state, path.at(-1), prefix);
        steps.push(
          step(state, {
            line: 5,
            active: [path.at(-1)],
            found: ends,
            output: words,
            explanation: words.length
              ? `${words.length} ${words.length === 1 ? "word starts" : "words start"} with "${prefix}": ${words.join(", ")}`
              : `No stored word starts with "${prefix}"`,
          }),
        );
      }
      return { state, steps };
    },
    remove: (state, word) => {
      const { path, missing } = walk(state, word);
      const last = state.nodes[path.at(-1)];
      if (missing || !last.end) {
        return {
          state,
          steps: [
            step(state, {
              line: 1,
              explanation: `"${word}" is not in the trie: nothing to delete`,
            }),
          ],
        };
      }
      const steps = path.slice(1).map((id, index) =>
        step(state, {
          line: 1,
          active: [id],
          explanation: `Walk to '${word[index]}'`,
        }),
      );
      let next = withNode(state, last.id, { end: false });
      steps.push(
        step(next, {
          line: 2,
          swap: [last.id],
          explanation: `Unmark the end of "${word}"`,
        }),
      );
      // Prune nodes that no longer lead to any word
      for (let i = path.length - 1; i > 0; i--) {
        const node = next.nodes[path[i]];
        if (node.end || Object.keys(node.children).length) {
          steps.push(
            step(next, {
              line: 3,
              active: [node.id],
              explanation: `'${node.char}' is still used by another word: stop pruning`,
            }),
          );
          break;
        }
        const parentId = path[i - 1];
        const { [node.char]: _removed, ...children } =
          next.nodes[parentId].children;
        next = withNode(next, parentId, { children });
        delete next.nodes[node.id];
        steps.push(
          step(next, {
            line: 4,
            active: [parentId],
            explanation: `'${node.char}' no longer leads to any word: remove it`,
          }),
        );
      }
      steps.push(step(next, { line: null, explanation: `Deleted "${word}"` }));
      return { state: next, steps };
    },
  },
};
