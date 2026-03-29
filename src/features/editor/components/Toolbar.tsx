"use client";

import { useState } from "react";
import { Upload, Share2, Play, ChevronLeft } from "lucide-react";

import Link from "next/link";
import { useUiStore } from "@/features/editor/store/uiStore";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { usePlaybackStore } from "@/features/editor/store/playbackStore";
import { Button } from "@/components/ui/button";
import { ImportModal } from "./ImportModal";
import { ShareModal } from "@/features/share/ShareModal";
import { ExportMenu } from "./ExportMenu";

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
  saved: "text-emerald-400/80",
  saving: "text-zinc-400 animate-pulse",
  unsaved: "text-amber-400/80",
  error: "text-red-400/80",
};

export function Toolbar({ projectTitle, projectId }: ToolbarProps) {
  const { saveStatus, setActivePanel } = useUiStore();
  const { graph } = useGraphStore();
  const runStatus = usePlaybackStore((s) => s.runStatus);
  const [importOpen, setImportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md h-14 shrink-0 z-50">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10 mr-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon-sm" className="hover:bg-white/5 text-zinc-400 hover:text-zinc-100" title="Back to Dashboard">
              <ChevronLeft size={18} />
            </Button>
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-100 truncate max-w-[200px] leading-tight">
              {projectTitle}
            </span>
            <span className={`text-[10px] font-medium tracking-wide uppercase ${saveStatusColor[saveStatus] ?? "text-zinc-500"}`}>
              {saveStatusLabel[saveStatus]}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
          <Button
            variant="ghost"
            size="sm"
            title="Import graph"
            onClick={() => setImportOpen(true)}
            className="gap-1.5 text-xs h-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
          >
            <Upload size={14} />
            Import
          </Button>

          <ExportMenu projectTitle={projectTitle} />
        </div>

        <Button
          variant="outline"
          size="sm"
          title="Share project"
          onClick={() => setShareOpen(true)}
          className="gap-1.5 text-xs h-8 border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-300"
        >
          <Share2 size={14} />
          Share
        </Button>

        <Button
          variant="ghost"
          size="sm"
          title="Run algorithm"
          onClick={() => setActivePanel("algorithm")}
          disabled={!graph}
          className={`gap-1.5 text-xs ${
            runStatus === "playing" ? "text-indigo-400" : ""
          }`}
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
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectId={projectId}
      />
    </>
  );
}
