"use client";

import { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareLinkDisplayProps {
  shareId: string;
  url?: string;
  type: "public" | "private_token";
  rawToken?: string;
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
    <div className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {type === "public" ? "Public link" : "Private link"}
        </span>
        {rawToken ? (
          <span className="ml-auto text-xs font-medium text-amber-400">
            Copy before you close this dialog
          </span>
        ) : null}
      </div>

      {url ? (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            data-testid="share-url-input"
            className="flex-1 truncate rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300 outline-none"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 text-zinc-400"
            onClick={copyUrl}
            title="Copy link"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 text-red-400"
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
            Private link active, but the URL is temporarily unavailable.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 text-red-400"
            onClick={handleRevoke}
            disabled={revoking}
            title="Revoke link"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      )}

      {rawToken ? (
        <p className="mt-1 text-xs text-amber-400/80">
          The URL above contains the full private token. Copy it now if you want to share it
          immediately.
        </p>
      ) : null}

      {type === "private_token" && !rawToken && url ? (
        <p className="mt-1 text-xs text-zinc-600">
          Private link active. You can copy or revoke it at any time.
        </p>
      ) : null}
    </div>
  );
}
