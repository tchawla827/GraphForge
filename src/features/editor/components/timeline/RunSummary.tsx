"use client";

import { usePlaybackStore } from "@/features/editor/store/playbackStore";

export function RunSummary() {
  const { result, currentStep, totalSteps } = usePlaybackStore();

  // Show only when at the last step (RUN_COMPLETED)
  if (!result || currentStep < totalSteps - 1) return null;

  const statusColor =
    result.status === "success"
      ? "text-emerald-400"
      : result.status === "warning"
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/50 space-y-1">
      <div className={`text-xs font-medium ${statusColor}`}>
        {result.summary}
      </div>
      <div className="flex gap-3 text-[10px] text-zinc-500">
        <span>{result.metrics.visitedNodeCount} nodes visited</span>
        <span>{result.metrics.consideredEdgeCount} edges considered</span>
        <span>{result.metrics.stepCount} steps</span>
      </div>
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
