"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareLinkDisplay } from "./ShareLinkDisplay";

interface ShareItem {
  id: string;
  type: string;
  isActive: boolean;
  slug: string | null;
  createdAt: string;
  url: string;
}

interface NewShare {
  id: string;
  type: "public" | "private_token";
  url: string;
  isActive: boolean;
  rawToken?: string;
}

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

async function fetchShares(projectId: string): Promise<ShareItem[]> {
  const res = await fetch(`/api/projects/${projectId}/shares`);
  if (!res.ok) return [];
  const json = await res.json() as { data: ShareItem[] };
  return json.data;
}

export function ShareModal({ open, onOpenChange, projectId }: ShareModalProps) {
  const queryClient = useQueryClient();
  // Track newly-created private shares so we can display the raw token once
  const [newPrivateShares, setNewPrivateShares] = useState<Map<string, NewShare>>(new Map());

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ["shares", projectId],
    queryFn: () => fetchShares(projectId),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (type: "public" | "private_token") => {
      const res = await fetch(`/api/projects/${projectId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Failed to create share");
      const json = await res.json() as { share: NewShare };
      return json.share;
    },
    onSuccess: (share) => {
      if (share.type === "private_token" && share.rawToken) {
        setNewPrivateShares((prev) => {
          const next = new Map(prev);
          next.set(share.id, share);
          return next;
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["shares", projectId] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const res = await fetch(`/api/shares/${shareId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke share");
    },
    onSuccess: (_data, shareId) => {
      setNewPrivateShares((prev) => {
        const next = new Map(prev);
        next.delete(shareId);
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: ["shares", projectId] });
    },
  });

  const activeShares = shares.filter((s) => s.isActive);
  const hasShares = activeShares.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Share project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          {isLoading && (
            <div className="text-xs text-zinc-500 text-center py-4">Loading shares...</div>
          )}

          {!isLoading && !hasShares && (
            <p className="text-xs text-zinc-500 text-center py-2">
              No active share links. Create one below.
            </p>
          )}

          {!isLoading && activeShares.map((share) => {
            const newShare = newPrivateShares.get(share.id);
            return (
              <ShareLinkDisplay
                key={share.id}
                shareId={share.id}
                url={newShare?.url ?? share.url}
                type={share.type as "public" | "private_token"}
                rawToken={newShare?.rawToken}
                onRevoke={(id) => revokeMutation.mutate(id)}
              />
            );
          })}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => createMutation.mutate("public")}
              disabled={createMutation.isPending}
            >
              <Globe size={13} />
              Public link
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => createMutation.mutate("private_token")}
              disabled={createMutation.isPending}
            >
              <Lock size={13} />
              Private link
            </Button>
          </div>

          {createMutation.isError && (
            <p className="text-xs text-red-400 text-center">
              Failed to create share link. Try again.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
