import { Button } from "@/features/common/components/ui/button";
import { Slider } from "@/features/common/components/ui/slider";
import {
  LuPlay as Play,
  LuPause as Pause,
  LuRotateCcw as RotateCcw,
  LuStepBack as StepBack,
  LuStepForward as StepForward,
  LuSquare as Square,
} from "react-icons/lu";
export function AlgorithmControls({
  isPlaying,
  isPaused,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStop,
  onNextStep,
  onPreviousStep,
  onReset,
  onSpeedChange,
  onGoToStep,
}) {
  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;
  const MIN_INTERVAL = 300;
  const MAX_INTERVAL = 3000;
  const sliderValue = Math.round(
    ((MAX_INTERVAL - Math.min(Math.max(speed, MIN_INTERVAL), MAX_INTERVAL)) /
      (MAX_INTERVAL - MIN_INTERVAL)) *
      100,
  );
  const handleSliderChange = (value) => {
    const position = value[0];
    const newSpeed = Math.round(
      MAX_INTERVAL - (position / 100) * (MAX_INTERVAL - MIN_INTERVAL),
    );
    onSpeedChange(newSpeed);
  };
  return (
    <div className="w-full space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousStep}
          disabled={currentStep === 0}
          title="Previous Step"
        >
          <StepBack className="w-4 h-4" />
        </Button>
        {isPlaying && !isPaused ? (
          <Button size="lg" onClick={onPause} className="px-6!" title="Pause">
            <Pause className="w-5 h-5 mr-2" />
            Pause
          </Button>
        ) : (
          <Button size="lg" onClick={onPlay} className="px-6!" title="Play">
            <Play className="w-5 h-5 mr-2" />
            Play
          </Button>
        )}
        <Button variant="destructive" size="icon" onClick={onStop} title="Stop">
          <Square className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextStep}
          disabled={currentStep === totalSteps - 1}
          title="Next Step"
        >
          <StepForward className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onReset} title="Reset">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {"Step "}
            {currentStep + 1}
            {" of "}
            {totalSteps}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStep}
          onChange={(e) => onGoToStep(parseInt(e.target.value))}
          className="w-full cursor-pointer"
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label htmlFor="speed" className="font-medium">
            Step Interval
          </label>
          <span className="text-muted-foreground">
            {(speed / 1000).toFixed(2)}s
          </span>
        </div>
        <Slider
          id="speed"
          min={0}
          max={100}
          step={1}
          value={[sliderValue]}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 bg-muted/30 rounded text-center">
          <div className="text-muted-foreground">Status</div>
          <div className="font-semibold">
            {isPlaying && !isPaused
              ? "Playing"
              : isPaused
                ? "Paused"
                : "Stopped"}
          </div>
        </div>
        <div className="p-2 bg-muted/30 rounded text-center">
          <div className="text-muted-foreground">Progress</div>
          <div className="font-semibold">{Math.round(progress)}%</div>
        </div>
        <div className="p-2 bg-muted/30 rounded text-center">
          <div className="text-muted-foreground">Step</div>
          <div className="font-semibold">{currentStep + 1}</div>
        </div>
      </div>
    </div>
  );
}
