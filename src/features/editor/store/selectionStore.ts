import { create } from "zustand";

interface SelectionState {
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
}

interface SelectionActions {
  selectNodes: (ids: string[]) => void;
  selectEdges: (ids: string[]) => void;
  clearSelection: () => void;
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
  })
);
