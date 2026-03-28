"use client";

import { usePlaybackStore } from "@/features/editor/store/playbackStore";

export function TimelineScrubber() {
  const { currentStep, totalSteps, setStep } = usePlaybackStore();

  if (totalSteps === 0) return null;

  return (
    <input
      type="range"
      min={0}
      max={totalSteps - 1}
      value={Math.max(0, currentStep)}
      onChange={(e) => setStep(Number(e.target.value))}
      className="w-full h-1 accent-indigo-500 cursor-pointer bg-zinc-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
    />
  );
}
