import type { CanonicalGraph } from "../../../src/types/graph";

/**
 * Build a test graph with the given configuration.
 */
export function buildGraph(
  overrides: Partial<{
    directed: boolean;
    weighted: boolean;
    nodes: { id: string; label: string; x: number; y: number }[];
    edges: { id: string; source: string; target: string; weight?: number }[];
  }> = {}
): CanonicalGraph {
  const nodes = (overrides.nodes ?? [
    { id: "A", label: "A", x: 0, y: 0 },
    { id: "B", label: "B", x: 100, y: 0 },
    { id: "C", label: "C", x: 200, y: 0 },
    { id: "D", label: "D", x: 300, y: 0 },
    { id: "E", label: "E", x: 400, y: 0 },
  ]).map((n) => ({
    id: n.id,
    label: n.label,
    position: { x: n.x, y: n.y },
  }));

  const edges = (overrides.edges ?? [
    { id: "e1", source: "A", target: "B", weight: 1 },
    { id: "e2", source: "A", target: "C", weight: 4 },
    { id: "e3", source: "B", target: "C", weight: 2 },
    { id: "e4", source: "B", target: "D", weight: 5 },
    { id: "e5", source: "C", target: "D", weight: 1 },
    { id: "e6", source: "D", target: "E", weight: 3 },
  ]).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    weight: e.weight ?? null,
    label: null,
  }));

  return {
    schemaVersion: 1,
    id: "graph_test",
    projectId: "project_test",
    config: {
      directed: overrides.directed ?? true,
      weighted: overrides.weighted ?? true,
      allowSelfLoops: false,
      allowParallelEdges: false,
    },
    nodes,
    edges,
    createdAt: "2026-03-27T00:00:00.000Z",
    updatedAt: "2026-03-27T00:00:00.000Z",
  };
}

export function singleNodeGraph(): CanonicalGraph {
  return buildGraph({
    nodes: [{ id: "A", label: "A", x: 0, y: 0 }],
    edges: [],
  });
}

export function disconnectedGraph(): CanonicalGraph {
  return buildGraph({
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
    ],
    edges: [{ id: "e1", source: "A", target: "B", weight: 1 }],
  });
}

export function negativeEdgeGraph(): CanonicalGraph {
  return buildGraph({
    edges: [
      { id: "e1", source: "A", target: "B", weight: 1 },
      { id: "e2", source: "B", target: "C", weight: -3 },
      { id: "e3", source: "A", target: "C", weight: 4 },
    ],
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
    ],
  });
}

export function negativeCycleGraph(): CanonicalGraph {
  return buildGraph({
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
    ],
    edges: [
      { id: "e1", source: "A", target: "B", weight: 1 },
      { id: "e2", source: "B", target: "C", weight: -1 },
      { id: "e3", source: "C", target: "B", weight: -1 },
    ],
  });
}

export function getEventTypes(events: { type: string }[]): string[] {
  return events.map((e) => e.type);
}
