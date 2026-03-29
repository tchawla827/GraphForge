"use client";

import { useEffect, useRef } from "react";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { useUiStore } from "@/features/editor/store/uiStore";
import { track } from "@/lib/analytics/track";

export function useGraphSync(projectId: string) {
  const { graph, isDirty, markClean } = useGraphStore();
  const { setSaveStatus } = useUiStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || !graph) return;

    setSaveStatus("unsaved");

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/projects/${projectId}/graph`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(graph),
        });

        if (!res.ok) {
          if (useGraphStore.getState().graph === graph) {
            setSaveStatus("error");
          }
          return;
        }

        if (useGraphStore.getState().graph === graph) {
          markClean();
          setSaveStatus("saved");
          void track({ name: "graph_saved" });
        }
      } catch {
        if (useGraphStore.getState().graph === graph) {
          setSaveStatus("error");
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, graph, projectId, markClean, setSaveStatus]);
}
