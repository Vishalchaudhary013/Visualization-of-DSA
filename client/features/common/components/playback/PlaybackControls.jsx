import {
  LuPlay as Play,
  LuPause as Pause,
  LuRotateCcw as RotateCcw,
  LuStepBack as StepBack,
  LuStepForward as StepForward,
  LuSkipForward as SkipForward,
  LuKeyboard as Keyboard,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Slider } from "@/features/common/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/features/common/components/ui/tooltip";
import { SPEED_PRESETS } from "@/features/common/hooks/usePlayback";
import { SHORTCUTS } from "@/features/common/hooks/useKeyboardShortcuts";

function IconButton({ label, shortcut, children, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut && <kbd className="ml-2 text-xs opacity-70">{shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  );
}

export function PlaybackControls({ playback }) {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    isFinished,
    speed,
    setSpeed,
    togglePlay,
    nextStep,
    previousStep,
    reset,
    goToEnd,
    goToStep,
  } = playback;
  const lastStep = Math.max(totalSteps - 1, 0);
  const progress = lastStep ? Math.round((currentStep / lastStep) * 100) : 100;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-center gap-2">
        <IconButton
          label="Reset"
          shortcut="R"
          onClick={reset}
          disabled={currentStep === 0}
        >
          <RotateCcw />
        </IconButton>
        <IconButton
          label="Previous step"
          shortcut="←"
          onClick={previousStep}
          disabled={currentStep === 0}
        >
          <StepBack />
        </IconButton>
        <Button
          size="lg"
          onClick={togglePlay}
          className="w-32 px-0!"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause /> : isFinished ? <RotateCcw /> : <Play />}
          {isPlaying ? "Pause" : isFinished ? "Replay" : "Play"}
        </Button>
        <IconButton
          label="Next step"
          shortcut="→"
          onClick={nextStep}
          disabled={isFinished}
        >
          <StepForward />
        </IconButton>
        <IconButton
          label="Jump to end"
          shortcut="End"
          onClick={goToEnd}
          disabled={isFinished}
        >
          <SkipForward />
        </IconButton>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Step{" "}
            <span className="font-semibold text-foreground">
              {currentStep + 1}
            </span>{" "}
            of {totalSteps}
          </span>
          <span>{progress}%</span>
        </div>
        <Slider
          aria-label="Timeline"
          min={0}
          max={lastStep}
          step={1}
          value={[currentStep]}
          onValueChange={([value]) => goToStep(value)}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Speed</p>
        <div
          className="grid grid-cols-6 gap-1"
          role="group"
          aria-label="Playback speed"
        >
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSpeed(preset)}
              aria-pressed={speed === preset}
              className={`rounded-md py-1 text-xs font-medium transition-colors ${
                speed === preset
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {preset}×
            </button>
          ))}
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Keyboard className="h-3.5 w-3.5" />
            Keyboard shortcuts
          </button>
        </TooltipTrigger>
        <TooltipContent className="p-3">
          <ul className="space-y-1.5">
            {SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.label}
                className="flex items-center justify-between gap-6 text-xs"
              >
                <span>{shortcut.label}</span>
                <span className="flex gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
