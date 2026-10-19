// Static metadata for the interactive data structures, shared by the client
// (data structures pages, home catalog) and the server (assistant).
// Each operation's `pseudoCode` lines are referenced by index from the engines
// in client/features/data-structures/engines, so keep them in sync.
export const DATA_STRUCTURES = {
  stack: {
    id: "stack",
    name: "Stack",
    description:
      "A last-in, first-out (LIFO) collection: you can only add or remove at the top, like a pile of plates.",
    category: "data-structure",
    difficulty: "beginner",
    capacity: 10,
    tags: ["LIFO", "linear"],
    operations: {
      push: {
        label: "Push",
        needsValue: true,
        complexity: "O(1)",
        pseudoCode: `push(x)
  if size == capacity: overflow
  top = top + 1
  stack[top] = x`,
      },
      pop: {
        label: "Pop",
        complexity: "O(1)",
        pseudoCode: `pop()
  if size == 0: underflow
  x = stack[top]
  top = top - 1
  return x`,
      },
      peek: {
        label: "Peek",
        complexity: "O(1)",
        pseudoCode: `peek()
  if size == 0: error, stack is empty
  return stack[top]`,
      },
    },
    howItWorks: [
      "Items are stacked on top of each other.",
      "Push puts a new item on the top.",
      "Pop removes the item on the top: the last one that was pushed.",
      "Peek looks at the top item without removing it.",
    ],
    useCases: [
      "Undo / redo in editors",
      "Function call stack and recursion",
      "Checking balanced brackets",
      "Depth-first search",
    ],
  },
  queue: {
    id: "queue",
    name: "Queue",
    description:
      "A first-in, first-out (FIFO) collection: items join at the rear and leave from the front, like a line at a ticket counter.",
    category: "data-structure",
    difficulty: "beginner",
    capacity: 10,
    tags: ["FIFO", "linear"],
    operations: {
      enqueue: {
        label: "Enqueue",
        needsValue: true,
        complexity: "O(1)",
        pseudoCode: `enqueue(x)
  if size == capacity: overflow
  rear = rear + 1
  queue[rear] = x`,
      },
      dequeue: {
        label: "Dequeue",
        complexity: "O(1)",
        pseudoCode: `dequeue()
  if size == 0: underflow
  x = queue[front]
  front = front + 1
  return x`,
      },
      peek: {
        label: "Peek",
        complexity: "O(1)",
        pseudoCode: `peek()
  if size == 0: error, queue is empty
  return queue[front]`,
      },
    },
    howItWorks: [
      "New items join at the rear.",
      "Dequeue removes the item at the front: the one that has waited longest.",
      "Peek looks at the front item without removing it.",
    ],
    useCases: [
      "Task scheduling and print queues",
      "Breadth-first search",
      "Buffers for streaming data",
    ],
  },
  heap: {
    id: "heap",
    name: "Binary Heap",
    description:
      "A complete binary tree stored in an array where every parent is smaller (min-heap) or larger (max-heap) than its children.",
    category: "data-structure",
    difficulty: "intermediate",
    capacity: 15,
    tags: ["priority queue", "tree", "array"],
    operations: {
      insert: {
        label: "Insert",
        needsValue: true,
        complexity: "O(log n)",
        pseudoCode: `insert(x)
  heap.append(x); i = last index
  while i > 0
    p = (i - 1) / 2
    if heap[i] beats heap[p]: swap, i = p
    else: stop, heap property holds`,
      },
      extract: {
        label: "Extract top",
        complexity: "O(log n)",
        pseudoCode: `extractTop()
  if heap is empty: error
  top = heap[0]
  heap[0] = heap.pop()
  i = 0; while i has a child
    c = child of i that beats the other
    if heap[c] beats heap[i]: swap, i = c
    else: stop, heap property holds
  return top`,
      },
      peek: {
        label: "Peek",
        complexity: "O(1)",
        pseudoCode: `peek()
  if heap is empty: error
  return heap[0]`,
      },
    },
    howItWorks: [
      "The tree is stored level by level in an array: the children of index i are 2i+1 and 2i+2, its parent is (i-1)/2.",
      "Heap property: in a min-heap every parent is ≤ its children (≥ in a max-heap), so the top is always at index 0.",
      "Insert adds the value at the end, then sifts it up while it beats its parent.",
      "Extract removes the top, moves the last value to the root, then sifts it down while a child beats it.",
    ],
    useCases: [
      "Priority queues (task schedulers, Dijkstra's algorithm)",
      "Heap sort",
      "Top-k / k-th smallest problems",
      "Merging k sorted lists",
    ],
  },
  "linked-list": {
    id: "linked-list",
    name: "Linked List",
    description:
      "A chain of nodes where each node stores a value and a pointer to the next node. Easy to insert at the front, slower to search.",
    category: "data-structure",
    difficulty: "beginner",
    capacity: 10,
    tags: ["nodes", "pointers", "linear"],
    operations: {
      insertHead: {
        label: "Insert at head",
        needsValue: true,
        complexity: "O(1)",
        pseudoCode: `insertHead(x)
  node = new Node(x)
  node.next = head
  head = node`,
      },
      insertTail: {
        label: "Insert at tail",
        needsValue: true,
        complexity: "O(n)",
        pseudoCode: `insertTail(x)
  node = new Node(x)
  if head is null: head = node; return
  cur = head
  while cur.next != null: cur = cur.next
  cur.next = node`,
      },
      search: {
        label: "Search",
        needsValue: true,
        complexity: "O(n)",
        pseudoCode: `search(x)
  cur = head; i = 0
  while cur != null
    if cur.value == x: return i
    cur = cur.next; i = i + 1
  return -1`,
      },
      remove: {
        label: "Delete",
        needsValue: true,
        complexity: "O(n)",
        pseudoCode: `delete(x)
  if head.value == x: head = head.next; return
  prev = head
  while prev.next != null and prev.next.value != x
    prev = prev.next
  if prev.next != null: prev.next = prev.next.next
  else: x is not in the list`,
      },
    },
    howItWorks: [
      "Each node holds a value and a pointer to the next node; the last node points to null.",
      "The list only remembers the head (first node).",
      "Inserting at the head just rewires one pointer, so it is O(1).",
      "Searching, deleting or reaching the tail means walking node by node from the head: O(n).",
    ],
    useCases: [
      "Implementing stacks and queues",
      "Undo history, music playlists",
      "Hash table buckets (chaining)",
      "LRU caches (with a doubly linked list)",
    ],
  },
  bst: {
    id: "bst",
    name: "Binary Search Tree",
    description:
      "A binary tree where every value in a node's left subtree is smaller and every value in its right subtree is larger.",
    category: "data-structure",
    difficulty: "intermediate",
    capacity: 15,
    tags: ["tree", "ordered", "recursive"],
    operations: {
      insert: {
        label: "Insert",
        needsValue: true,
        complexity: "O(h)",
        pseudoCode: `insert(x)
  if root is null: root = Node(x); return
  cur = root
  loop: if x < cur.value
    if cur.left is null: cur.left = Node(x); return
    cur = cur.left
  else if x > cur.value
    if cur.right is null: cur.right = Node(x); return
    cur = cur.right
  else: x is already in the tree, ignore`,
      },
      search: {
        label: "Search",
        needsValue: true,
        complexity: "O(h)",
        pseudoCode: `search(x)
  cur = root
  while cur != null
    if x == cur.value: found
    cur = x < cur.value ? cur.left : cur.right
  not found`,
      },
      remove: {
        label: "Delete",
        needsValue: true,
        complexity: "O(h)",
        pseudoCode: `delete(x)
  find the node holding x
  if it has no children: remove it
  if it has one child: replace it with that child
  else: s = smallest value in its right subtree
    copy s into the node, delete the old s`,
      },
      inorder: {
        label: "In-order",
        complexity: "O(n)",
        pseudoCode: `inorder(node)
  if node is null: return
  inorder(node.left)
  visit(node)
  inorder(node.right)`,
      },
      preorder: {
        label: "Pre-order",
        complexity: "O(n)",
        pseudoCode: `preorder(node)
  if node is null: return
  visit(node)
  preorder(node.left)
  preorder(node.right)`,
      },
      postorder: {
        label: "Post-order",
        complexity: "O(n)",
        pseudoCode: `postorder(node)
  if node is null: return
  postorder(node.left)
  postorder(node.right)
  visit(node)`,
      },
    },
    howItWorks: [
      "Smaller values go left, larger values go right, at every node.",
      "Searching compares with the current node and goes left or right, skipping half of a balanced tree each time.",
      "Operations take O(h) where h is the height: O(log n) when balanced, O(n) when values arrive sorted.",
      "An in-order traversal visits the values in sorted order.",
    ],
    useCases: [
      "Ordered sets and maps",
      "Range queries (all values between a and b)",
      "Foundation for balanced trees (AVL, red-black)",
    ],
  },
  "hash-table": {
    id: "hash-table",
    name: "Hash Table",
    description:
      "Stores values in buckets chosen by a hash function, so lookups jump straight to the right bucket instead of scanning everything.",
    category: "data-structure",
    difficulty: "intermediate",
    capacity: 21,
    buckets: 7,
    tags: ["hashing", "separate chaining", "O(1) average"],
    operations: {
      insert: {
        label: "Insert",
        needsValue: true,
        complexity: "O(1) avg",
        pseudoCode: `insert(x)
  i = hash(x) = x mod m
  for each item in bucket[i]
    if item == x: already stored, stop
  append x to bucket[i]`,
      },
      search: {
        label: "Search",
        needsValue: true,
        complexity: "O(1) avg",
        pseudoCode: `search(x)
  i = hash(x) = x mod m
  for each item in bucket[i]
    if item == x: found
  not found`,
      },
      remove: {
        label: "Delete",
        needsValue: true,
        complexity: "O(1) avg",
        pseudoCode: `delete(x)
  i = hash(x) = x mod m
  for each item in bucket[i]
    if item == x: unlink it from the chain, stop
  not found`,
      },
    },
    howItWorks: [
      "A hash function turns a value into a bucket number; here hash(x) = x mod 7.",
      "Insert, search and delete only look inside that one bucket.",
      "Two values can land in the same bucket (a collision); each bucket keeps a small chain (list) of them.",
      "With a good hash and a low load factor (items ÷ buckets), chains stay short, so operations are O(1) on average. Real tables grow and rehash when the load factor gets high.",
    ],
    useCases: [
      "Dictionaries / maps and sets in every language",
      "Caches and memoization",
      "Counting frequencies, finding duplicates",
      "Database indexes",
    ],
  },
  trie: {
    id: "trie",
    name: "Tree",
    description:
      "A tree of letters where each path from the root spells a word, so words that share a prefix share nodes.",
    category: "data-structure",
    difficulty: "intermediate",
    capacity: 40,
    valueKind: "word",
    tags: ["prefix tree", "strings", "autocomplete"],
    operations: {
      insert: {
        label: "Insert",
        needsValue: true,
        complexity: "O(L)",
        pseudoCode: `insert(word)
  node = root
  for each letter c in word
    if node has no child c: create it
    node = node.children[c]
  node.isEnd = true`,
      },
      search: {
        label: "Search",
        needsValue: true,
        complexity: "O(L)",
        pseudoCode: `search(word)
  node = root
  for each letter c in word
    if node has no child c: not found
    node = node.children[c]
  found only if node.isEnd`,
      },
      startsWith: {
        label: "Prefix search",
        needsValue: true,
        complexity: "O(L + k)",
        pseudoCode: `startsWith(prefix)
  node = root
  for each letter c in prefix
    if node has no child c: no word has this prefix
    node = node.children[c]
  collect every word below node`,
      },
      remove: {
        label: "Delete",
        needsValue: true,
        complexity: "O(L)",
        pseudoCode: `delete(word)
  walk to the node for word; stop if missing or not a word end
  node.isEnd = false
  while node has no children, is not a word end and is not root
    remove node from its parent; node = parent`,
      },
    },
    howItWorks: [
      "The root is empty; every edge below it adds one letter.",
      "Words that start the same way share the same path, so 'car', 'card' and 'care' share c → a → r.",
      "Nodes where a word ends are marked (✓): 'car' is a word, 'ca' is only a prefix.",
      "Every operation walks one letter at a time, so it costs O(L) for a word of length L, no matter how many words are stored.",
    ],
    useCases: [
      "Autocomplete and search suggestions",
      "Spell checkers",
      "Prefix matching (IP routing, phone directories)",
      "Word games (Boggle, Scrabble solvers)",
    ],
  },
  "union-find": {
    id: "union-find",
    name: "Union-Find",
    description:
      "Keeps track of which elements are in the same group (disjoint sets) and can merge groups or answer 'are these connected?' almost instantly.",
    category: "data-structure",
    difficulty: "advanced",
    capacity: 12,
    tags: ["disjoint set", "forest", "path compression"],
    operations: {
      union: {
        label: "Union",
        needsValue: true,
        arity: 2,
        complexity: "≈ O(1)",
        pseudoCode: `union(a, b)
  ra = find(a); rb = find(b)
  if ra == rb: already in the same set
  attach the smaller tree's root under the larger one
  size[larger] = size[larger] + size[smaller]`,
      },
      find: {
        label: "Find",
        needsValue: true,
        complexity: "≈ O(1)",
        pseudoCode: `find(x)
  while parent[x] != x
    parent[x] = parent[parent[x]]   // path halving
    x = parent[x]
  return x`,
      },
      connected: {
        label: "Connected?",
        needsValue: true,
        arity: 2,
        complexity: "≈ O(1)",
        pseudoCode: `connected(a, b)
  return find(a) == find(b)`,
      },
      add: {
        label: "Add element",
        complexity: "O(1)",
        pseudoCode: `add()
  x = n; parent[x] = x; n = n + 1`,
      },
    },
    howItWorks: [
      "Each group is a tree; the root is the group's representative. parent[x] points one step up.",
      "find(x) follows parents to the root. Path halving re-points nodes to their grandparent on the way, so later finds are faster.",
      "union(a, b) finds both roots and hangs the smaller tree under the larger one, which keeps trees shallow.",
      "With both tricks, each operation is effectively constant time (inverse Ackermann).",
    ],
    useCases: [
      "Kruskal's minimum spanning tree (cycle check)",
      "Connected components in networks",
      "Grouping friends, pixels or accounts",
      "Detecting cycles in undirected graphs",
    ],
  },
};
