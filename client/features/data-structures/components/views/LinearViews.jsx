import { AnimatePresence, motion } from "motion/react";
import { roleOf, ROLE_STYLES } from "./roles";

const spring = { type: "spring", stiffness: 420, damping: 34 };

function Cell({ item, highlight, className = "" }) {
  const role = roleOf(item.id, highlight);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: role === "idle" ? 1 : 1.06 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={spring}
      className={`flex items-center justify-center rounded-lg font-mono text-lg font-bold text-white shadow-md ${ROLE_STYLES[role].bg} ${className}`}
    >
      {item.value}
    </motion.div>
  );
}

const EmptyHint = ({ children }) => (
  <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
    {children}
  </p>
);

/** Vertical stack: the top is drawn at the top. */
export function StackView({ step, capacity }) {
  const { items } = step.state;
  return (
    <div className="flex justify-center py-2">
      <div className="flex w-44 flex-col items-stretch">
        <div className="flex min-h-80 flex-col-reverse gap-1.5 rounded-b-xl border-x-4 border-b-4 border-muted-foreground/30 p-2">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <div key={item.id} className="relative">
                <Cell
                  item={item}
                  highlight={step.highlight}
                  className="h-11 w-full"
                />
                {index === items.length - 1 && (
                  <span className="absolute -right-14 top-1/2 -translate-y-1/2 text-xs font-semibold text-violet-500">
                    ← top
                  </span>
                )}
              </div>
            ))}
          </AnimatePresence>
          {!items.length && <EmptyHint>Empty stack</EmptyHint>}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {items.length} / {capacity} used
        </p>
      </div>
    </div>
  );
}

/** Horizontal queue: front on the left, rear on the right. */
export function QueueView({ step, capacity }) {
  const { items } = step.state;
  return (
    <div className="space-y-2 py-6">
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-max min-w-full items-start justify-center gap-2 border-y-4 border-muted-foreground/30 px-3 py-3">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col items-center gap-1">
                <Cell
                  item={item}
                  highlight={step.highlight}
                  className="h-12 w-12 sm:h-14 sm:w-14"
                />
                <span className="h-4 text-[10px] font-semibold uppercase tracking-wide text-violet-500">
                  {[
                    index === 0 && "front",
                    index === items.length - 1 && "rear",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            ))}
          </AnimatePresence>
          {!items.length && <EmptyHint>Empty queue</EmptyHint>}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        dequeue ← front · rear ← enqueue · {items.length} / {capacity} used
      </p>
    </div>
  );
}

/** Nodes with next-pointers: head → … → null. */
export function LinkedListView({ step }) {
  const { items } = step.state;
  return (
    <div className="flex flex-wrap items-center justify-center gap-y-6 py-8">
      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            transition={spring}
            className="flex items-center"
          >
            <div className="relative flex flex-col items-center">
              {index === 0 && (
                <span className="absolute -top-6 text-[10px] font-semibold uppercase tracking-wide text-violet-500">
                  head
                </span>
              )}
              <div className="flex overflow-hidden rounded-lg shadow-md">
                <Cell
                  item={item}
                  highlight={step.highlight}
                  className="h-12 w-12 rounded-r-none!"
                />
                <span className="flex h-12 w-6 items-center justify-center bg-muted text-xs text-muted-foreground">
                  •
                </span>
              </div>
            </div>
            <span
              className="px-1.5 text-lg text-muted-foreground"
              aria-hidden="true"
            >
              →
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      <span className="rounded-md border border-dashed border-border px-2 py-1 font-mono text-xs text-muted-foreground">
        null
      </span>
    </div>
  );
}
