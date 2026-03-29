"use client";

import { useState } from "react";
import { Download, FileImage, FileText, Image as ImageIcon, FileCode, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { usePlaybackStore } from "@/features/editor/store/playbackStore";
import { exportToPng, exportToPdf } from "@/lib/export/exportImage";
import { exportToSvg } from "@/lib/export/exportSvg";
import { exportToGif } from "@/lib/export/exportGif";
import { toast } from "sonner";

interface ExportMenuProps {
  projectTitle: string;
}

export function ExportMenu({ projectTitle }: ExportMenuProps) {
  const { graph } = useGraphStore();
  const events = usePlaybackStore((s) => s.events);
  const visualHighlights = usePlaybackStore((s) => s.visualHighlights);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const getFlowElement = () => document.querySelector(".react-flow") as HTMLElement;

  const handleExportJson = () => {
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
    toast.success("Project exported as JSON");
  };

  const handleExportPng = async () => {
    if (!graph) return;
    try {
      setIsExporting(true);
      await exportToPng(getFlowElement(), `${projectTitle.replace(/\s+/g, "_")}.png`, { scale: 2 });
      toast.success("Graph exported as PNG");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!graph) return;
    try {
      setIsExporting(true);
      await exportToPdf(getFlowElement(), `${projectTitle.replace(/\s+/g, "_")}.pdf`, projectTitle);
      toast.success("Graph exported as PDF");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = () => {
    if (!graph) return;
    try {
      const svgContent = exportToSvg(graph, visualHighlights);
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectTitle.replace(/\s+/g, "_")}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Graph exported as SVG");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export SVG");
    }
  };

  const handleExportGif = async () => {
    if (!graph || events.length === 0) {
      toast.error("Run an algorithm first to export a GIF");
      return;
    }
    try {
      setIsExporting(true);
      setProgress(0);
      await exportToGif(
        getFlowElement(),
        `${projectTitle.replace(/\s+/g, "_")}.gif`,
        {
          fps: 2,
          quality: 10,
          resolutionScale: 1,
          onProgress: (p) => setProgress(p),
        }
      );
      toast.success("Algorithm exported as GIF");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export GIF");
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={!graph || isExporting}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-1.5 text-xs h-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 relative px-3"
      >
        {isExporting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        Export
        {isExporting && progress > 0 && (
          <span className="absolute -bottom-1 left-0 h-0.5 bg-indigo-500 transition-all" style={{ width: `${progress * 100}%` }} />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800 text-zinc-300">
        <div className="px-2 py-1.5 text-xs text-zinc-500 font-normal">Export As</div>
        
        <DropdownMenuItem onClick={handleExportPng} className="gap-2 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100">
          <ImageIcon size={14} />
          <span>Image (PNG)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportPdf} className="gap-2 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100">
          <FileText size={14} />
          <span>Document (PDF)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportSvg} className="gap-2 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100">
          <FileCode size={14} />
          <span>Vector (SVG)</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-800" />
        
        <DropdownMenuItem 
          onClick={handleExportGif} 
          disabled={events.length === 0}
          className="gap-2 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100"
        >
          <FileImage size={14} />
          <span>Animation (GIF)</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-800" />
        
        <DropdownMenuItem onClick={handleExportJson} className="gap-2 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100">
          <FileCode size={14} />
          <span>Project Data (JSON)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
