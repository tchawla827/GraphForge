"use client";

import { useQuery } from "@tanstack/react-query";
import { ProjectCard } from "./_components/ProjectCard";
import { CreateProjectButton } from "./_components/CreateProjectButton";
import { EmptyState } from "./_components/EmptyState";

interface ProjectItem {
  id: string;
  title: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
}

async function fetchProjects(): Promise<ProjectItem[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  const json = await res.json() as { data: ProjectItem[] };
  return json.data;
}

export default function DashboardPage() {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Build graphs, run algorithms, share your work.
          </p>
        </div>
        {projects && projects.length > 0 && <CreateProjectButton />}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-lg bg-zinc-900 animate-pulse border border-zinc-800"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-red-400 text-sm">
          Failed to load projects. Please refresh.
        </p>
      )}

      {!isLoading && !isError && projects && projects.length === 0 && (
        <EmptyState />
      )}

      {!isLoading && !isError && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              title={p.title}
              updatedAt={p.updatedAt}
              nodeCount={p.nodeCount}
              edgeCount={p.edgeCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
