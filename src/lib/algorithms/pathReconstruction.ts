import type { EventBuilder } from "./eventBuilder";
import type { PlaybackEvent } from "@/types/events";

/**
 * Reconstruct shortest path from parent maps and emit a PATH_UPDATED event.
 * Returns the path array, or null if the target is unreachable.
 */
export function reconstructPath(
  parentNode: Record<string, string | null>,
  parentEdge: Record<string, string | null>,
  source: string,
  target: string,
  eb: EventBuilder
): { event: PlaybackEvent; path: string[]; edgeIds: string[] } | null {
  const path: string[] = [];
  const edgeIds: string[] = [];
  let current: string | null = target;

  while (current !== null) {
    path.unshift(current);
    if (current === source) break;

    const viaEdgeId = parentEdge[current] ?? null;
    if (viaEdgeId === null) {
      return null;
    }

    edgeIds.unshift(viaEdgeId);
    current = parentNode[current] ?? null;
  }

  if (path[0] !== source) {
    return null;
  }

  const event = eb.emit("PATH_UPDATED", { path, edgeIds }, `Shortest path: ${path.join(" -> ")}`);

  return { event, path, edgeIds };
}
