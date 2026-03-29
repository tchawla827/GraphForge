import { describe, expect, it } from "vitest";
import { bellmanFord } from "../../../src/lib/algorithms/bellmanFord";
import { buildGraph, singleNodeGraph, disconnectedGraph, negativeEdgeGraph, negativeCycleGraph, getEventTypes } from "./helpers";

describe("Bellman-Ford", () => {
  it("computes correct shortest distances", () => {
    const graph = buildGraph();
    const output = bellmanFord({ graph, config: { algorithm: "bellman_ford", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");

    const distances = output.result.output.distances as Record<string, number>;
    expect(distances["A"]).toBe(0);
    expect(distances["B"]).toBe(1);
    expect(distances["C"]).toBe(3);
    expect(distances["D"]).toBe(4);
    expect(distances["E"]).toBe(7);
  });

  it("handles negative edge weights correctly", () => {
    const graph = negativeEdgeGraph();
    const output = bellmanFord({ graph, config: { algorithm: "bellman_ford", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");

    const distances = output.result.output.distances as Record<string, number>;
    expect(distances["A"]).toBe(0);
    expect(distances["B"]).toBe(1);
    expect(distances["C"]).toBe(-2); // A→B (1) + B→C (-3) = -2
  });

  it("detects negative cycle and returns warning status", () => {
    const graph = negativeCycleGraph();
    const output = bellmanFord({ graph, config: { algorithm: "bellman_ford", sourceNodeId: "A" } });

    expect(output.result.status).toBe("warning");
    expect(output.result.output.hasNegativeCycle).toBe(true);

    const types = getEventTypes(output.events);
    expect(types).toContain("CYCLE_DETECTED");
    expect(types).toContain("RUN_WARNING");
  });

  it("handles single-node graph", () => {
    const graph = singleNodeGraph();
    const output = bellmanFord({ graph, config: { algorithm: "bellman_ford", sourceNodeId: "A" } });

    expect(output.result.status).toBe("success");
    expect(output.result.metrics.visitedNodeCount).toBe(1);
  });

  it("handles disconnected graph", () => {
    const graph = disconnectedGraph();
    const output = bellmanFord({ graph, config: { algorithm: "bellman_ford", sourceNodeId: "A" } });

    expect(output.result.status).toBe("warning");
    const distances = output.result.output.distances as Record<string, number>;
    expect(distances["A"]).toBe(0);
    expect(distances["B"]).toBe(1);
    expect(distances["C"]).toBeUndefined();
    expect(output.result.output.unreachableNodeIds).toEqual(["C"]);
  });

  it("reconstructs path to target when specified", () => {
    const graph = buildGraph();
    const output = bellmanFord({
      graph,
      config: { algorithm: "bellman_ford", sourceNodeId: "A", targetNodeId: "E" },
    });

    expect(output.result.output.path).toEqual(["A", "B", "C", "D", "E"]);
    expect(output.result.output.pathEdgeIds).toEqual(["e1", "e3", "e5", "e6"]);
  });

  it("returns warning when target is unreachable", () => {
    const graph = disconnectedGraph();
    const output = bellmanFord({
      graph,
      config: { algorithm: "bellman_ford", sourceNodeId: "A", targetNodeId: "C" },
    });

    expect(output.result.status).toBe("warning");
    expect(output.result.output.path).toBeUndefined();
    expect(output.result.warnings.some((warning) => warning.includes("Target C is unreachable"))).toBe(true);
  });
});
