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
});
