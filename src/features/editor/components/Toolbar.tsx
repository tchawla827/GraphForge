"use client";

import { useState } from "react";
import { Download, Upload, Share2, Play } from "lucide-react";
import { useUiStore } from "@/features/editor/store/uiStore";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { Button } from "@/components/ui/button";
import { ImportModal } from "./ImportModal";

interface ToolbarProps {
  projectTitle: string;
  projectId: string;
}

const saveStatusLabel: Record<string, string> = {
  saved: "Saved",
  saving: "Saving...",
  unsaved: "Unsaved changes",
  error: "Save failed",
};

const saveStatusColor: Record<string, string> = {
  saved: "text-emerald-400",
  saving: "text-zinc-400 animate-pulse",
  unsaved: "text-amber-400",
  error: "text-red-400",
};

export function Toolbar({ projectTitle, projectId }: ToolbarProps) {
  const { saveStatus } = useUiStore();
  const { graph } = useGraphStore();
  const [importOpen, setImportOpen] = useState(false);

  function exportJson() {
    if (!graph) return;
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-950 h-12 shrink-0">
        <span className="text-sm font-semibold text-zinc-200 truncate max-w-[200px]">
          {projectTitle}
        </span>

        <span className={`text-xs ml-1 ${saveStatusColor[saveStatus] ?? "text-zinc-400"}`}>
          {saveStatusLabel[saveStatus]}
        </span>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          title="Import graph"
          onClick={() => setImportOpen(true)}
          className="gap-1.5 text-xs"
        >
          <Upload size={14} />
          Import
        </Button>

        <Button
          variant="ghost"
          size="sm"
          title="Export JSON"
          onClick={exportJson}
          disabled={!graph}
          className="gap-1.5 text-xs"
        >
          <Download size={14} />
          Export
        </Button>

        <Button
          variant="ghost"
          size="sm"
          title="Share (coming soon)"
          disabled
          className="gap-1.5 text-xs text-zinc-500"
        >
          <Share2 size={14} />
          Share
        </Button>

        <Button
          variant="ghost"
          size="sm"
          title="Run algorithm (coming soon)"
          disabled
          className="gap-1.5 text-xs text-zinc-500"
        >
          <Play size={14} />
          Run
        </Button>
      </div>

      <ImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        projectId={projectId}
      />
    </>
  );
}
