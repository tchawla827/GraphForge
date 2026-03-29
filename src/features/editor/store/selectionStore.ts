import { create } from "zustand";
import type { CanonicalGraph } from "@/types/graph";

interface SelectionState {
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
}

interface SelectionActions {
  setSelection: (selection: {
    selectedNodeIds: string[];
    selectedEdgeIds: string[];
  }) => void;
  selectNodes: (ids: string[]) => void;
  selectEdges: (ids: string[]) => void;
  toggleNodeSelection: (id: string) => void;
  toggleEdgeSelection: (id: string) => void;
  clearSelection: () => void;
  reconcileSelection: (graph: CanonicalGraph | null) => void;
}

export const useSelectionStore = create<SelectionState & SelectionActions>(
  (set) => ({
    selectedNodeIds: [],
    selectedEdgeIds: [],

    setSelection(selection) {
      set(selection);
    },

    selectNodes(ids) {
      set((state) => ({ ...state, selectedNodeIds: ids }));
    },

    selectEdges(ids) {
      set((state) => ({ ...state, selectedEdgeIds: ids }));
    },

    toggleNodeSelection(id) {
      set((state) => ({
        ...state,
        selectedNodeIds: state.selectedNodeIds.includes(id)
          ? state.selectedNodeIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedNodeIds, id],
      }));
    },

    toggleEdgeSelection(id) {
      set((state) => ({
        ...state,
        selectedEdgeIds: state.selectedEdgeIds.includes(id)
          ? state.selectedEdgeIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedEdgeIds, id],
      }));
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
