"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { EditorCanvas } from "@/features/editor/components/EditorCanvas";
import { InspectorPanel } from "@/features/editor/components/InspectorPanel";
import { PlaybackPanel } from "@/features/editor/components/PlaybackPanel";
import { ReadOnlyBadge } from "./ReadOnlyBadge";
import { ForkButton } from "./ForkButton";
import type { CanonicalGraph } from "@/types/graph";

interface SharedEditorClientProps {
  projectTitle: string;
  graph: CanonicalGraph;
  slugOrToken?: string;
  isAuthenticated?: boolean;
  showForkButton?: boolean;
}

function SharedEditorInner({
  projectTitle,
  graph,
  slugOrToken,
  isAuthenticated,
  showForkButton = true,
}: SharedEditorClientProps) {
  const currentGraph = useGraphStore((state) => state.graph);
  const { setGraph } = useGraphStore();

  useEffect(() => {
    setGraph(graph);
  }, [graph, setGraph]);

  if (currentGraph !== graph) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Loading shared graph...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Read-only toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-950 h-12 shrink-0">
        <span className="text-sm font-semibold text-zinc-200 truncate max-w-[200px]">
          {projectTitle}
        </span>
        <span className="text-xs text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">
          read-only
        </span>
        <div className="flex-1" />
        {showForkButton && slugOrToken ? (
          <ForkButton
            slugOrToken={slugOrToken}
            isAuthenticated={Boolean(isAuthenticated)}
          />
        ) : null}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <ReadOnlyBadge />
        <EditorCanvas readOnly />
        <InspectorPanel readOnly />
      </div>

      <PlaybackPanel />
    </div>
  );
}

export function SharedEditorClient(props: SharedEditorClientProps) {
  return (
    <ReactFlowProvider>
      <SharedEditorInner {...props} />
    </ReactFlowProvider>
  );
}
