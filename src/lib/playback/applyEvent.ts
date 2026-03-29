import type { PlaybackEvent } from "@/types/events";
import type { VisualStateDiff } from "./types";

/**
 * Compute the visual state for all nodes/edges by processing events 0..currentStep.
 * Returns a map of entity ID → visual state for rendering.
 */
export function computeVisualState(
  events: readonly PlaybackEvent[],
  currentStep: number
): VisualStateDiff {
  const state: VisualStateDiff = {};

  for (let i = 0; i <= currentStep && i < events.length; i++) {
    const event = events[i];
    const { type, payload } = event;

    switch (type) {
      case "NODE_DISCOVERED":
        state[payload.nodeId as string] = "discovered";
        break;

      case "NODE_VISITED":
        state[payload.nodeId as string] = "visited";
        break;

      case "NODE_FINALIZED":
        state[payload.nodeId as string] = "finalized";
        break;

      case "EDGE_CONSIDERED":
        state[payload.edgeId as string] = "considered";
        break;

      case "EDGE_RELAXED":
        state[payload.edgeId as string] = "relaxed";
        break;

      case "EDGE_REJECTED":
        state[payload.edgeId as string] = "rejected";
        break;

      case "PATH_UPDATED": {
        const path = payload.path as string[];
        // Mark path nodes
        for (const nodeId of path) {
          state[nodeId] = "path";
        }
        // Mark path edges — find edges connecting consecutive path nodes
        // Edge IDs are not in the path event, so we leave edge states as-is.
        // The path nodes are the important visual indicator.
        break;
      }

      case "CYCLE_DETECTED": {
        const cycle = getCycleNodeIds(payload);
        for (const nodeId of cycle) {
          state[nodeId] = "path"; // reuse "path" style for cycle highlighting
        }
        break;
      }

      // These events don't affect visual state of nodes/edges:
      case "RUN_STARTED":
      case "QUEUE_UPDATED":
      case "STACK_UPDATED":
      case "PRIORITY_QUEUE_UPDATED":
      case "DISTANCE_UPDATED":
      case "RUN_WARNING":
      case "RUN_COMPLETED":
        break;
    }
  }

  return state;
}

function getCycleNodeIds(payload: PlaybackEvent["payload"]): string[] {
  if (Array.isArray(payload.cycle)) {
    return payload.cycle.filter((nodeId): nodeId is string => typeof nodeId === "string");
  }

  if (Array.isArray(payload.nodes)) {
    return payload.nodes.filter((nodeId): nodeId is string => typeof nodeId === "string");
  }

  return [];
}
