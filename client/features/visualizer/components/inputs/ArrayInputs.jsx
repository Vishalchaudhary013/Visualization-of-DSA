import { useEffect, useState } from "react";
import {
  LuShuffle as Shuffle,
  LuCheck as Check,
  LuCircleAlert as CircleAlert,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Input } from "@/features/common/components/ui/input";
import { Label } from "@/features/common/components/ui/label";
import { Slider } from "@/features/common/components/ui/slider";
import { ARRAY_LIMITS, ARRAY_PRESETS, parseArray } from "../../utils/inputs";

export function ArrayInputs({
  array,
  onArrayChange,
  isSearch,
  needsSortedInput,
  target,
  onTargetChange,
}) {
  const [preset, setPreset] = useState("random");
  const [text, setText] = useState(array.join(", "));
  const [error, setError] = useState(null);

  // Keep the text box in sync when the array changes from elsewhere
  useEffect(() => {
    setText(array.join(", "));
    setError(null);
  }, [array]);

  const build = (presetKey, size = array.length) => {
    setPreset(presetKey);
    onArrayChange(ARRAY_PRESETS[presetKey].build(size));
  };

  const applyText = () => {
    const { values, error: parseError } = parseArray(text);
    if (parseError) {
      setError(parseError);
      return;
    }
    setError(null);
    onArrayChange(values);
  };

  const pickTarget = (present) => {
    if (present) {
      onTargetChange(array[Math.floor(Math.random() * array.length)]);
      return;
    }
    const missing = Array.from({ length: 99 }, (_, i) => i + 1).filter(
      (value) => !array.includes(value),
    );
    if (missing.length) {
      onTargetChange(missing[Math.floor(Math.random() * missing.length)]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Size</Label>
          <span className="text-sm font-semibold tabular-nums">
            {array.length}
          </span>
        </div>
        <Slider
          aria-label="Array size"
          min={ARRAY_LIMITS.minSize}
          max={ARRAY_LIMITS.maxSize}
          step={1}
          value={[array.length]}
          onValueChange={([size]) => build(preset, size)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Input shape</Label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ARRAY_PRESETS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => build(key)}
              aria-pressed={preset === key}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                preset === key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => build(preset)}
        >
          <Shuffle />
          New {ARRAY_PRESETS[preset].label.toLowerCase()} array
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-array" className="text-sm">
          Your own values
        </Label>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyText();
          }}
        >
          <Input
            id="custom-array"
            placeholder="e.g. 5, 2, 8, 1, 9"
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "custom-array-error" : undefined}
            className={`font-mono text-sm! ${error ? "border-destructive! focus-visible:ring-destructive!" : ""}`}
          />
          <Button
            type="submit"
            size="icon"
            variant="secondary"
            aria-label="Apply values"
          >
            <Check />
          </Button>
        </form>
        {error ? (
          <p
            id="custom-array-error"
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <CircleAlert className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Comma or space separated, press Enter to apply.
            {needsSortedInput &&
              " Values are sorted automatically for binary search."}
          </p>
        )}
      </div>

      {isSearch && (
        <div className="space-y-2">
          <Label htmlFor="search-target" className="text-sm">
            Target value
          </Label>
          <Input
            id="search-target"
            type="number"
            value={Number.isFinite(target) ? target : ""}
            onChange={(event) => {
              const value = parseInt(event.target.value, 10);
              if (!Number.isNaN(value)) onTargetChange(value);
            }}
            className="font-mono text-sm!"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pickTarget(true)}
            >
              Pick from array
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pickTarget(false)}
            >
              Pick missing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
