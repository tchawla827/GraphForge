import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ToolMode = "select" | "addNode" | "connect" | "delete";
export type ActivePanel = "graph" | "selection" | "algorithm" | "help";
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";
export type PlaybackColorKey =
  | "discovered"
  | "visited"
  | "finalized"
  | "path"
  | "considered"
  | "relaxed"
  | "rejected";

export type PlaybackColors = Record<PlaybackColorKey, string>;

export const defaultPlaybackColors: PlaybackColors = {
  discovered: "#22d3ee",
  visited: "#f472b6",
  finalized: "#34d399",
  path: "#fbbf24",
  considered: "#38bdf8",
  relaxed: "#4ade80",
  rejected: "#64748b",
};

export const DEFAULT_PLAYBACK_PANEL_HEIGHT = 320;

interface UiState {
  toolMode: ToolMode;
  activePanel: ActivePanel;
  saveStatus: SaveStatus;
  showEdgeLabels: boolean;
  showEdgeWeights: boolean;
  playbackColors: PlaybackColors;
  playbackPanelHeight: number;
}

interface UiActions {
  setToolMode: (mode: ToolMode) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setShowEdgeLabels: (show: boolean) => void;
  setShowEdgeWeights: (show: boolean) => void;
  setPlaybackColor: (key: PlaybackColorKey, color: string) => void;
  setPlaybackPanelHeight: (height: number) => void;
  resetPlaybackColors: () => void;
}

export const useUiStore = create<UiState & UiActions>()(
  persist(
    (set) => ({
      toolMode: "select",
      activePanel: "graph",
      saveStatus: "saved",
      showEdgeLabels: true,
      showEdgeWeights: true,
      playbackColors: defaultPlaybackColors,
      playbackPanelHeight: DEFAULT_PLAYBACK_PANEL_HEIGHT,

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

      setPlaybackColor(key, color) {
        set((state) => ({
          playbackColors: {
            ...state.playbackColors,
            [key]: color,
          },
        }));
      },

      setPlaybackPanelHeight(playbackPanelHeight) {
        set({ playbackPanelHeight });
      },

      resetPlaybackColors() {
        set({ playbackColors: defaultPlaybackColors });
      },
    }),
    {
      name: "graphforge-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        showEdgeLabels: state.showEdgeLabels,
        showEdgeWeights: state.showEdgeWeights,
        playbackColors: state.playbackColors,
        playbackPanelHeight: state.playbackPanelHeight,
      }),
    }
  )
);
