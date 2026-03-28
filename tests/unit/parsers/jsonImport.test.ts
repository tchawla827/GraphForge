import { describe, it, expect } from "vitest";
import { parseJsonImport } from "@/lib/parsers/jsonImport";
import type { CanonicalGraph } from "@/types/graph";

function makeGraph(overrides?: Partial<CanonicalGraph>): CanonicalGraph {
  return {
    schemaVersion: 1,
    id: "graph_1",
    projectId: "project_1",
    config: {
      directed: true,
      weighted: false,
      allowSelfLoops: false,
      allowParallelEdges: false,
    },
    nodes: [
      { id: "n1", label: "A", position: { x: 0, y: 0 } },
      { id: "n2", label: "B", position: { x: 150, y: 0 } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("parseJsonImport", () => {
  it("accepts a valid CanonicalGraph JSON", () => {
    const graph = makeGraph();
    const result = parseJsonImport(JSON.stringify(graph));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(2);
    expect(result.data.edges).toHaveLength(1);
  });

  it("returns ok:false for invalid JSON syntax", () => {
    const result = parseJsonImport("{ not json }");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/invalid json/i);
  });

  it("returns ok:false for wrong schemaVersion", () => {
    const graph = { ...makeGraph(), schemaVersion: 2 };
    const result = parseJsonImport(JSON.stringify(graph));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/unsupported schema version/i);
  });

  it("returns ok:false when schemaVersion is missing", () => {
    const rest = { ...makeGraph() } as Partial<CanonicalGraph>;
    delete rest.schemaVersion;
    const result = parseJsonImport(JSON.stringify(rest));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/schemaVersion/i);
  });

  it("returns ok:false for missing required fields (no nodes array)", () => {
    const rest = { ...makeGraph() } as Partial<CanonicalGraph>;
    delete rest.nodes;
    const result = parseJsonImport(JSON.stringify(rest));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns ok:false for missing required fields (no config)", () => {
    const rest = { ...makeGraph() } as Partial<CanonicalGraph>;
    delete rest.config;
    const result = parseJsonImport(JSON.stringify(rest));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns ok:false for empty input", () => {
    const result = parseJsonImport("");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/invalid json/i);
  });

  it("returns ok:false when input is not an object", () => {
    const result = parseJsonImport('"just a string"');
    expect(result.ok).toBe(false);
  });

  it("returns ok:false for node with empty id", () => {
    const graph = makeGraph({
      nodes: [{ id: "", label: "Bad", position: { x: 0, y: 0 } }],
      edges: [],
    });
    const result = parseJsonImport(JSON.stringify(graph));
    expect(result.ok).toBe(false);
  });

  it("returns ok:false when edge references non-existent node", () => {
    const graph = makeGraph({
      edges: [{ id: "e1", source: "n1", target: "MISSING" }],
    });
    const result = parseJsonImport(JSON.stringify(graph));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => /MISSING/.test(e.message))).toBe(true);
  });

  it("returns error paths from Zod as context strings", () => {
    const graph = makeGraph({
      nodes: [{ id: "", label: "X", position: { x: 0, y: 0 } }],
      edges: [],
    });
    const result = parseJsonImport(JSON.stringify(graph));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const hasContext = result.errors.some((e) => e.context && e.context.length > 0);
    expect(hasContext).toBe(true);
  });

  it("accepts a graph with weighted edges", () => {
    const graph = makeGraph({
      config: {
        directed: true,
        weighted: true,
        allowSelfLoops: false,
        allowParallelEdges: false,
      },
      edges: [{ id: "e1", source: "n1", target: "n2", weight: 7 }],
    });
    const result = parseJsonImport(JSON.stringify(graph));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.edges[0].weight).toBe(7);
  });
});
