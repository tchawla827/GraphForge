"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_SAMPLES } from "@/lib/samples";
import { CreateProjectButton } from "./CreateProjectButton";

export function EmptyState() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleOpenSample(sampleKey: string) {
    if (loadingKey) return;
    const sample = ALL_SAMPLES.find((s) => s.key === sampleKey);
    if (!sample) return;

    setLoadingKey(sampleKey);
    setOpen(false);
    try {
      // Create a new project
      const createRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sample.label }),
      });
      if (!createRes.ok) return;
      const { data: project } = await createRes.json() as { data: { id: string } };

      // Load the sample graph into it
      const graphPayload = {
        ...sample.graph,
        id: crypto.randomUUID(),
        projectId: project.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const seedRes = await fetch(`/api/projects/${project.id}/graph`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(graphPayload),
      });

      if (!seedRes.ok) {
        await fetch(`/api/projects/${project.id}`, { method: "DELETE" }).catch(() => undefined);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/editor/${project.id}`);
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-zinc-800 rounded-lg text-center px-4 py-16 gap-4">
      <p className="text-zinc-400 text-sm font-medium">No projects yet</p>
      <p className="text-zinc-600 text-xs max-w-xs">
        Create your first graph or start from a sample to explore algorithms.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 mt-1">
        <CreateProjectButton />

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            disabled={loadingKey !== null}
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <BookOpen size={15} />
            Open sample
            <ChevronDown size={14} />
          </Button>

          {open && (
            <div className="absolute top-full mt-1 left-0 z-50 w-64 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden">
              {ALL_SAMPLES.map((sample) => (
                <button
                  key={sample.key}
                  onClick={() => handleOpenSample(sample.key)}
                  disabled={loadingKey === sample.key}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                >
                  <p className="text-zinc-200 text-sm font-medium">
                    {loadingKey === sample.key ? "Loading..." : sample.label}
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">{sample.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
