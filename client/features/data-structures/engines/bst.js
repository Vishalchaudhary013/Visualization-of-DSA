// Binary search tree engine.
// State: { root: id | null, nodes: { [id]: { id, value, left, right } } }
// Updates copy the nodes map, so earlier step snapshots stay unchanged.
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { failure, newId, step } from "./common.js";

const capacity = DATA_STRUCTURES.bst.capacity;
const countNodes = (state) => Object.keys(state.nodes).length;

function withNode(state, id, changes) {
  return {
    ...state,
    nodes: { ...state.nodes, [id]: { ...state.nodes[id], ...changes } },
  };
}

function insertQuietly(state, value) {
  const node = { id: newId(), value, left: null, right: null };
  if (state.root === null) return { root: node.id, nodes: { [node.id]: node } };
  let cur = state.nodes[state.root];
  for (;;) {
    if (value === cur.value) return state;
    const side = value < cur.value ? "left" : "right";
    if (cur[side] === null) {
      const next = withNode(state, cur.id, { [side]: node.id });
      next.nodes[node.id] = node;
      return next;
    }
    cur = state.nodes[cur[side]];
  }
}

function insert(state, value) {
  if (countNodes(state) >= capacity) {
    return failure(
      state,
      null,
      `The tree is limited to ${capacity} nodes in this demo. Delete one first.`,
    );
  }
  const node = { id: newId(), value, left: null, right: null };
  if (state.root === null) {
    const next = { root: node.id, nodes: { [node.id]: node } };
    return {
      state: next,
      steps: [
        step(next, {
          line: 1,
          found: [node.id],
          explanation: `The tree is empty: ${value} becomes the root`,
        }),
      ],
    };
  }
  const steps = [];
  let cur = state.nodes[state.root];
  for (;;) {
    if (value === cur.value) {
      steps.push(
        step(state, {
          line: 9,
          compare: [cur.id],
          explanation: `${value} is already in the tree: duplicates are ignored`,
        }),
      );
      return { state, steps };
    }
    const goLeft = value < cur.value;
    const side = goLeft ? "left" : "right";
    if (cur[side] === null) {
      const next = withNode(state, cur.id, { [side]: node.id });
      next.nodes[node.id] = node;
      steps.push(
        step(state, {
          line: goLeft ? 3 : 6,
          compare: [cur.id],
          explanation: `${value} ${goLeft ? "<" : ">"} ${cur.value}, and ${cur.value} has no ${side} child`,
        }),
        step(next, {
          line: goLeft ? 4 : 7,
          found: [node.id],
          explanation: `Attach ${value} as the ${side} child of ${cur.value}`,
        }),
      );
      return { state: next, steps };
    }
    steps.push(
      step(state, {
        line: goLeft ? 5 : 8,
        compare: [cur.id],
        explanation: `${value} ${goLeft ? "<" : ">"} ${cur.value}: go ${side}`,
      }),
    );
    cur = state.nodes[cur[side]];
  }
}

function search(state, value) {
  const steps = [];
  let id = state.root;
  let depth = 0;
  while (id !== null) {
    const cur = state.nodes[id];
    if (cur.value === value) {
      steps.push(
        step(state, {
          line: 3,
          found: [id],
          output: [value],
          explanation: `${value} == ${cur.value}: found after ${depth + 1} ${depth ? "comparisons" : "comparison"}`,
        }),
      );
      return { state, steps };
    }
    const goLeft = value < cur.value;
    steps.push(
      step(state, {
        line: 4,
        compare: [id],
        explanation: `${value} ${goLeft ? "<" : ">"} ${cur.value}: go ${goLeft ? "left" : "right"}`,
      }),
    );
    id = goLeft ? cur.left : cur.right;
    depth++;
  }
  steps.push(
    step(state, {
      line: 5,
      explanation: `Reached an empty spot: ${value} is not in the tree`,
    }),
  );
  return { state, steps };
}

/** Replaces the link to `id` (from its parent, or the root) with `replacement`. */
function relink(state, parentId, id, replacement) {
  if (parentId === null) return { ...state, root: replacement };
  const parent = state.nodes[parentId];
  return withNode(state, parentId, {
    [parent.left === id ? "left" : "right"]: replacement,
  });
}

function withoutNode(state, id) {
  const nodes = { ...state.nodes };
  delete nodes[id];
  return { ...state, nodes };
}

function remove(state, value) {
  const steps = [];
  let parentId = null;
  let id = state.root;
  while (id !== null && state.nodes[id].value !== value) {
    const cur = state.nodes[id];
    const goLeft = value < cur.value;
    steps.push(
      step(state, {
        line: 1,
        compare: [id],
        explanation: `${value} ${goLeft ? "<" : ">"} ${cur.value}: go ${goLeft ? "left" : "right"}`,
      }),
    );
    parentId = id;
    id = goLeft ? cur.left : cur.right;
  }
  if (id === null) {
    steps.push(
      step(state, {
        line: 1,
        explanation: `${value} is not in the tree: nothing to delete`,
      }),
    );
    return { state, steps };
  }

  const node = state.nodes[id];
  const children = [node.left, node.right].filter((child) => child !== null);
  if (children.length < 2) {
    const replacement = children[0] ?? null;
    const next = withoutNode(relink(state, parentId, id, replacement), id);
    steps.push(
      step(state, {
        line: children.length ? 3 : 2,
        swap: [id],
        explanation: children.length
          ? `${value} has one child (${state.nodes[replacement].value}): it takes ${value}'s place`
          : `${value} is a leaf: just remove it`,
      }),
      step(next, {
        line: children.length ? 3 : 2,
        explanation: `Deleted ${value}`,
      }),
    );
    return { state: next, steps };
  }

  // Two children: replace with the in-order successor (smallest in the right subtree)
  steps.push(
    step(state, {
      line: 4,
      active: [id],
      explanation: `${value} has two children: find the smallest value in its right subtree`,
    }),
  );
  let successorParentId = id;
  let successorId = node.right;
  while (state.nodes[successorId].left !== null) {
    steps.push(
      step(state, {
        line: 4,
        compare: [successorId],
        active: [id],
        explanation: `${state.nodes[successorId].value} has a left child: keep going left`,
      }),
    );
    successorParentId = successorId;
    successorId = state.nodes[successorId].left;
  }
  const successor = state.nodes[successorId];
  steps.push(
    step(state, {
      line: 4,
      found: [successorId],
      active: [id],
      explanation: `The smallest value in the right subtree is ${successor.value}`,
    }),
  );
  let next = withNode(state, id, { value: successor.value });
  steps.push(
    step(next, {
      line: 5,
      swap: [id, successorId],
      explanation: `Copy ${successor.value} into the node that held ${value}`,
    }),
  );
  next = withoutNode(
    relink(next, successorParentId, successorId, successor.right),
    successorId,
  );
  steps.push(
    step(next, {
      line: 5,
      found: [id],
      explanation: `Remove the old ${successor.value} node (it had no left child). Deleted ${value}`,
    }),
  );
  return { state: next, steps };
}

function traversal(order) {
  const visitLine = { preorder: 2, inorder: 3, postorder: 4 }[order];
  return (state) => {
    if (state.root === null)
      return failure(state, 1, "The tree is empty: nothing to traverse.");
    const steps = [];
    const output = [];
    const visited = [];
    const visit = (id) => {
      const node = state.nodes[id];
      output.push(node.value);
      visited.push(id);
      steps.push(
        step(state, {
          line: visitLine,
          found: [...visited],
          output: [...output],
          explanation: `Visit ${node.value}`,
        }),
      );
    };
    const walk = (id) => {
      if (id === null) return;
      steps.push(
        step(state, {
          line: 1,
          active: [id],
          found: [...visited],
          output: [...output],
          explanation: `At ${state.nodes[id].value}`,
        }),
      );
      if (order === "preorder") visit(id);
      walk(state.nodes[id].left);
      if (order === "inorder") visit(id);
      walk(state.nodes[id].right);
      if (order === "postorder") visit(id);
    };
    walk(state.root);
    steps.push(
      step(state, {
        line: null,
        found: [...visited],
        output: [...output],
        explanation: `${order[0].toUpperCase()}${order.slice(1, -5)}-order traversal: ${output.join(", ")}`,
      }),
    );
    return { state, steps };
  };
}

export const bst = {
  empty: () => ({ root: null, nodes: {} }),
  fromValues: (values) =>
    values.reduce(insertQuietly, { root: null, nodes: {} }),
  // Pre-order values rebuild exactly the same shape when inserted in order
  toValues: (state) => {
    const values = [];
    const walk = (id) => {
      if (id === null) return;
      values.push(state.nodes[id].value);
      walk(state.nodes[id].left);
      walk(state.nodes[id].right);
    };
    walk(state.root);
    return values;
  },
  operations: {
    insert,
    search,
    remove,
    inorder: traversal("inorder"),
    preorder: traversal("preorder"),
    postorder: traversal("postorder"),
  },
};
