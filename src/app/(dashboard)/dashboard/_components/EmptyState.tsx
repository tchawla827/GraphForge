"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_SAMPLES } from "@/lib/samples";
import { CreateProjectButton } from "./CreateProjectButton";
import { cn } from "@/lib/utils";


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
    <div className="flex flex-col items-center justify-center min-h-[50vh] border border-dashed border-white/10 rounded-3xl text-center px-6 py-20 gap-6 bg-zinc-900/20 backdrop-blur-sm">
      <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-2">
        <LayoutDashboard size={32} className="text-primary/40" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">No projects in your workspace</h2>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
          Start your engineering journey by creating a custom graph or exploring one of our algorithmic samples.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <CreateProjectButton />

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            disabled={loadingKey !== null}
            className="gap-2 border-white/10 bg-white/5 text-zinc-300 hover:border-primary/50 hover:bg-white/10 transition-all font-bold h-10 px-6"
          >
            <BookOpen size={16} />
            Explore Samples
            <ChevronDown size={14} className={cn("transition-transform duration-300", open && "rotate-180")} />
          </Button>

          {open && (
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50 w-72 rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-2xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-200">
              {ALL_SAMPLES.map((sample) => (
                <button
                  key={sample.key}
                  onClick={() => handleOpenSample(sample.key)}
                  disabled={loadingKey === sample.key}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl transition-all group"
                >
                  <p className="text-zinc-200 text-xs font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                    {loadingKey === sample.key ? "Initializing..." : sample.label}
                  </p>
                  <p className="text-zinc-500 text-[10px] mt-1 leading-relaxed font-medium line-clamp-2">{sample.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

