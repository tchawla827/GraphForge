export type NodeVisualState =
  | "idle"
  | "discovered"
  | "visited"
  | "finalized"
  | "path";

export type EdgeVisualState =
  | "idle"
  | "considered"
  | "relaxed"
  | "rejected"
  | "path";

export type VisualStateDiff = Record<string, NodeVisualState | EdgeVisualState>;

export type RunStatus = "idle" | "ready" | "playing" | "paused" | "invalidated";
