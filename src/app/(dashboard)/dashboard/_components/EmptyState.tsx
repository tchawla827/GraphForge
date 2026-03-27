"use client";

import { CreateProjectButton } from "./CreateProjectButton";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-zinc-800 rounded-lg text-center px-4 py-16 gap-4">
      <p className="text-zinc-400 text-sm font-medium">No projects yet</p>
      <p className="text-zinc-600 text-xs max-w-xs">
        Create your first graph to get started. Build, run algorithms, and share
        your work.
      </p>
      <CreateProjectButton />
    </div>
  );
}
