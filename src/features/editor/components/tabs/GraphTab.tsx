"use client";

import { useGraphStore } from "@/features/editor/store/graphStore";
import {
  defaultPlaybackColors,
  useUiStore,
  type PlaybackColorKey,
} from "@/features/editor/store/uiStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-zinc-300 text-sm cursor-pointer" onClick={() => onChange(!checked)}>
        {label}
      </Label>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950",
          checked ? "bg-indigo-600" : "bg-zinc-700"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

const playbackColorFields: Array<{ key: PlaybackColorKey; label: string }> = [
  { key: "discovered", label: "Discovered node" },
  { key: "visited", label: "Visited node" },
  { key: "finalized", label: "Finalized node" },
  { key: "path", label: "Path / cycle" },
  { key: "considered", label: "Considered edge" },
  { key: "relaxed", label: "Accepted edge" },
  { key: "rejected", label: "Rejected edge" },
];

export function GraphTab() {
  const { graph, updateConfig } = useGraphStore();
  const {
    showEdgeLabels,
    showEdgeWeights,
    playbackColors,
    setShowEdgeLabels,
    setShowEdgeWeights,
    setPlaybackColor,
    resetPlaybackColors,
  } = useUiStore();
  if (!graph) return null;

  const { config } = graph;

  return (
    <div className="px-4 py-3 flex flex-col divide-y divide-zinc-800">
      <Toggle
        label="Directed"
        checked={config.directed}
        onChange={(v) => updateConfig({ directed: v })}
      />
      <Toggle
        label="Weighted"
        checked={config.weighted}
        onChange={(v) => updateConfig({ weighted: v })}
      />
      <Toggle
        label="Allow self-loops"
        checked={config.allowSelfLoops}
        onChange={(v) => updateConfig({ allowSelfLoops: v })}
      />
      <Toggle
        label="Allow parallel edges"
        checked={config.allowParallelEdges}
        onChange={(v) => updateConfig({ allowParallelEdges: v })}
      />
      <Toggle
        label="Show edge labels"
        checked={showEdgeLabels}
        onChange={setShowEdgeLabels}
      />
      <Toggle
        label="Show edge weights"
        checked={showEdgeWeights}
        onChange={setShowEdgeWeights}
      />
      <div className="py-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-300">Playback colors</p>
            <p className="text-xs text-zinc-500">
              Adjust node and edge colors used during algorithm playback.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={resetPlaybackColors}
          >
            Reset
          </Button>
        </div>

        <div className="space-y-2">
          {playbackColorFields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label className="text-xs text-zinc-400">{label}</Label>
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border border-zinc-700"
                  style={{ backgroundColor: playbackColors[key] }}
                  aria-hidden="true"
                />
                <Input
                  type="color"
                  value={playbackColors[key]}
                  onChange={(e) => setPlaybackColor(key, e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded-md border-zinc-700 bg-zinc-900 p-1"
                  aria-label={`${label} color`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-2">
          <p className="mb-2 text-[11px] text-zinc-500">Defaults</p>
          <div className="flex flex-wrap gap-2">
            {playbackColorFields.map(({ key, label }) => (
              <button
                key={`${key}-default`}
                type="button"
                onClick={() => setPlaybackColor(key, defaultPlaybackColors[key])}
                className="flex items-center gap-1.5 rounded border border-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-800"
              >
                <span
                  className="h-3 w-3 rounded border border-zinc-700"
                  style={{ backgroundColor: defaultPlaybackColors[key] }}
                />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
