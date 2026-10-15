import { useEffect, useRef } from "react";

const WINDOW = 200;

/** Clickable history of step explanations; the current step stays in view. */
export function StepLog({ steps, currentStep, onSelect }) {
  const listRef = useRef(null);
  const activeRef = useRef(null);

  // Scroll only the list (scrollIntoView would also scroll the page while playing)
  useEffect(() => {
    const list = listRef.current;
    const item = activeRef.current;
    if (!list || !item) return;
    const top = item.offsetTop; // list is position:relative, so this is list-relative
    if (
      top < list.scrollTop ||
      top + item.offsetHeight > list.scrollTop + list.clientHeight
    ) {
      list.scrollTop = top - list.clientHeight / 2;
    }
  }, [currentStep]);

  // Only render a window around the current step: long runs have 1000s of steps
  const start = Math.max(0, currentStep - WINDOW / 2);
  const end = Math.min(steps.length, start + WINDOW);
  const visible = steps.slice(start, end);

  return (
    <ol
      ref={listRef}
      className="relative max-h-80 space-y-1 overflow-y-auto pr-1 text-sm"
      aria-label="Step log"
    >
      {start > 0 && (
        <li className="px-2 text-xs text-muted-foreground">
          … {start} earlier steps
        </li>
      )}
      {visible.map((step, offset) => {
        const index = start + offset;
        const isActive = index === currentStep;
        const isFuture = index > currentStep;
        return (
          <li key={index} ref={isActive ? activeRef : undefined}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={`flex w-full gap-3 rounded-md px-2 py-1.5 text-left transition-colors ${
                isActive
                  ? "bg-primary/10 text-foreground ring-1 ring-primary/40"
                  : isFuture
                    ? "text-muted-foreground/60 hover:bg-muted/50"
                    : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <span className="w-8 shrink-0 font-mono text-xs leading-5 opacity-70">
                {index + 1}
              </span>
              <span className="leading-5">{step.explanation}</span>
            </button>
          </li>
        );
      })}
      {end < steps.length && (
        <li className="px-2 text-xs text-muted-foreground">
          … {steps.length - end} more steps
        </li>
      )}
    </ol>
  );
}
