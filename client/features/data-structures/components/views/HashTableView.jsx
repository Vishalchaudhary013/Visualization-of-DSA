import { AnimatePresence, motion } from "motion/react";
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { roleOf, ROLE_STYLES } from "./roles";

const { buckets: BUCKETS } = DATA_STRUCTURES["hash-table"];
const spring = { type: "spring", stiffness: 420, damping: 34 };

/** Buckets as rows: index, then the chain of values stored there. */
export function HashTableView({ step }) {
  const { buckets } = step.state;
  const total = buckets.reduce((sum, chain) => sum + chain.length, 0);

  return (
    <div className="space-y-3">
      <ol className="space-y-1.5" aria-label="Buckets">
        {buckets.map((chain, index) => {
          const bucketActive = step.highlight.active.includes(
            `bucket-${index}`,
          );
          return (
            <li key={index} className="flex min-h-11 items-center gap-2">
              <span
                className={`flex h-10 w-14 shrink-0 items-center justify-center rounded-md border-2 font-mono text-sm font-semibold transition-colors ${
                  bucketActive
                    ? "border-violet-500 bg-violet-500/15 text-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                [{index}]
              </span>
              <div className="flex min-w-0 flex-wrap items-center gap-y-1.5">
                <AnimatePresence initial={false}>
                  {chain.map((item) => (
                    <motion.span
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={spring}
                      className="flex items-center"
                    >
                      <span
                        className="px-1 text-muted-foreground"
                        aria-hidden="true"
                      >
                        →
                      </span>
                      <span
                        className={`flex h-10 min-w-10 items-center justify-center rounded-md px-2 font-mono font-bold text-white shadow-sm ${ROLE_STYLES[roleOf(item.id, step.highlight)].bg}`}
                      >
                        {item.value}
                      </span>
                    </motion.span>
                  ))}
                </AnimatePresence>
                {!chain.length && (
                  <span className="pl-1 text-xs text-muted-foreground">
                    empty
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="text-center text-xs text-muted-foreground">
        hash(x) = x mod {BUCKETS} · {total} {total === 1 ? "value" : "values"}{" "}
        in {BUCKETS} buckets · load factor {(total / BUCKETS).toFixed(2)}
      </p>
    </div>
  );
}
