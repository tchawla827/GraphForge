"use client";

import { MousePointer2, Plus, Link2, Trash2 } from "lucide-react";
import { useUiStore, type ToolMode } from "@/features/editor/store/uiStore";
import { cn } from "@/lib/utils";

const tools: { mode: ToolMode; icon: React.ElementType; label: string }[] = [
  { mode: "select", icon: MousePointer2, label: "Select" },
  { mode: "addNode", icon: Plus, label: "Add Node" },
  { mode: "connect", icon: Link2, label: "Connect" },
  { mode: "delete", icon: Trash2, label: "Delete" },
];

export function ToolRail() {
  const { toolMode, setToolMode } = useUiStore();

  return (
    <div className="flex flex-col gap-1 p-2 border-r border-zinc-800 bg-zinc-950">
      {tools.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setToolMode(mode)}
          title={label}
          aria-label={label}
          aria-pressed={toolMode === mode}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-md transition-colors",
            toolMode === mode
              ? "bg-indigo-600 text-white"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          )}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
