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
  const eventLabel =
    event.type === "NODE_VISITED"
      ? "Visit"
      : event.type === "NODE_DISCOVERED"
        ? "Discover"
        : event.type === "EDGE_CONSIDERED"
          ? "Consider"
          : event.type === "EDGE_RELAXED"
            ? "Accept"
            : event.type === "EDGE_REJECTED"
              ? "Reject"
              : event.type === "NODE_FINALIZED"
                ? "Finalize"
                : event.type === "STACK_UPDATED"
                  ? "Stack"
                  : event.type === "QUEUE_UPDATED"
                    ? "Queue"
                    : "Step";

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-400">
        {eventLabel}
      </span>
      <span className="text-xs text-zinc-300 truncate" title={event.message}>
        {event.message}
      </span>
    </div>
  );
}
