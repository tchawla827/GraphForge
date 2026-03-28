"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ForkButtonProps {
  slugOrToken: string;
  isAuthenticated: boolean;
}

export function ForkButton({ slugOrToken, isAuthenticated }: ForkButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        onClick={() => router.push("/sign-in")}
      >
        <GitFork size={13} />
        Sign in to fork
      </Button>
    );
  }

  async function handleFork() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/${slugOrToken}/fork`, { method: "POST" });
      if (!res.ok) {
        setError("Fork failed. Try again.");
        return;
      }
      const json = await res.json() as { project: { id: string } };
      router.push(`/editor/${json.project.id}`);
    } catch {
      setError("Fork failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        onClick={handleFork}
        disabled={loading}
      >
        <GitFork size={13} />
        {loading ? "Forking..." : "Fork to my workspace"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
