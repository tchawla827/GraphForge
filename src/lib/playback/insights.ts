import type { PlaybackEvent, PlaybackEventType } from "@/types/events";

type StructureKind = "queue" | "stack" | "priorityQueue";

const TIMELINE_EVENT_TYPES = new Set<PlaybackEventType>([
  "RUN_STARTED",
  "NODE_DISCOVERED",
  "NODE_VISITED",
  "NODE_FINALIZED",
  "EDGE_CONSIDERED",
  "EDGE_RELAXED",
  "EDGE_REJECTED",
  "PATH_UPDATED",
  "CYCLE_DETECTED",
  "RUN_WARNING",
  "RUN_COMPLETED",
]);

export interface PlaybackTimelineEntry {
  stepIndex: number;
  type: PlaybackEventType;
  message: string;
}

export interface DiscoverySequenceEntry {
  stepIndex: number;
  order: number;
  nodeId: string;
  label: string;
  fromId?: string;
  fromLabel?: string;
}

export interface StructureItem {
  id: string;
  label: string;
}

export interface PlaybackStructureState {
  kind: StructureKind;
  title: string;
  eventMessage: string;
  items: StructureItem[];
}

export interface PlaybackInsights {
  timeline: PlaybackTimelineEntry[];
  discoverySequence: DiscoverySequenceEntry[];
  structure: PlaybackStructureState | null;
}

export function derivePlaybackInsights(
  events: readonly PlaybackEvent[],
  currentStep: number
): PlaybackInsights {
  if (currentStep < 0 || events.length === 0) {
    return {
      timeline: [],
      discoverySequence: [],
      structure: null,
    };
  }

  const safeStep = Math.min(currentStep, events.length - 1);
  const timeline: PlaybackTimelineEntry[] = [];
  const discoverySequence: DiscoverySequenceEntry[] = [];
  let structure: PlaybackStructureState | null = null;

  for (let index = 0; index <= safeStep; index++) {
    const event = events[index];
    const { payload } = event;

    if (TIMELINE_EVENT_TYPES.has(event.type)) {
      timeline.push({
        stepIndex: event.stepIndex,
        type: event.type,
        message: event.message,
      });
    }

    if (event.type === "NODE_DISCOVERED" && typeof payload.nodeId === "string") {
      discoverySequence.push({
        stepIndex: event.stepIndex,
        order: discoverySequence.length + 1,
        nodeId: payload.nodeId,
        label:
          typeof payload.label === "string" && payload.label.length > 0
            ? payload.label
            : payload.nodeId,
        fromId: typeof payload.from === "string" ? payload.from : undefined,
        fromLabel:
          typeof payload.fromLabel === "string" ? payload.fromLabel : undefined,
      });
    }

    const nextStructure = readStructureEvent(event);
    if (nextStructure) {
      structure = nextStructure;
    }
  }

  return { timeline, discoverySequence, structure };
}

function readStructureEvent(
  event: PlaybackEvent
): PlaybackStructureState | null {
  const items = readItems(event.payload);
  if (!items) return null;

  switch (event.type) {
    case "QUEUE_UPDATED":
      return {
        kind: "queue",
        title: "Queue",
        eventMessage: event.message,
        items,
      };
    case "STACK_UPDATED":
      return {
        kind: "stack",
        title: "Stack",
        eventMessage: event.message,
        items,
      };
    case "PRIORITY_QUEUE_UPDATED":
      return {
        kind: "priorityQueue",
        title: "Priority Queue",
        eventMessage: event.message,
        items,
      };
    default:
      return null;
  }
}

function readItems(payload: Record<string, unknown>): StructureItem[] | null {
  if (!Array.isArray(payload.items)) return null;

  const displayItems = Array.isArray(payload.displayItems)
    ? payload.displayItems.map((item) => String(item))
    : [];

  return payload.items.map((item, index) => ({
    id: String(item),
    label: displayItems[index] ?? String(item),
  }));
}
