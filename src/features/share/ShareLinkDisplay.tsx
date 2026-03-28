"use client";

import { useState } from "react";
import { Copy, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareLinkDisplayProps {
  shareId: string;
  url?: string;
  type: "public" | "private_token";
  rawToken?: string; // Only present when private share was just created
  onRevoke: (shareId: string) => Promise<void>;
}

export function ShareLinkDisplay({
  shareId,
  url,
  type,
  rawToken,
  onRevoke,
}: ShareLinkDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  async function copyUrl() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRevoke() {
    if (!confirm("Revoke this share link? Anyone with this link will lose access.")) return;
    setRevoking(true);
    try {
      await onRevoke(shareId);
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-900 rounded-md border border-zinc-800">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {type === "public" ? "Public link" : "Private link"}
        </span>
        {rawToken && (
          <span className="text-xs text-amber-400 ml-auto font-medium">
            Token shown once — copy now
          </span>
        )}
      </div>

      {url ? (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 font-mono truncate outline-none"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 shrink-0"
            onClick={copyUrl}
            title="Copy link"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-400 shrink-0"
            onClick={handleRevoke}
            disabled={revoking}
            title="Revoke link"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <p className="flex-1 text-xs text-zinc-500">
            Private link active. The original token cannot be recovered.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-400 shrink-0"
            onClick={handleRevoke}
            disabled={revoking}
            title="Revoke link"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      )}

      {rawToken && (
        <p className="text-xs text-amber-400/80 mt-1">
          This private token will not be shown again. The URL above contains the full token.
        </p>
      )}

      {type === "private_token" && !rawToken && url && (
        <p className="text-xs text-zinc-600 mt-1">
          Private link active. The original token cannot be recovered.
        </p>
      )}
    </div>
  );
}
