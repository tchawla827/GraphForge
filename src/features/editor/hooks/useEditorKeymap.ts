"use client";

import { useEffect } from "react";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { useSelectionStore } from "@/features/editor/store/selectionStore";
import { useUiStore } from "@/features/editor/store/uiStore";

export function useEditorKeymap() {
  const { removeNode, removeEdge } = useGraphStore();
  const { selectedNodeIds, selectedEdgeIds, clearSelection } = useSelectionStore();
  const { setToolMode } = useUiStore();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        for (const id of selectedNodeIds) removeNode(id);
        for (const id of selectedEdgeIds) removeEdge(id);
        clearSelection();
      }

      if (e.key === "Escape") {
        clearSelection();
        setToolMode("select");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedNodeIds, selectedEdgeIds, removeNode, removeEdge, clearSelection, setToolMode]);
}
