"use client";

import { useGraphStore } from "@/features/editor/store/graphStore";
import { useUiStore } from "@/features/editor/store/uiStore";
import { Label } from "@/components/ui/label";
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

export function GraphTab() {
  const { graph, updateConfig } = useGraphStore();
  const {
    showEdgeLabels,
    showEdgeWeights,
    setShowEdgeLabels,
    setShowEdgeWeights,
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
    </div>
  );
}
