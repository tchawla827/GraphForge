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
    <div className="flex flex-col gap-2 p-2 border-r border-white/5 bg-zinc-950/50 backdrop-blur-md z-10">
      {tools.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setToolMode(mode)}
          title={label}
          aria-label={label}
          aria-pressed={toolMode === mode}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 relative group",
            toolMode === mode
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
              : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
          )}
        >
          <Icon size={18} />
          {toolMode === mode && (
            <div className="absolute inset-0 rounded-xl blur-md bg-primary/20 -z-10" />
          )}
        </button>
      ))}
    </div>
  );
}

