import type { AlgorithmKey } from "@/types/graph";

export type PlaybackEventType =
  | "RUN_STARTED"
  | "NODE_DISCOVERED"
  | "NODE_VISITED"
  | "NODE_FINALIZED"
  | "EDGE_CONSIDERED"
  | "EDGE_RELAXED"
  | "EDGE_REJECTED"
  | "QUEUE_UPDATED"
  | "STACK_UPDATED"
  | "PRIORITY_QUEUE_UPDATED"
  | "DISTANCE_UPDATED"
  | "PATH_UPDATED"
  | "CYCLE_DETECTED"
  | "RUN_WARNING"
  | "RUN_COMPLETED";

/**
 * A single step in an algorithm's immutable event timeline.
 * Playback consumes these — never mutates them.
 */
export interface PlaybackEvent {
  id: string;
  stepIndex: number;
  type: PlaybackEventType;
  atMs?: number;
  payload: Record<string, unknown>;
  message: string;
}

export interface AlgorithmRunResult {
  algorithm: AlgorithmKey;
  status: "success" | "warning" | "error";
  summary: string;
  metrics: {
    visitedNodeCount: number;
    consideredEdgeCount: number;
    stepCount: number;
    runtimeMs?: number;
  };
  output: Record<string, unknown>;
  warnings: string[];
}
