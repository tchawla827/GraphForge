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
 * Playback consumes these and never mutates them.
 *
 * Payload shapes by event type:
 *
 * - `RUN_STARTED`: `{}`
 * - `NODE_DISCOVERED`: `{ nodeId: string, label?: string, from?: string, fromLabel?: string, viaEdgeId?: string }`
 * - `NODE_VISITED`: `{ nodeId: string }`
 * - `NODE_FINALIZED`: `{ nodeId: string }`
 * - `EDGE_CONSIDERED`: `{ edgeId: string, from: string, to: string }`
 * - `EDGE_RELAXED`: `{ edgeId: string, newDistance: number, via: string }`
 * - `EDGE_REJECTED`: `{ edgeId: string, reason: string }`
 * - `QUEUE_UPDATED`: `{ items: string[], displayItems?: string[] }`
 * - `STACK_UPDATED`: `{ items: string[], displayItems?: string[] }`
 * - `PRIORITY_QUEUE_UPDATED`: `{ items: string[], displayItems?: string[] }`
 * - `DISTANCE_UPDATED`: `{ nodeId: string, distance: number }`
 * - `PATH_UPDATED`: `{ path: string[] }`
 * - `CYCLE_DETECTED`: `{ cycle: string[] }`
 * - `RUN_WARNING`: `{ message: string }`
 * - `RUN_COMPLETED`: `{}`
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
