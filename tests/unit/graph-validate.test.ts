import { describe, expect, it } from "vitest";
import { CanonicalGraphSchema } from "../../src/lib/graph/validate";

function buildGraph() {
  return {
    schemaVersion: 1 as const,
    id: "graph_1",
    projectId: "project_1",
    config: {
      directed: true,
      weighted: false,
      allowSelfLoops: false,
      allowParallelEdges: false,
    },
    nodes: [
      { id: "a", label: "A", position: { x: 0, y: 0 } },
      { id: "b", label: "B", position: { x: 100, y: 100 } },
    ],
    edges: [
      { id: "e1", source: "a", target: "b", weight: null, label: null },
    ],
    createdAt: "2026-03-27T00:00:00.000Z",
    updatedAt: "2026-03-27T00:00:00.000Z",
  };
}

describe("CanonicalGraphSchema", () => {
  it("accepts a valid graph", () => {
    const graph = buildGraph();

    const result = CanonicalGraphSchema.safeParse(graph);

    expect(result.success).toBe(true);
  });

  it("rejects edges that reference missing nodes", () => {
    const graph = buildGraph();
    graph.edges = [
      { id: "e1", source: "a", target: "missing", weight: null, label: null },
    ];

    const result = CanonicalGraphSchema.safeParse(graph);

    expect(result.success).toBe(false);
  });

  it("rejects self-loops when disabled", () => {
    const graph = buildGraph();
    graph.edges = [
      { id: "e1", source: "a", target: "a", weight: null, label: null },
    ];

    const result = CanonicalGraphSchema.safeParse(graph);

    expect(result.success).toBe(false);
  });

  it("rejects parallel edges when disabled on undirected graphs", () => {
    const graph = buildGraph();
    graph.config.directed = false;
    graph.edges = [
      { id: "e1", source: "a", target: "b", weight: null, label: null },
      { id: "e2", source: "b", target: "a", weight: null, label: null },
    ];

    const result = CanonicalGraphSchema.safeParse(graph);

    expect(result.success).toBe(false);
  });
});
