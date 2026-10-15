import { useEffect } from "react";

export const SHORTCUTS = [
  { keys: ["Space"], label: "Play / pause" },
  { keys: ["←", "→"], label: "Previous / next step" },
  { keys: ["Home", "End"], label: "First / last step" },
  { keys: ["R"], label: "Reset" },
  { keys: ["-", "+"], label: "Slower / faster" },
];

const isTyping = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
    target.getAttribute("role") === "combobox" ||
    target.getAttribute("role") === "slider");

/** Global playback shortcuts; ignored while the user types in a field. */
export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;
      const action = {
        " ": handlers.togglePlay,
        ArrowRight: handlers.nextStep,
        ArrowLeft: handlers.previousStep,
        Home: handlers.reset,
        End: handlers.goToEnd,
        r: handlers.reset,
        R: handlers.reset,
        "+": handlers.faster,
        "=": handlers.faster,
        "-": handlers.slower,
      }[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
