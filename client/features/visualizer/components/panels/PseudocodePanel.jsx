/** Pseudocode with the line that the current step executes highlighted. */
export function PseudocodePanel({ code, activeLine }) {
  const lines = code.split("\n");
  return (
    <div className="overflow-x-auto rounded-lg bg-muted/30 py-2 font-mono text-[13px] leading-6">
      {lines.map((line, index) => {
        const isActive = index === activeLine;
        return (
          <div
            key={index}
            aria-current={isActive ? "step" : undefined}
            className={`flex whitespace-pre border-l-4 pr-4 transition-colors duration-200 ${
              isActive
                ? "border-primary bg-primary/15 text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <span className="w-9 shrink-0 select-none pr-3 text-right text-xs leading-6 opacity-50">
              {index + 1}
            </span>
            <span className={isActive ? "font-semibold" : ""}>{line}</span>
          </div>
        );
      })}
    </div>
  );
}
