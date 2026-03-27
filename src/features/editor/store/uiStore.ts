import { create } from "zustand";

export type ToolMode = "select" | "addNode" | "connect" | "delete";
export type ActivePanel = "graph" | "selection" | "algorithm" | "help";
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface UiState {
  toolMode: ToolMode;
  activePanel: ActivePanel;
  saveStatus: SaveStatus;
  showEdgeLabels: boolean;
  showEdgeWeights: boolean;
}

interface UiActions {
  setToolMode: (mode: ToolMode) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setShowEdgeLabels: (show: boolean) => void;
  setShowEdgeWeights: (show: boolean) => void;
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  toolMode: "select",
  activePanel: "graph",
  saveStatus: "saved",
  showEdgeLabels: true,
  showEdgeWeights: true,

  setToolMode(mode) {
    set({ toolMode: mode });
  },

  setActivePanel(panel) {
    set({ activePanel: panel });
  },

  setSaveStatus(status) {
    set({ saveStatus: status });
  },

  setShowEdgeLabels(showEdgeLabels) {
    set({ showEdgeLabels });
  },

  setShowEdgeWeights(showEdgeWeights) {
    set({ showEdgeWeights });
  },
}));
