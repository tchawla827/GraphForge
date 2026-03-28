import { describe, expect, it } from "vitest";
import { dijkstra } from "../../../src/lib/algorithms/dijkstra";
import { validateAlgorithmInput } from "../../../src/lib/algorithms/validate";
import { buildGraph, singleNodeGraph, disconnectedGraph, negativeEdgeGraph } from "./helpers";

describe("Dijkstra", () => {
  it("computes correct shortest distances on a known graph", () => {
    const graph = buildGraph();
    const output = dijkstra({ graph, config: { algorithm: "dijkstra", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");

    const distances = output.result.output.distances as Record<string, number>;
    expect(distances["A"]).toBe(0);
    expect(distances["B"]).toBe(1); // A→B: 1
    expect(distances["C"]).toBe(3); // A→B→C: 1+2=3
    expect(distances["D"]).toBe(4); // A→B→C→D: 1+2+1=4
    expect(distances["E"]).toBe(7); // A→B→C→D→E: 1+2+1+3=7
  });

  it("finds shortest path when target specified", () => {
    const graph = buildGraph();
    const output = dijkstra({
      graph,
      config: { algorithm: "dijkstra", sourceNodeId: "A", targetNodeId: "E" },
    });

    expect(output.result.output.path).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("emits EDGE_RELAXED and NODE_FINALIZED events", () => {
    const graph = buildGraph();
    const output = dijkstra({ graph, config: { algorithm: "dijkstra", sourceNodeId: "A" } });

    const types = output.events.map((e) => e.type);
    expect(types).toContain("EDGE_RELAXED");
    expect(types).toContain("NODE_FINALIZED");
    expect(types).toContain("PRIORITY_QUEUE_UPDATED");
  });

  it("validation rejects negative edge weights", () => {
    const graph = negativeEdgeGraph();
    const result = validateAlgorithmInput(graph, { algorithm: "dijkstra", sourceNodeId: "A" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("negative");
    }
  });

  it("handles single-node graph", () => {
    const graph = singleNodeGraph();
    const output = dijkstra({ graph, config: { algorithm: "dijkstra", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");
    expect(output.result.metrics.visitedNodeCount).toBe(1);
  });

  it("handles disconnected graph — unreachable nodes have no distance", () => {
    const graph = disconnectedGraph();
    const output = dijkstra({ graph, config: { algorithm: "dijkstra", sourceNodeId: "A" } });

    const distances = output.result.output.distances as Record<string, number>;
    expect(distances["A"]).toBe(0);
    expect(distances["B"]).toBe(1);
    expect(distances["C"]).toBeUndefined();
  });
});
