"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Copy, Share2, LayoutDashboard } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "./dateUtils";
import { ShareModal } from "@/features/share/ShareModal";

interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
}

export function ProjectCard({
  id,
  title,
  updatedAt,
  nodeCount,
  edgeCount,
}: ProjectCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  async function handleRename() {
    if (!newTitle.trim()) return;
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    setRenaming(false);
    setMenuOpen(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    setMenuOpen(false);
  }

  async function handleDuplicate() {
    const duplicateRes = await fetch(`/api/projects/${id}/duplicate`, {
      method: "POST",
    });

    if (duplicateRes.ok) {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    }

    setMenuOpen(false);
  }

  return (
    <Card className="bg-zinc-900/40 backdrop-blur-md border-white/5 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <CardContent className="p-0">
        <div
          className="cursor-pointer p-5"
          onClick={() => router.push(`/editor/${id}`)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
              <LayoutDashboard size={20} className="text-zinc-500 group-hover:text-primary transition-colors" />
            </div>
          </div>

          {renaming ? (
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setRenaming(false);
                  setNewTitle(title);
                }
              }}
              onBlur={handleRename}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950/50 border border-primary/50 rounded px-2 py-1 text-zinc-100 text-sm font-bold w-full outline-none mb-2 focus:ring-2 ring-primary/20"
            />
          ) : (
            <h3 className="text-zinc-100 text-sm font-bold truncate mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <span className="text-primary/70">{nodeCount}</span>
              <span>Nodes</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <span className="text-primary/70">{edgeCount}</span>
              <span>Edges</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-medium text-zinc-600">
              Edited {formatDistanceToNow(updatedAt)}
            </p>
          </div>
        </div>

        <div className="absolute top-3 right-3 z-20">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
          >
            <MoreHorizontal size={14} />
          </Button>

          {menuOpen && (
            <div
              className="absolute right-0 top-8 w-40 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
                onClick={() => {
                  setRenaming(true);
                  setMenuOpen(false);
                }}
              >
                <Pencil size={12} />
                Rename
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
                onClick={handleDuplicate}
              >
                <Copy size={12} />
                Duplicate
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
                onClick={() => {
                  setShareOpen(true);
                  setMenuOpen(false);
                }}
              >
                <Share2 size={12} />
                Share
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-zinc-700"
                onClick={handleDelete}
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          )}
        </div>
      </CardContent>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} projectId={id} />
    </Card>
  );
}
