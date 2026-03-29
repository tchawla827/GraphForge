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
    <div className="max-w-screen-xl mx-auto px-6 py-12 relative">
      <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Project <span className="text-primary">Workspace</span>
          </h1>
          <p className="text-zinc-500 mt-3 text-base font-medium">
            Architect graphs, analyze data structures, and share engineering insights.
          </p>
        </div>
        {projects && projects.length > 0 && (
          <div className="pb-1">
            <CreateProjectButton />
          </div>
        )}
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
