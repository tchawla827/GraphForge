"use client";

import { useUiStore } from "@/features/editor/store/uiStore";

const legendItems = [
  { key: "discovered", label: "Discovered" },
  { key: "visited", label: "Visited" },
  { key: "finalized", label: "Finalized" },
  { key: "considered", label: "Edge considered" },
  { key: "relaxed", label: "Edge accepted" },
  { key: "rejected", label: "Edge rejected" },
  { key: "path", label: "Path / cycle" },
] as const;

export function PlaybackLegend() {
  const playbackColors = useUiStore((state) => state.playbackColors);

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-t border-zinc-800 bg-zinc-950/80">
      <span className="text-[10px] text-zinc-500">Legend</span>
      {legendItems.map(({ key, label }) => (
        <div
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1"
        >
          <span
            className="h-2.5 w-2.5 rounded-full border border-white/10"
            style={{ backgroundColor: playbackColors[key] }}
            aria-hidden="true"
          />
          <span className="text-[10px] text-zinc-300">{label}</span>
        </div>
      ))}
    </div>
  );
}
