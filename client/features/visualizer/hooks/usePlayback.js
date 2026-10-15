import { useState, useCallback, useEffect } from "react";

// Speed is expressed as a multiplier of BASE_INTERVAL ms per step.
export const BASE_INTERVAL = 800;
export const SPEED_PRESETS = [0.25, 0.5, 1, 2, 4, 8];

/** Steps through a list of recorded algorithm steps with play/pause/seek. */
export function usePlayback(steps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const lastStep = Math.max(steps.length - 1, 0);

  // New input or algorithm: rewind
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (currentStep >= lastStep) {
      setIsPlaying(false);
      return undefined;
    }
    const timer = setTimeout(
      () => setCurrentStep((step) => Math.min(step + 1, lastStep)),
      BASE_INTERVAL / speed,
    );
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, lastStep, speed]);

  const play = useCallback(() => {
    // Pressing play at the end starts over
    setCurrentStep((step) => (step >= lastStep ? 0 : step));
    setIsPlaying(true);
  }, [lastStep]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const goToStep = useCallback(
    (index) => {
      setIsPlaying(false);
      setCurrentStep(Math.max(0, Math.min(index, lastStep)));
    },
    [lastStep],
  );

  const nextStep = useCallback(
    () => goToStep(currentStep + 1),
    [goToStep, currentStep],
  );
  const previousStep = useCallback(
    () => goToStep(currentStep - 1),
    [goToStep, currentStep],
  );
  const reset = useCallback(() => goToStep(0), [goToStep]);
  const goToEnd = useCallback(() => goToStep(lastStep), [goToStep, lastStep]);

  return {
    steps,
    step: steps[currentStep] ?? null,
    currentStep,
    totalSteps: steps.length,
    isPlaying,
    isFinished: currentStep >= lastStep,
    speed,
    setSpeed,
    play,
    pause,
    togglePlay,
    nextStep,
    previousStep,
    reset,
    goToEnd,
    goToStep,
  };
}
