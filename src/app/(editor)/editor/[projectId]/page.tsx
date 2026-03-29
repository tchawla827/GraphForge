"use client";

import { use, useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { EditorCanvas } from "@/features/editor/components/EditorCanvas";
import { ToolRail } from "@/features/editor/components/ToolRail";
import { Toolbar } from "@/features/editor/components/Toolbar";
import { InspectorPanel } from "@/features/editor/components/InspectorPanel";
import { PlaybackPanel } from "@/features/editor/components/PlaybackPanel";
import { OnboardingOverlay } from "@/features/onboarding/OnboardingOverlay";
import { useGraphSync } from "@/features/editor/hooks/useGraphSync";
import { useEditorKeymap } from "@/features/editor/hooks/useEditorKeymap";
import type { CanonicalGraph } from "@/types/graph";

interface EditorPageProps {
  params: Promise<{ projectId: string }>;
}

function EditorInner({ projectId }: { projectId: string }) {
  const { setGraph } = useGraphStore();
  const [title, setTitle] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useGraphSync(projectId);
  useEditorKeymap();

  useEffect(() => {
    async function load() {
      try {
        const [projectRes, graphRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/graph`),
        ]);

        if (!projectRes.ok || !graphRes.ok) {
          setError("Project not found or access denied.");
          setLoading(false);
          return;
        }

        const projectJson = await projectRes.json() as { data: { title: string } };
        const graphJson = await graphRes.json() as { data: CanonicalGraph };

        setTitle(projectJson.data.title);
        setGraph(graphJson.data);
      } catch {
        setError("Failed to load project.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId, setGraph]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar projectTitle={title} projectId={projectId} />
      <div className="flex flex-1 overflow-hidden">
        <ToolRail />
        <div className="relative flex flex-1">
          <EditorCanvas />
          <OnboardingOverlay />
        </div>
        <InspectorPanel projectId={projectId} />
      </div>
      <PlaybackPanel />
    </div>
  );
}

export default function EditorPage({ params }: EditorPageProps) {
  const { projectId } = use(params);

  return (
    <ReactFlowProvider>
      <EditorInner projectId={projectId} />
    </ReactFlowProvider>
  );
}
