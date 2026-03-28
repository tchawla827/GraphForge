"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { derivePlaybackInsights } from "@/lib/playback/insights";
import { usePlaybackStore } from "@/features/editor/store/playbackStore";

export function PlaybackInsights() {
  const { events, currentStep } = usePlaybackStore();
  const insights = useMemo(
    () => derivePlaybackInsights(events, currentStep),
    [events, currentStep]
  );

  if (currentStep < 0 || events.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 border-t border-zinc-800 bg-zinc-950/80 px-3 py-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
      <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
          <div>
            <div className="text-[11px] font-medium text-zinc-200">
              Live Sequence
            </div>
            <div className="text-[10px] text-zinc-500">
              Step-by-step narration as the run progresses
            </div>
          </div>
          <div className="text-[10px] text-zinc-500">
            {insights.timeline.length} events
          </div>
        </div>

        <div className="max-h-44 space-y-1 overflow-y-auto px-2 py-2">
          {insights.timeline.map((entry) => {
            const isCurrent = entry.stepIndex === currentStep;
            return (
              <div
                key={entry.stepIndex}
                className={cn(
                  "flex items-start gap-2 rounded-md border px-2 py-1.5",
                  isCurrent
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : "border-zinc-800 bg-zinc-950/60"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] tabular-nums",
                    isCurrent
                      ? "bg-indigo-500/20 text-indigo-200"
                      : "bg-zinc-800 text-zinc-400"
                  )}
                >
                  {entry.stepIndex + 1}
                </span>
                <span className="text-[11px] leading-5 text-zinc-200">
                  {entry.message}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-3">
        <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
          <div className="border-b border-zinc-800 px-3 py-2">
            <div className="text-[11px] font-medium text-zinc-200">
              Discovery Order
            </div>
            <div className="text-[10px] text-zinc-500">
              Which node appeared next and where it came from
            </div>
          </div>

          <div className="max-h-32 overflow-y-auto px-3 py-3">
            {insights.discoverySequence.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insights.discoverySequence.map((entry) => (
                  <div
                    key={entry.stepIndex}
                    className={cn(
                      "min-w-[96px] rounded-md border px-2 py-1.5",
                      entry.stepIndex === currentStep
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-zinc-800 bg-zinc-950/60"
                    )}
                  >
                    <div className="text-[10px] text-zinc-500">
                      #{entry.order}
                    </div>
                    <div className="text-xs font-medium text-zinc-100">
                      {entry.label}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {entry.fromLabel
                        ? `${entry.fromLabel} -> ${entry.label}`
                        : "source node"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-zinc-500">
                Discovery steps will appear here once the algorithm starts.
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
          <div className="border-b border-zinc-800 px-3 py-2">
            <div className="text-[11px] font-medium text-zinc-200">
              {insights.structure?.title ?? "Working Structure"}
            </div>
            <div className="text-[10px] text-zinc-500">
              {insights.structure?.eventMessage ??
                "Queue, stack, or priority queue snapshots appear here."}
            </div>
          </div>

          <div className="px-3 py-3">
            {insights.structure ? (
              <StructureVisualizer
                kind={insights.structure.kind}
                items={insights.structure.items}
              />
            ) : (
              <div className="text-[11px] text-zinc-500">
                This run has not emitted a queue or stack update yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StructureVisualizer({
  kind,
  items,
}: {
  kind: "queue" | "stack" | "priorityQueue";
  items: { id: string; label: string }[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-700 px-3 py-4 text-center text-[11px] text-zinc-500">
        Structure is empty.
      </div>
    );
  }

  if (kind === "stack") {
    const stackItems = [...items].reverse();

    return (
      <div className="space-y-1">
        {stackItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={cn(
              "rounded-md border px-3 py-2 text-xs",
              index === 0
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-100"
                : "border-zinc-800 bg-zinc-950/60 text-zinc-200"
            )}
          >
            <div className="text-[10px] text-zinc-500">
              {index === 0 ? "Top" : `Level ${stackItems.length - index}`}
            </div>
            <div>{item.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className={cn(
            "min-w-[88px] rounded-md border px-3 py-2 text-xs",
            index === 0
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-100"
              : "border-zinc-800 bg-zinc-950/60 text-zinc-200"
          )}
        >
          <div className="text-[10px] text-zinc-500">
            {kind === "queue"
              ? index === 0
                ? "Front"
                : "Waiting"
              : index === 0
                ? "Next"
                : "Pending"}
          </div>
          <div>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
