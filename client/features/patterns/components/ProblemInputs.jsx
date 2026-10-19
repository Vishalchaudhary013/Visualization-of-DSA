import { useEffect, useState } from "react";
import { LuPlay as Play, LuCircleAlert as CircleAlert } from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Input } from "@/features/common/components/ui/input";
import { formatInput, parseProblemInput } from "../utils/problemInput";

const sameInput = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * One box per LeetCode parameter ("nums = [2,7,11,15]"). The input is checked
 * and applied together when the user presses Visualize (or Enter).
 */
export function ProblemInputs({ problem, input, onRun }) {
  const formatted = formatInput(problem.id, input);
  const formattedKey = JSON.stringify(formatted);
  const [texts, setTexts] = useState(formatted);
  const [errors, setErrors] = useState({});

  // A new problem, example or URL replaces whatever was typed
  useEffect(() => {
    setTexts(JSON.parse(formattedKey));
    setErrors({});
  }, [formattedKey]);

  const run = (event) => {
    event.preventDefault();
    const result = parseProblemInput(problem.id, texts);
    setErrors(result.errors ?? {});
    if (result.input) onRun(result.input);
  };

  return (
    <form className="space-y-4" onSubmit={run} noValidate>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Examples</p>
        <div className="flex flex-wrap gap-1.5">
          {problem.examples.map((example, index) => {
            const active = sameInput(example, input);
            return (
              <button
                key={index}
                type="button"
                onClick={() => onRun(example)}
                aria-pressed={active}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                Example {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Your input</p>
        {problem.fields.map((field) => {
          const error = errors[field.name];
          const id = `field-${field.name}`;
          return (
            <div key={field.name} className="space-y-1">
              <label
                htmlFor={id}
                className="flex items-center gap-2 font-mono text-sm"
              >
                <span className="text-muted-foreground">{field.name} =</span>
              </label>
              <Input
                id={id}
                value={texts[field.name] ?? ""}
                onChange={(event) =>
                  setTexts((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
                spellCheck={false}
                autoComplete="off"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`font-mono text-sm! ${error ? "border-destructive! focus-visible:ring-destructive!" : ""}`}
              />
              {error && (
                <p
                  id={`${id}-error`}
                  className="flex items-start gap-1.5 text-xs text-destructive"
                >
                  <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>
          );
        })}
        {errors._ && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-md bg-destructive/10 p-2 text-xs text-destructive"
          >
            <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
            {errors._}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        <Play />
        Visualize
      </Button>
      <p className="text-xs text-muted-foreground">
        Same format as LeetCode: lists in [ ], text in quotes. You can paste
        “nums = [1,2,3]” too.
      </p>
    </form>
  );
}
