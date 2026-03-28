"use client";

import { usePlaybackStore } from "@/features/editor/store/playbackStore";

export function RunSummary() {
  const { result, events, currentStep, totalSteps } = usePlaybackStore();

  if (!result || currentStep < 0) return null;

  const isComplete = currentStep >= totalSteps - 1;
  const visitedOrder = events
    .slice(0, currentStep + 1)
    .filter((event) => event.type === "NODE_VISITED")
    .map((event) => String(event.payload.nodeId));

  const statusColor =
    result.status === "success"
      ? "text-emerald-400"
      : result.status === "warning"
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/50 space-y-1">
      {isComplete && (
        <div className={`text-xs font-medium ${statusColor}`}>
          {result.summary}
        </div>
      )}
      <div className="flex gap-3 text-[10px] text-zinc-500">
        <span>{visitedOrder.length} nodes visited so far</span>
        <span>{result.metrics.consideredEdgeCount} edges considered</span>
        <span>{Math.max(0, currentStep + 1)}/{result.metrics.stepCount} steps</span>
      </div>
      {visitedOrder.length > 0 && (
        <div className="text-[10px] text-zinc-300">
          <span className="mr-2 text-zinc-500">Visit order:</span>
          <span className="font-mono">{visitedOrder.join(" -> ")}</span>
        </div>
      )}
      {result.warnings.length > 0 && (
        <div className="text-[10px] text-amber-400/80">
          {result.warnings.map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </div>
      )}
    </div>
  );
}
