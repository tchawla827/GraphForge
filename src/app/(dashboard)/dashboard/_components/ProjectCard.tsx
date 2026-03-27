"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "./dateUtils";

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
    const [projectRes, graphRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/projects/${id}/graph`),
    ]);

    if (!projectRes.ok || !graphRes.ok) {
      setMenuOpen(false);
      return;
    }

    const projectJson = (await projectRes.json()) as {
      data: { description?: string | null };
    };
    const graphJson = (await graphRes.json()) as {
      data: Record<string, unknown>;
    };

    const createRes = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${title} (copy)`,
        description: projectJson.data.description ?? undefined,
      }),
    });

    if (!createRes.ok) {
      setMenuOpen(false);
      return;
    }

    const createJson = (await createRes.json()) as { data: { id: string } };
    const duplicateGraph = {
      ...graphJson.data,
      projectId: createJson.data.id,
    };

    const saveRes = await fetch(`/api/projects/${createJson.data.id}/graph`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duplicateGraph),
    });

    if (saveRes.ok) {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    }

    setMenuOpen(false);
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors group relative">
      <CardContent className="p-4">
        <div
          className="cursor-pointer"
          onClick={() => router.push(`/editor/${id}`)}
        >
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
              className="bg-transparent border-b border-indigo-500 text-zinc-100 text-sm font-semibold w-full outline-none mb-2"
            />
          ) : (
            <p className="text-zinc-100 text-sm font-semibold truncate mb-2">
              {title}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{nodeCount} nodes</span>
            <span>{edgeCount} edges</span>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            {formatDistanceToNow(updatedAt)}
          </p>
        </div>

        <div className="absolute top-3 right-3">
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
    </Card>
  );
}
