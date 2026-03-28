import { describe, expect, it } from "vitest";
import { computeVisualState } from "../../../src/lib/playback/applyEvent";
import type { PlaybackEvent } from "../../../src/types/events";

function event(
  stepIndex: number,
  type: PlaybackEvent["type"],
  payload: Record<string, unknown>
): PlaybackEvent {
  return {
    id: `evt_${stepIndex}`,
    stepIndex,
    type,
    payload,
    message: "",
  };
}

describe("computeVisualState", () => {
  it("marks discovered node", () => {
    const events = [event(0, "NODE_DISCOVERED", { nodeId: "A" })];
    const state = computeVisualState(events, 0);
    expect(state["A"]).toBe("discovered");
  });

  it("marks visited node (overrides discovered)", () => {
    const events = [
      event(0, "NODE_DISCOVERED", { nodeId: "A" }),
      event(1, "NODE_VISITED", { nodeId: "A" }),
    ];
    const state = computeVisualState(events, 1);
    expect(state["A"]).toBe("visited");
  });

  it("marks finalized node", () => {
    const events = [
      event(0, "NODE_VISITED", { nodeId: "A" }),
      event(1, "NODE_FINALIZED", { nodeId: "A" }),
    ];
    const state = computeVisualState(events, 1);
    expect(state["A"]).toBe("finalized");
  });

  it("marks edge states correctly", () => {
    const events = [
      event(0, "EDGE_CONSIDERED", { edgeId: "e1" }),
      event(1, "EDGE_RELAXED", { edgeId: "e1" }),
      event(2, "EDGE_REJECTED", { edgeId: "e2" }),
    ];

    const state = computeVisualState(events, 2);
    expect(state["e1"]).toBe("relaxed");
    expect(state["e2"]).toBe("rejected");
  });

  it("marks path nodes on PATH_UPDATED", () => {
    const events = [
      event(0, "NODE_VISITED", { nodeId: "A" }),
      event(1, "NODE_VISITED", { nodeId: "B" }),
      event(2, "PATH_UPDATED", { path: ["A", "B"] }),
    ];

    const state = computeVisualState(events, 2);
    expect(state["A"]).toBe("path");
    expect(state["B"]).toBe("path");
  });

  it("respects currentStep boundary", () => {
    const events = [
      event(0, "NODE_DISCOVERED", { nodeId: "A" }),
      event(1, "NODE_VISITED", { nodeId: "A" }),
      event(2, "NODE_FINALIZED", { nodeId: "A" }),
    ];

    // At step 0, only discovered
    expect(computeVisualState(events, 0)["A"]).toBe("discovered");
    // At step 1, visited
    expect(computeVisualState(events, 1)["A"]).toBe("visited");
    // At step 2, finalized
    expect(computeVisualState(events, 2)["A"]).toBe("finalized");
  });

  it("returns empty state for events that do not affect visuals", () => {
    const events = [
      event(0, "RUN_STARTED", {}),
      event(1, "QUEUE_UPDATED", { items: ["A"] }),
      event(2, "DISTANCE_UPDATED", { nodeId: "A", distance: 0 }),
      event(3, "RUN_COMPLETED", {}),
    ];

    const state = computeVisualState(events, 3);
    expect(Object.keys(state).length).toBe(0);
  });
});
