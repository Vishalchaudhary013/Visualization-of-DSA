import { useState, useCallback, useEffect } from "react";
export function useAlgorithmVisualizer(
  initialSteps = [],
  algorithmInfo = null,
) {
  const [state, setState] = useState({
    isPlaying: false,
    currentStep: 0,
    speed: 1200,
    steps: initialSteps,
    algorithm: algorithmInfo,
    visualizationType: "2d",
    isPaused: false,
  });
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      steps: initialSteps,
      currentStep: 0,
    }));
  }, [initialSteps]);
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      algorithm: algorithmInfo,
    }));
  }, [algorithmInfo]);
  const play = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
    }));
  }, []);
  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: true,
      isPlaying: false,
    }));
  }, []);
  const stop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentStep: 0,
    }));
  }, []);
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.steps.length - 1),
      isPlaying: false,
      isPaused: false,
    }));
  }, []);
  const previousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
      isPlaying: false,
      isPaused: false,
    }));
  }, []);
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 0,
      isPlaying: false,
      isPaused: false,
    }));
  }, []);
  const setSpeed = useCallback((speed) => {
    setState((prev) => ({
      ...prev,
      speed: Math.max(300, Math.min(3000, speed)),
    }));
  }, []);
  const setVisualizationType = useCallback((type) => {
    setState((prev) => ({
      ...prev,
      visualizationType: type,
    }));
  }, []);
  const goToStep = useCallback((stepIndex) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, Math.min(stepIndex, prev.steps.length - 1)),
      isPlaying: false,
      isPaused: false,
    }));
  }, []);
  // Auto-play effect
  useEffect(() => {
    if (!state.isPlaying || state.currentStep >= state.steps.length - 1) {
      return;
    }
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.currentStep < prev.steps.length - 1) {
          return {
            ...prev,
            currentStep: prev.currentStep + 1,
          };
        }
        return { ...prev, isPlaying: false };
      });
    }, state.speed);
    return () => clearInterval(interval);
  }, [state.isPlaying, state.currentStep, state.steps.length, state.speed]);
  const getCurrentStep = useCallback(() => {
    return state.steps[state.currentStep] || null;
  }, [state.steps, state.currentStep]);
  return {
    ...state,
    play,
    pause,
    stop,
    nextStep,
    previousStep,
    reset,
    setSpeed,
    setVisualizationType,
    goToStep,
    getCurrentStep,
    progress:
      state.steps.length > 0
        ? (state.currentStep / (state.steps.length - 1)) * 100
        : 0,
  };
}
