import type { EventBuilder } from "./eventBuilder";
import type { PlaybackEvent } from "@/types/events";

/**
 * Reconstruct shortest path from a parent map and emit a PATH_UPDATED event.
 * Returns the path array, or null if the target is unreachable.
 */
export function reconstructPath(
  parent: Record<string, string | null>,
  source: string,
  target: string,
  eb: EventBuilder
): { event: PlaybackEvent; path: string[] } | null {
  const path: string[] = [];
  let current: string | null = target;

  while (current !== null) {
    path.unshift(current);
    if (current === source) break;
    current = parent[current] ?? null;
  }

  if (path[0] !== source) {
    return null;
  }

  const event = eb.emit(
    "PATH_UPDATED",
    { path },
    `Shortest path: ${path.join(" → ")}`
  );

  return { event, path };
}
