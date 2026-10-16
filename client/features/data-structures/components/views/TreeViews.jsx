import { motion } from "motion/react";
import { roleOf, ROLE_STYLES } from "./roles";

const RADIUS = 20;
const LEVEL_HEIGHT = 70;
const spring = { type: "spring", stiffness: 300, damping: 30 };

/**
 * Generic SVG tree. `nodes`: [{ id, value, x, depth, parentId, label }] where
 * x is in [0, 1] across the width. Nodes are keyed by id so they glide when
 * they move (heap swaps, BST deletes).
 */
// Exported for the trie and union-find views. Optional per node: label (text
// under it) and ring (double outline, e.g. a trie word end).
export function Tree({ nodes, highlight, emptyText, minWidth = 0 }) {
  if (!nodes.length) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }
  const depth = Math.max(...nodes.map((node) => node.depth));
  const width = Math.max(320, 2 ** Math.min(depth, 4) * 56, minWidth);
  const height = (depth + 1) * LEVEL_HEIGHT + 20;
  const position = (node) => ({
    x: RADIUS + 8 + node.x * (width - 2 * (RADIUS + 8)),
    y: RADIUS + 14 + node.depth * LEVEL_HEIGHT,
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto w-full max-w-3xl"
      style={{ maxHeight: `${Math.max(height, 200)}px` }}
      role="img"
      aria-label={`Tree with ${nodes.length} nodes`}
    >
      {nodes
        .filter((node) => byId.has(node.parentId))
        .map((node) => {
          const from = position(byId.get(node.parentId));
          const to = position(node);
          return (
            <motion.line
              key={`edge-${node.id}`}
              initial={false}
              animate={{ x1: from.x, y1: from.y, x2: to.x, y2: to.y }}
              transition={spring}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth={2}
            />
          );
        })}
      {nodes.map((node) => {
        const { x, y } = position(node);
        const role = roleOf(node.id, highlight);
        return (
          <motion.g
            key={node.id}
            initial={false}
            animate={{ x, y }}
            transition={spring}
          >
            {role !== "idle" && (
              <circle
                r={RADIUS + 6}
                className={`${ROLE_STYLES[role].fill} opacity-25`}
              />
            )}
            {node.ring && (
              <circle
                r={RADIUS + 4}
                className="fill-none stroke-foreground"
                strokeWidth={2}
              />
            )}
            <circle
              r={RADIUS}
              className={`${ROLE_STYLES[role].fill} stroke-background transition-colors duration-300`}
              strokeWidth={3}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none fill-white font-mono text-sm font-bold"
            >
              {node.value}
            </text>
            {node.label !== undefined && (
              <text
                y={RADIUS + 12}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[10px]"
              >
                {node.label}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

/** Heap: the array drawn as a complete binary tree, plus the array itself. */
export function HeapView({ step }) {
  const { items, mode } = step.state;
  const nodes = items.map((item, index) => {
    const depth = Math.floor(Math.log2(index + 1));
    const positionInLevel = index - (2 ** depth - 1);
    return {
      id: item.id,
      value: item.value,
      depth,
      x: (positionInLevel + 0.5) / 2 ** depth,
      parentId: index ? items[Math.floor((index - 1) / 2)].id : null,
      label: index,
    };
  });

  return (
    <div className="space-y-5">
      <Tree
        nodes={nodes}
        highlight={step.highlight}
        emptyText={`Empty ${mode}-heap. Insert a value to start.`}
      />
      {items.length > 0 && (
        <div className="overflow-x-auto pb-1">
          <p className="mb-1.5 text-center text-xs text-muted-foreground">
            Stored as an array (children of i are 2i+1 and 2i+2)
          </p>
          <div className="mx-auto flex w-max gap-1">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col items-center gap-0.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-md font-mono text-sm font-bold text-white ${ROLE_STYLES[roleOf(item.id, step.highlight)].bg}`}
                >
                  {item.value}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {index}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** BST: x position from the in-order rank, so the tree reads left-to-right sorted. */
export function BstView({ step }) {
  const { root, nodes: nodeMap } = step.state;
  const nodes = [];
  const count = Object.keys(nodeMap).length;
  let rank = 0;
  const walk = (id, depth, parentId) => {
    if (id === null) return;
    const node = nodeMap[id];
    walk(node.left, depth + 1, id);
    nodes.push({
      id,
      value: node.value,
      depth,
      parentId,
      x: count === 1 ? 0.5 : rank / (count - 1),
    });
    rank++;
    walk(node.right, depth + 1, id);
  };
  walk(root, 0, null);

  return (
    <Tree
      nodes={nodes}
      highlight={step.highlight}
      emptyText="Empty tree. Insert a value to start."
    />
  );
}

/** Trie: letters as nodes, word ends drawn with a double ring, laid out by leaves. */
export function TrieView({ step }) {
  const { root, nodes: nodeMap } = step.state;
  const nodes = [];
  let leaf = 0;
  // Leaves get consecutive slots; a parent sits above the middle of its children
  const place = (id, depth, parentId) => {
    const node = nodeMap[id];
    const children = Object.keys(node.children).sort();
    const entry = {
      id,
      value: id === root ? "•" : node.char,
      depth,
      parentId,
      ring: node.end,
    };
    nodes.push(entry);
    if (!children.length) {
      entry.slot = leaf++;
      return entry.slot;
    }
    const slots = children.map((char) =>
      place(node.children[char], depth + 1, id),
    );
    entry.slot = (slots[0] + slots.at(-1)) / 2;
    return entry.slot;
  };
  place(root, 0, null);
  const span = Math.max(leaf - 1, 1);
  for (const node of nodes) node.x = leaf <= 1 ? 0.5 : node.slot / span;

  return (
    <div className="space-y-2">
      <Tree
        nodes={nodes.length > 1 ? nodes : []}
        highlight={step.highlight}
        minWidth={leaf * 52}
        emptyText="Empty trie. Insert a word to start."
      />
      {nodes.length > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          Double ring = a word ends here
        </p>
      )}
    </div>
  );
}

/** Union-find: each set is a tree (children point up to parents), plus the parent array. */
export function UnionFindView({ step }) {
  const { parent } = step.state;
  const children = parent.map(() => []);
  parent.forEach((p, x) => {
    if (p !== x) children[p].push(x);
  });
  const nodes = [];
  let leaf = 0;
  const place = (x, depth) => {
    const entry = {
      id: `e${x}`,
      value: x,
      depth,
      parentId: parent[x] === x ? null : `e${parent[x]}`,
    };
    nodes.push(entry);
    if (!children[x].length) {
      entry.slot = leaf++;
    } else {
      const slots = children[x].map((child) => place(child, depth + 1));
      entry.slot = (slots[0] + slots.at(-1)) / 2;
    }
    return entry.slot;
  };
  parent.forEach((p, x) => {
    if (p === x) {
      place(x, 0);
      leaf += 0.5; // a little space between separate sets
    }
  });
  const span = Math.max(leaf - 1.5, 1);
  for (const node of nodes) node.x = leaf <= 1.5 ? 0.5 : node.slot / span;
  const roots = parent.filter((p, x) => p === x).length;

  return (
    <div className="space-y-5">
      <Tree
        nodes={nodes}
        highlight={step.highlight}
        minWidth={leaf * 52}
        emptyText="No elements yet. Use “Add element” to create some."
      />
      {parent.length > 0 && (
        <div className="overflow-x-auto pb-1">
          <p className="mb-1.5 text-center text-xs text-muted-foreground">
            {roots} {roots === 1 ? "set" : "sets"} · parent array (parent[x] = x
            means x is a root)
          </p>
          <div className="mx-auto flex w-max gap-1">
            {parent.map((p, x) => (
              <div key={x} className="flex flex-col items-center gap-0.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-md font-mono text-sm font-bold text-white ${ROLE_STYLES[roleOf(`e${x}`, step.highlight)].bg}`}
                >
                  {p}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {x}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
