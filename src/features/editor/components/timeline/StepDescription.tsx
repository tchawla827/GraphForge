"use client";

import { usePlaybackStore } from "@/features/editor/store/playbackStore";

export function StepDescription() {
  const { events, currentStep } = usePlaybackStore();

  if (currentStep < 0 || currentStep >= events.length) {
    return (
      <span className="text-xs text-zinc-500">
        Press play or step forward to begin
      </span>
    );
  }

  const event = events[currentStep];

  return (
    <span className="text-xs text-zinc-300 truncate" title={event.message}>
      {event.message}
    </span>
  );
}
