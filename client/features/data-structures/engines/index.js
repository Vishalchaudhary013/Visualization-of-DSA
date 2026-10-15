import { stack, queue } from "./linear.js";
import { heap } from "./heap.js";
import { linkedList } from "./linkedList.js";
import { bst } from "./bst.js";

/** Data structure id (shared/dataStructures.js) -> engine. */
export const ENGINES = {
  stack,
  queue,
  heap,
  "linked-list": linkedList,
  bst,
};
