import { describe, it, expect } from "vitest";
import { parseAdjacencyMatrix } from "@/lib/parsers/adjacencyMatrix";

describe("parseAdjacencyMatrix", () => {
  it("parses matrix with header row — correct node labels and edges", () => {
    const input = "A  B  C\n0  4  2\n0  0  7\n0  0  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const labels = result.data.nodes.map((n) => n.label);
    expect(labels).toEqual(["A", "B", "C"]);
    expect(result.data.edges).toHaveLength(3);
    const edgeWeights = result.data.edges.map((e) => e.weight);
    expect(edgeWeights).toContain(4);
    expect(edgeWeights).toContain(2);
    expect(edgeWeights).toContain(7);
  });

  it("parses matrix without header — auto-labels n1, n2, ...", () => {
    const input = "0  4  2\n0  0  7\n0  0  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const labels = result.data.nodes.map((n) => n.label);
    expect(labels).toEqual(["n1", "n2", "n3"]);
  });

  it("correctly excludes zero cells (no edge)", () => {
    const input = "0  5\n3  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.edges).toHaveLength(2);
  });

  it("treats ∞ and Inf as no edge", () => {
    const input = "∞  4\n0  ∞";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.edges).toHaveLength(1);
    expect(result.data.edges[0].weight).toBe(4);
  });

  it("stores negative weights as-is", () => {
    const input = "0   -3\n-5  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const weights = result.data.edges.map((e) => e.weight);
    expect(weights).toContain(-3);
    expect(weights).toContain(-5);
  });

  it("returns ok:false for non-square matrix", () => {
    // 3 labels but only 2 data rows → not square
    const input = "A  B  C\n0  1  0\n1  0  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/not square/i);
  });

  it("returns ok:false for row with wrong column count", () => {
    const input = "0  1  2\n0  1\n0  0  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(false);
  });

  it("returns ok:false for empty input", () => {
    const result = parseAdjacencyMatrix("");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/empty/i);
  });

  it("handles matrix with row labels matching header", () => {
    const input = "A  B\nA  0  4\nB  2  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes.map((n) => n.label)).toEqual(["A", "B"]);
    expect(result.data.edges).toHaveLength(2);
  });

  it("ignores comment lines starting with #", () => {
    const input = "# matrix example\nA  B\n# row comment\nA  0  4\nB  2  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.edges).toHaveLength(2);
  });

  it("rejects row labels that do not match the header", () => {
    const input = "A  B\nZ  0  4\nB  2  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/does not match header/i);
  });

  it("rejects input with more than 200 nodes", () => {
    const n = 201;
    const labels = Array.from({ length: n }, (_, i) => `n${i + 1}`).join("  ");
    const row = Array.from({ length: n }, () => "0").join("  ");
    const rows = Array.from({ length: n }, () => row).join("\n");
    const input = labels + "\n" + rows;
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/200 nodes/);
  });

  it("returns ok:false for invalid cell value", () => {
    // First row is all-numeric so no header is detected; second row has 'x' as a cell
    const input = "0  1\nx  0";
    const result = parseAdjacencyMatrix(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toMatch(/invalid cell/i);
  });

  it("1x1 matrix with no edges", () => {
    const result = parseAdjacencyMatrix("0");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.nodes).toHaveLength(1);
    expect(result.data.edges).toHaveLength(0);
  });
});
