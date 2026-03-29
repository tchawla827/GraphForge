import { describe, expect, it } from "vitest";
import { astar } from "../../../src/lib/algorithms/astar";
import { validateAlgorithmInput } from "../../../src/lib/algorithms/validate";
import { buildGraph, negativeEdgeGraph } from "./helpers";

describe("A*", () => {
  it("finds correct path on a 4-node grid graph with euclidean heuristic", () => {
    const graph = buildGraph({
      nodes: [
        { id: "A", label: "A", x: 0, y: 0 },
        { id: "B", label: "B", x: 100, y: 0 },
        { id: "C", label: "C", x: 0, y: 100 },
        { id: "D", label: "D", x: 100, y: 100 },
      ],
      edges: [
        { id: "e1", source: "A", target: "B", weight: 1 },
        { id: "e2", source: "A", target: "C", weight: 1 },
        { id: "e3", source: "B", target: "D", weight: 1 },
        { id: "e4", source: "C", target: "D", weight: 1 },
      ],
    });

    const output = astar({
      graph,
      config: {
        algorithm: "astar",
        sourceNodeId: "A",
        targetNodeId: "D",
        heuristic: "euclidean",
      },
    });

    expect(output.result.status).toBe("success");
    const path = output.result.output.path as string[];
    expect(path[0]).toBe("A");
    expect(path[path.length - 1]).toBe("D");
    expect(path.length).toBe(3); // A → B → D or A → C → D
  });

  it("validation rejects missing target", () => {
    const graph = buildGraph();
    const result = validateAlgorithmInput(graph, {
      algorithm: "astar",
      sourceNodeId: "A",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("target");
    }
  });

  it("validation rejects same source and target", () => {
    const graph = buildGraph();
    const result = validateAlgorithmInput(graph, {
      algorithm: "astar",
      sourceNodeId: "A",
      targetNodeId: "A",
    });

    expect(result.ok).toBe(false);
  });

  it("validation rejects negative edge weights", () => {
    const graph = negativeEdgeGraph();
    const result = validateAlgorithmInput(graph, {
      algorithm: "astar",
      sourceNodeId: "A",
      targetNodeId: "C",
      heuristic: "euclidean",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("negative");
    }
  });

  it("handles unreachable target", () => {
    const graph = buildGraph({
      nodes: [
        { id: "A", label: "A", x: 0, y: 0 },
        { id: "B", label: "B", x: 100, y: 0 },
        { id: "C", label: "C", x: 200, y: 0 },
      ],
      edges: [{ id: "e1", source: "A", target: "B", weight: 1 }],
    });

    const output = astar({
      graph,
      config: {
        algorithm: "astar",
        sourceNodeId: "A",
        targetNodeId: "C",
        heuristic: "euclidean",
      },
    });

    expect(output.result.status).toBe("success");
    expect(output.result.output.path).toBeUndefined();
    expect(output.result.summary).toContain("could not find");
  });

  it("supports zero heuristic (behaves like Dijkstra)", () => {
    const graph = buildGraph();
    const output = astar({
      graph,
      config: {
        algorithm: "astar",
        sourceNodeId: "A",
        targetNodeId: "E",
        heuristic: "zero",
      },
    });

    expect(output.result.status).toBe("success");
    expect(output.result.output.heuristic).toBe("zero");
    expect(output.result.output.path).toBeDefined();
  });
});
