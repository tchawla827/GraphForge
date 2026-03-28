import { create } from "zustand";
import type { CanonicalGraph } from "@/types/graph";

interface SelectionState {
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
}

interface SelectionActions {
  selectNodes: (ids: string[]) => void;
  selectEdges: (ids: string[]) => void;
  clearSelection: () => void;
  reconcileSelection: (graph: CanonicalGraph | null) => void;
}

export const useSelectionStore = create<SelectionState & SelectionActions>(
  (set) => ({
    selectedNodeIds: [],
    selectedEdgeIds: [],

    selectNodes(ids) {
      set({ selectedNodeIds: ids, selectedEdgeIds: [] });
    },

    selectEdges(ids) {
      set({ selectedEdgeIds: ids, selectedNodeIds: [] });
    },

    clearSelection() {
      set({ selectedNodeIds: [], selectedEdgeIds: [] });
    },

    reconcileSelection(graph) {
      if (!graph) {
        set({ selectedNodeIds: [], selectedEdgeIds: [] });
        return;
      }

      const nodeIds = new Set(graph.nodes.map((node) => node.id));
      const edgeIds = new Set(graph.edges.map((edge) => edge.id));

      set((state) => ({
        selectedNodeIds: state.selectedNodeIds.filter((id) => nodeIds.has(id)),
        selectedEdgeIds: state.selectedEdgeIds.filter((id) => edgeIds.has(id)),
      }));
    },
  })
);
