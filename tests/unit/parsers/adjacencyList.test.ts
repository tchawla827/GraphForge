import { describe, it, expect } from "vitest";
import { parseAdjacencyList } from "@/lib/parsers/adjacencyList";

describe("parseAdjacencyList", () => {
  it("parses weighted colon format and returns correct node/edge counts and weights", () => {
    const result = parseAdjacencyList("A: B(4), C(2)\nB: D(7)");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(4); // A, B, C, D
    expect(result.data.edges).toHaveLength(3);
    const edgeWeights = result.data.edges.map((e) => e.weight);
    expect(edgeWeights).toContain(4);
    expect(edgeWeights).toContain(2);
    expect(edgeWeights).toContain(7);
  });

  it("parses unweighted colon format — edges have weight null", () => {
    const result = parseAdjacencyList("A: B, C\nB: C");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(3);
    expect(result.data.edges).toHaveLength(3);
    for (const edge of result.data.edges) {
      expect(edge.weight).toBeNull();
    }
    expect(result.data.config.weighted).toBe(false);
  });

  it("parses arrow format weighted", () => {
    const result = parseAdjacencyList("A -> B: 10\nB -> C: 5");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(3);
    expect(result.data.edges).toHaveLength(2);
    expect(result.data.edges[0].weight).toBe(10);
    expect(result.data.edges[1].weight).toBe(5);
  });

  it("parses arrow format unweighted", () => {
    const result = parseAdjacencyList("A -> B\nB -> C");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const edge of result.data.edges) {
      expect(edge.weight).toBeNull();
    }
  });

  it("parses space-separated format", () => {
    const result = parseAdjacencyList("A B 4\nB C 7");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(3);
    expect(result.data.edges[0].weight).toBe(4);
    expect(result.data.edges[1].weight).toBe(7);
  });

  it("returns ok:false for non-numeric weight", () => {
    const result = parseAdjacencyList("A: B(xyz)");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/non-numeric/i);
  });

  it("rejects malformed space-separated lines with extra tokens", () => {
    const result = parseAdjacencyList("A B 4 extra");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/malformed/i);
  });

  it("returns ok:false for empty input", () => {
    const result = parseAdjacencyList("");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/empty/i);
  });

  it("returns ok:false for whitespace-only input", () => {
    const result = parseAdjacencyList("   \n  \n  ");
    expect(result.ok).toBe(false);
  });

  it("handles a single node with no edges", () => {
    const result = parseAdjacencyList("A:");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(1);
    expect(result.data.edges).toHaveLength(0);
  });

  it("handles self-loops", () => {
    const result = parseAdjacencyList("A: A(5)");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(1);
    expect(result.data.edges).toHaveLength(1);
    const edge = result.data.edges[0];
    expect(edge.source).toBe(edge.target);
  });

  it("includes line numbers in errors", () => {
    const result = parseAdjacencyList("A: B(4)\nX: Y(bad)");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const err = result.errors[0];
    expect(err.line).toBe(2);
  });

  it("ignores comment lines starting with #", () => {
    const result = parseAdjacencyList("# This is a comment\nA: B(3)");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(2);
  });

  it("rejects input with more than 200 nodes", () => {
    const lines = Array.from({ length: 201 }, (_, i) => `n${i}: n${i + 1}`).join("\n");
    const result = parseAdjacencyList(lines);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/200 nodes/);
  });

  it("returns weighted:true when any edge has a weight", () => {
    const result = parseAdjacencyList("A: B(5)");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.config.weighted).toBe(true);
  });

  it("auto-generates positions without overlap for multi-node graphs", () => {
    const result = parseAdjacencyList("A: B\nB: C\nC: D");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const positions = result.data.nodes.map((n) => `${n.position.x},${n.position.y}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(result.data.nodes.length);
  });
});
