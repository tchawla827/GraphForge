import { describe, expect, it } from "vitest";
import { bfs } from "../../../src/lib/algorithms/bfs";
import { buildGraph, singleNodeGraph, disconnectedGraph, getEventTypes } from "./helpers";

describe("BFS", () => {
  it("visits nodes in correct BFS order on a 5-node directed graph", () => {
    const graph = buildGraph();
    const output = bfs({ graph, config: { algorithm: "bfs", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");
    expect(output.result.algorithm).toBe("bfs");

    const visited = output.events
      .filter((e) => e.type === "NODE_VISITED")
      .map((e) => e.payload.nodeId);

    // BFS from A: A first, then B and C (neighbors), then D, then E
    expect(visited[0]).toBe("A");
    expect(visited).toContain("B");
    expect(visited).toContain("C");

    // B and C before D and E
    const bIdx = visited.indexOf("B");
    const cIdx = visited.indexOf("C");
    const dIdx = visited.indexOf("D");
    expect(bIdx).toBeLessThan(dIdx);
    expect(cIdx).toBeLessThan(dIdx);
  });

  it("emits NODE_DISCOVERED events", () => {
    const graph = buildGraph();
    const output = bfs({ graph, config: { algorithm: "bfs", sourceNodeId: "A" } });

    const discovered = output.events
      .filter((e) => e.type === "NODE_DISCOVERED")
      .map((e) => e.payload.nodeId);

    expect(discovered).toContain("A");
    expect(discovered).toContain("B");
    expect(discovered).toContain("C");
  });

  it("uses QUEUE_UPDATED events (not STACK_UPDATED)", () => {
    const graph = buildGraph();
    const output = bfs({ graph, config: { algorithm: "bfs", sourceNodeId: "A" } });
    const types = getEventTypes(output.events);

    expect(types).toContain("QUEUE_UPDATED");
    expect(types).not.toContain("STACK_UPDATED");
  });

  it("tracks who discovered each node and updates the queue live", () => {
    const graph = buildGraph();
    const output = bfs({ graph, config: { algorithm: "bfs", sourceNodeId: "A" } });

    const discoveredB = output.events.find(
      (event) =>
        event.type === "NODE_DISCOVERED" &&
        event.payload.nodeId === "B"
    );
    const queueUpdates = output.events.filter(
      (event) => event.type === "QUEUE_UPDATED"
    );

    expect(discoveredB?.payload.from).toBe("A");
    expect(discoveredB?.payload.fromLabel).toBe("A");
    expect(queueUpdates.length).toBeGreaterThan(2);
    expect(queueUpdates.some((event) => event.message.includes("Enqueued B"))).toBe(
      true
    );
  });

  it("starts with RUN_STARTED and ends with RUN_COMPLETED", () => {
    const graph = buildGraph();
    const output = bfs({ graph, config: { algorithm: "bfs", sourceNodeId: "A" } });

    expect(output.events[0].type).toBe("RUN_STARTED");
    expect(output.events[output.events.length - 1].type).toBe("RUN_COMPLETED");
  });

  it("handles single-node graph", () => {
    const graph = singleNodeGraph();
    const output = bfs({ graph, config: { algorithm: "bfs", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");
    expect(output.result.metrics.visitedNodeCount).toBe(1);
  });

  it("handles disconnected graph (unreachable nodes absent)", () => {
    const graph = disconnectedGraph();
    const output = bfs({ graph, config: { algorithm: "bfs", sourceNodeId: "A" } });

    expect(output.result.status).toBe("warning");
    const visited = output.events
      .filter((e) => e.type === "NODE_VISITED")
      .map((e) => e.payload.nodeId);

    expect(visited).toContain("A");
    expect(visited).toContain("B");
    expect(visited).not.toContain("C");
    expect(output.result.output.unreachableNodeIds).toEqual(["C"]);
  });

  it("traverses undirected graph in both directions", () => {
    const graph = buildGraph({ directed: false });
    const output = bfs({ graph, config: { algorithm: "bfs", sourceNodeId: "E" } });

    const visited = output.events
      .filter((e) => e.type === "NODE_VISITED")
      .map((e) => e.payload.nodeId);

    // From E, should reach all nodes in undirected graph
    expect(visited.length).toBe(5);
  });
});
