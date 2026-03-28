import { describe, expect, it } from "vitest";
import { dfs } from "../../../src/lib/algorithms/dfs";
import { buildGraph, singleNodeGraph, disconnectedGraph, getEventTypes } from "./helpers";

describe("DFS", () => {
  it("visits all reachable nodes from source", () => {
    const graph = buildGraph();
    const output = dfs({ graph, config: { algorithm: "dfs", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");

    const visited = output.events
      .filter((e) => e.type === "NODE_VISITED")
      .map((e) => e.payload.nodeId);

    expect(visited[0]).toBe("A");
    expect(visited).toContain("B");
    expect(visited).toContain("C");
    expect(visited).toContain("D");
    expect(visited).toContain("E");
  });

  it("uses STACK_UPDATED events (not QUEUE_UPDATED)", () => {
    const graph = buildGraph();
    const output = dfs({ graph, config: { algorithm: "dfs", sourceNodeId: "A" } });
    const types = getEventTypes(output.events);

    expect(types).toContain("STACK_UPDATED");
    expect(types).not.toContain("QUEUE_UPDATED");
  });

  it("tracks who discovered each node and updates the stack live", () => {
    const graph = buildGraph();
    const output = dfs({ graph, config: { algorithm: "dfs", sourceNodeId: "A" } });

    const discoveredB = output.events.find(
      (event) =>
        event.type === "NODE_DISCOVERED" &&
        event.payload.nodeId === "B"
    );
    const stackUpdates = output.events.filter(
      (event) => event.type === "STACK_UPDATED"
    );

    expect(discoveredB?.payload.from).toBe("A");
    expect(discoveredB?.payload.fromLabel).toBe("A");
    expect(stackUpdates.length).toBeGreaterThan(2);
    expect(stackUpdates.some((event) => event.message.includes("Pushed B"))).toBe(
      true
    );
  });

  it("starts with RUN_STARTED and ends with RUN_COMPLETED", () => {
    const graph = buildGraph();
    const output = dfs({ graph, config: { algorithm: "dfs", sourceNodeId: "A" } });

    expect(output.events[0].type).toBe("RUN_STARTED");
    expect(output.events[output.events.length - 1].type).toBe("RUN_COMPLETED");
  });

  it("handles single-node graph", () => {
    const graph = singleNodeGraph();
    const output = dfs({ graph, config: { algorithm: "dfs", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");
    expect(output.result.metrics.visitedNodeCount).toBe(1);
  });

  it("handles disconnected graph", () => {
    const graph = disconnectedGraph();
    const output = dfs({ graph, config: { algorithm: "dfs", sourceNodeId: "A" } });

    const visited = output.events
      .filter((e) => e.type === "NODE_VISITED")
      .map((e) => e.payload.nodeId);

    expect(visited).toContain("A");
    expect(visited).toContain("B");
    expect(visited).not.toContain("C");
  });

  it("does not rediscover the same node through converging edges", () => {
    const graph = buildGraph({
      nodes: [
        { id: "A", label: "A", x: 0, y: 0 },
        { id: "B", label: "B", x: 100, y: 0 },
        { id: "C", label: "C", x: 200, y: 0 },
        { id: "D", label: "D", x: 300, y: 0 },
      ],
      edges: [
        { id: "e1", source: "A", target: "B", weight: 1 },
        { id: "e2", source: "A", target: "C", weight: 1 },
        { id: "e3", source: "B", target: "D", weight: 1 },
        { id: "e4", source: "C", target: "D", weight: 1 },
      ],
    });
    const output = dfs({ graph, config: { algorithm: "dfs", sourceNodeId: "A" } });

    const discoveredD = output.events.filter(
      (e) => e.type === "NODE_DISCOVERED" && e.payload.nodeId === "D"
    );

    expect(discoveredD).toHaveLength(1);
  });
});
