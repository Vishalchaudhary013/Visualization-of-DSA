import { motion } from "framer-motion";
export function ArrayVisualizer({ step, speed }) {
  if (!step) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">Load an algorithm to start</p>
      </div>
    );
  }
  const array = step.state;
  const comparisons = step.comparisons || [];
  const swaps = step.swaps || [];
  const sorted = step.sorted || [];
  const baseDuration = Math.max(0.2, speed / 1500);
  const valueOccurrences = new Map();
  const getCellColor = (index) => {
    if (sorted.includes(index)) {
      return "bg-green-500"; // Green for sorted
    }
    if (swaps.includes(index)) {
      return "bg-red-500"; // Red for swapped
    }
    if (comparisons.includes(index)) {
      return "bg-yellow-400"; // Yellow for comparison
    }
    return "bg-blue-500"; // Blue default
  };
  const getBorderColor = (index) => {
    if (sorted.includes(index)) {
      return "border-green-600";
    }
    if (swaps.includes(index)) {
      return "border-red-600";
    }
    if (comparisons.includes(index)) {
      return "border-yellow-500";
    }
    return "border-blue-600";
  };
  const getValueKey = (value) => {
    const occurrence = valueOccurrences.get(value) ?? 0;
    valueOccurrences.set(value, occurrence + 1);
    return `${value}-${occurrence}`;
  };
  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-full overflow-x-auto">
        <motion.div
          layout={true}
          className="flex flex-nowrap items-center justify-center gap-3 p-4 bg-muted/10 rounded-lg min-h-[160px]"
        >
          {array.map((value, index) => {
            const itemKey = getValueKey(value);
            const isActive =
              comparisons.includes(index) || swaps.includes(index);
            return (
              <motion.div
                layout={true}
                layoutId={itemKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: swaps.includes(index) ? -12 : 0,
                  scale: isActive ? 1.08 : 1,
                }}
                transition={{
                  layout: {
                    type: "spring",
                    damping: 24,
                    stiffness: 260,
                    duration: baseDuration,
                  },
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: baseDuration,
                }}
                className={`
                  ${getCellColor(index)}
                  ${getBorderColor(index)}
                  border-2
                  rounded-lg
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-white
                  font-semibold
                  text-lg
                  w-16
                  h-16
                  shadow-lg
                  cursor-default
                `}
                key={itemKey}
              >
                <motion.span
                  layout={true}
                  className="text-xl font-bold"
                  transition={{ duration: baseDuration / 2 }}
                >
                  {value}
                </motion.span>
                <span className="text-[10px] tracking-wide uppercase opacity-70">
                  {"idx "}
                  {index}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <div className="flex gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Unsorted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-400" />
          <span>Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Swapping</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Sorted</span>
        </div>
      </div>
      {step.explanation && (
        <div className="w-full p-3 bg-muted/30 rounded-lg text-sm text-foreground/90">
          {step.explanation}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full text-xs">
        <div className="p-2 bg-muted/20 rounded">
          <p className="text-muted-foreground">Comparisons</p>
          <p className="font-semibold text-lg">{step.operations.comparisons}</p>
        </div>
        <div className="p-2 bg-muted/20 rounded">
          <p className="text-muted-foreground">Swaps</p>
          <p className="font-semibold text-lg">{step.operations.swaps}</p>
        </div>
        <div className="p-2 bg-muted/20 rounded">
          <p className="text-muted-foreground">Reads</p>
          <p className="font-semibold text-lg">{step.operations.reads}</p>
        </div>
        <div className="p-2 bg-muted/20 rounded">
          <p className="text-muted-foreground">Writes</p>
          <p className="font-semibold text-lg">{step.operations.writes}</p>
        </div>
      </div>
    </div>
  );
}
