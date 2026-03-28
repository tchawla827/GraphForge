import { describe, expect, it } from "vitest";
import { derivePlaybackInsights } from "../../../src/lib/playback/insights";
import type { PlaybackEvent } from "../../../src/types/events";

function event(
  stepIndex: number,
  type: PlaybackEvent["type"],
  payload: Record<string, unknown>,
  message: string
): PlaybackEvent {
  return {
    id: `evt_${stepIndex}`,
    stepIndex,
    type,
    payload,
    message,
  };
}

describe("derivePlaybackInsights", () => {
  it("builds discovery order with parent context", () => {
    const events = [
      event(0, "RUN_STARTED", {}, "Starting BFS from A"),
      event(1, "NODE_DISCOVERED", { nodeId: "A", label: "A" }, "Start at A"),
      event(
        2,
        "NODE_DISCOVERED",
        { nodeId: "B", label: "B", from: "A", fromLabel: "A" },
        "Discovered B from A via A -> B"
      ),
    ];

    const insights = derivePlaybackInsights(events, 2);

    expect(insights.discoverySequence).toEqual([
      {
        stepIndex: 1,
        order: 1,
        nodeId: "A",
        label: "A",
        fromId: undefined,
        fromLabel: undefined,
      },
      {
        stepIndex: 2,
        order: 2,
        nodeId: "B",
        label: "B",
        fromId: "A",
        fromLabel: "A",
      },
    ]);
  });

  it("keeps the latest structure snapshot with display labels", () => {
    const events = [
      event(
        0,
        "QUEUE_UPDATED",
        { items: ["A"], displayItems: ["Alpha"] },
        "Queue: [Alpha]"
      ),
      event(
        1,
        "QUEUE_UPDATED",
        { items: ["B", "C"], displayItems: ["Beta", "Gamma"] },
        "Queue: [Beta, Gamma]"
      ),
    ];

    const insights = derivePlaybackInsights(events, 1);

    expect(insights.structure).toEqual({
      kind: "queue",
      title: "Queue",
      eventMessage: "Queue: [Beta, Gamma]",
      items: [
        { id: "B", label: "Beta" },
        { id: "C", label: "Gamma" },
      ],
    });
  });

  it("filters out future steps", () => {
    const events = [
      event(0, "RUN_STARTED", {}, "Starting DFS from A"),
      event(1, "NODE_DISCOVERED", { nodeId: "A", label: "A" }, "Start at A"),
      event(2, "NODE_VISITED", { nodeId: "A" }, "Visit A"),
    ];

    const insights = derivePlaybackInsights(events, 1);

    expect(insights.timeline).toHaveLength(2);
    expect(insights.timeline.at(-1)?.message).toBe("Start at A");
  });
});
