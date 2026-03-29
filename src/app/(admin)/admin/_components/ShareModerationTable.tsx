"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareRow {
  id: string;
  type: string;
  slug: string | null;
  projectId: string;
  projectTitle: string;
  createdAt: string;
}

export function ShareModerationTable({ initialShares }: { initialShares: ShareRow[] }) {
  const [shares, setShares] = useState(initialShares);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleRevoke(id: string) {
    if (revoking) return;
    setRevoking(id);
    try {
      const res = await fetch(`/api/admin/moderation/share/${id}/revoke`, { method: "POST" });
      if (res.ok) {
        setShares((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setRevoking(null);
    }
  }

  if (shares.length === 0) {
    return <p className="text-zinc-500 text-sm py-4">No active share links.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            <th className="text-left px-4 py-3 text-zinc-500 font-medium">Project</th>
            <th className="text-left px-4 py-3 text-zinc-500 font-medium">Type</th>
            <th className="text-left px-4 py-3 text-zinc-500 font-medium">Slug</th>
            <th className="text-left px-4 py-3 text-zinc-500 font-medium">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {shares.map((share) => (
            <tr key={share.id} className="border-b border-zinc-800/50 last:border-0">
              <td className="px-4 py-3 text-zinc-300">{share.projectTitle}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    share.type === "public"
                      ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800"
                      : "bg-amber-900/40 text-amber-400 border border-amber-800"
                  }`}
                >
                  {share.type === "public" ? "Public" : "Private token"}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{share.slug ?? "-"}</td>
              <td className="px-4 py-3 text-zinc-500 text-xs">
                {new Date(share.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRevoke(share.id)}
                  disabled={revoking === share.id}
                  className="border-red-800 text-red-400 hover:bg-red-900/30 text-xs h-7"
                >
                  {revoking === share.id ? "Revoking..." : "Revoke"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
