import { useState } from "react";
import { toast } from "sonner";
import { LuCopy as Copy, LuLightbulb as Lightbulb } from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/common/components/ui/select";
import { PseudocodePanel } from "@/features/common/components/playback/PseudocodePanel";
import { LANGUAGES, solutionIn } from "@shared/solutions";

const STORAGE_KEY = "dsa-code-language";

// The chosen language is remembered per browser; storage can be unavailable
function readLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some(({ id }) => id === saved) ? saved : "javascript";
  } catch {
    return "javascript";
  }
}

/** The problem's solution in the chosen language, with the running line highlighted. */
export function SolutionPanel({ problem, line }) {
  const [language, setLanguage] = useState(readLanguage);
  const { code, lineOf } = solutionIn(problem, language);
  const activeLine = lineOf(line);

  const changeLanguage = (next) => {
    setLanguage(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered, but the switch still works
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied");
    } catch {
      toast.error("Couldn't copy the code");
    }
  };

  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Solution
        </h3>
        <div className="flex items-center gap-2">
          {activeLine != null && (
            <span className="whitespace-nowrap font-mono text-xs text-primary">
              line {activeLine + 1}
            </span>
          )}
          <Select value={language} onValueChange={changeLanguage}>
            <SelectTrigger
              aria-label="Programming language"
              className="h-8 w-32 text-xs!"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(({ id, name }) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={copy}
            aria-label="Copy code"
          >
            <Copy />
          </Button>
        </div>
      </div>
      <PseudocodePanel code={code} activeLine={activeLine} />
      <p className="mt-4 flex gap-2 rounded-lg bg-amber-500/10 p-3 text-sm">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        {problem.idea}
      </p>
    </section>
  );
}
