import { useState } from "react";
import { motion } from "motion/react";
import {
  LuChartColumn as BarChart,
  LuLayoutGrid as Grid,
} from "react-icons/lu";

const BOX_MODE_MAX = 16;

const COLORS = {
  default: { fill: "bg-sky-500", legend: "Unsorted" },
  compare: { fill: "bg-amber-400", legend: "Comparing" },
  swap: { fill: "bg-rose-500", legend: "Swapping / writing" },
  found: { fill: "bg-emerald-500", legend: "Found" },
  sorted: { fill: "bg-emerald-500", legend: "Sorted" },
  marker: { fill: "bg-violet-500" },
};

function getRole(index, step, isSearch) {
  if (step.sorted.includes(index)) return isSearch ? "found" : "sorted";
  if (step.swaps.includes(index)) return "swap";
  if (step.comparisons.includes(index)) return "compare";
  if (step.marker === index) return "marker";
  return "default";
}

function isOutsideRange(index, step) {
  if (!step.range) return false;
  return index < step.range[0] || index > step.range[1];
}

// Stable keys per value occurrence let motion animate values moving
function buildKeys(values) {
  const seen = new Map();
  return values.map((value) => {
    const count = seen.get(value) ?? 0;
    seen.set(value, count + 1);
    return `${value}-${count}`;
  });
}

export function ArrayVisualizer({ step, speed, markerLabel, isSearch }) {
  const [mode, setMode] = useState("auto");
  if (!step) return null;

  const values = step.state;
  const keys = buildKeys(values);
  const resolvedMode =
    mode === "auto" ? (values.length <= BOX_MODE_MAX ? "boxes" : "bars") : mode;
  const maxValue = Math.max(...values, 1);
  const duration = Math.min(0.4, 0.5 / speed);
  const transition = { type: "spring", stiffness: 380, damping: 32, duration };
  const showValues = values.length <= 30;

  const legend = [
    COLORS.default,
    COLORS.compare,
    isSearch ? COLORS.found : COLORS.swap,
    ...(isSearch ? [] : [COLORS.sorted]),
    ...(markerLabel ? [{ fill: COLORS.marker.fill, legend: markerLabel }] : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {legend.map((item) => (
            <li key={item.legend} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${item.fill}`} />
              {item.legend}
            </li>
          ))}
          {step.range && (
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-500 opacity-25" />
              Outside active range
            </li>
          )}
        </ul>
        <div
          className="flex rounded-md border border-border p-0.5"
          role="group"
          aria-label="View"
        >
          {[
            { key: "boxes", icon: Grid, label: "Boxes" },
            { key: "bars", icon: BarChart, label: "Bars" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              aria-pressed={resolvedMode === key}
              aria-label={`${label} view`}
              title={`${label} view`}
              className={`rounded px-2 py-1 transition-colors ${
                resolvedMode === key
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {resolvedMode === "boxes" ? (
        <div className="overflow-x-auto pb-2">
          <div className="mx-auto flex w-max items-start gap-2 px-1 pt-4">
            {values.map((value, index) => {
              const role = getRole(index, step, isSearch);
              const active = role === "compare" || role === "swap";
              return (
                <motion.div
                  key={keys[index]}
                  layout
                  transition={transition}
                  className={`flex flex-col items-center gap-1 transition-opacity ${isOutsideRange(index, step) ? "opacity-25" : ""}`}
                >
                  <motion.div
                    animate={{
                      y: role === "swap" ? -10 : 0,
                      scale: active ? 1.08 : 1,
                    }}
                    transition={transition}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg font-mono text-lg font-bold text-white shadow-md sm:h-14 sm:w-14 ${COLORS[role].fill}`}
                  >
                    {value}
                  </motion.div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {index}
                  </span>
                  <PointerLabel
                    index={index}
                    step={step}
                    markerLabel={markerLabel}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-end gap-[2px] sm:gap-1">
          {values.map((value, index) => {
            const role = getRole(index, step, isSearch);
            return (
              <motion.div
                key={keys[index]}
                layout
                transition={transition}
                className={`relative flex min-w-0 flex-1 flex-col items-center justify-end h-full transition-opacity ${isOutsideRange(index, step) ? "opacity-25" : ""}`}
              >
                {showValues && (
                  <span className="mb-1 font-mono text-[10px] text-muted-foreground">
                    {value}
                  </span>
                )}
                <div
                  className={`w-full rounded-t-sm transition-colors ${COLORS[role].fill}`}
                  style={{ height: `${Math.max((value / maxValue) * 88, 2)}%` }}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Small labels under boxes: the marker (pivot / mid / key) and range ends (L / R)
function PointerLabel({ index, step, markerLabel }) {
  const labels = [];
  if (markerLabel && step.marker === index)
    labels.push(markerLabel.toLowerCase());
  if (step.range && step.range[0] !== step.range[1]) {
    if (step.range[0] === index) labels.push("L");
    if (step.range[1] === index) labels.push("R");
  }
  return (
    <span className="h-4 text-[10px] font-semibold uppercase tracking-wide text-violet-500">
      {labels.join(" · ")}
    </span>
  );
}
