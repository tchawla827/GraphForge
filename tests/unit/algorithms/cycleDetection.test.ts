import { describe, expect, it } from "vitest";
import { cycleDetection } from "../../../src/lib/algorithms/cycleDetection";
import { buildGraph } from "./helpers";
import type { CanonicalGraph } from "../../../src/types/graph";

function directedCyclic(): CanonicalGraph {
  return buildGraph({
    directed: true,
    weighted: false,
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
    ],
    edges: [
      { id: "e1", source: "A", target: "B" },
      { id: "e2", source: "B", target: "C" },
      { id: "e3", source: "C", target: "A" },
    ],
  });
}

function directedAcyclic(): CanonicalGraph {
  return buildGraph({
    directed: true,
    weighted: false,
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
    ],
    edges: [
      { id: "e1", source: "A", target: "B" },
      { id: "e2", source: "A", target: "C" },
    ],
  });
}

function undirectedCyclic(): CanonicalGraph {
  return buildGraph({
    directed: false,
    weighted: false,
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
    ],
    edges: [
      { id: "e1", source: "A", target: "B" },
      { id: "e2", source: "B", target: "C" },
      { id: "e3", source: "C", target: "A" },
    ],
  });
}

function undirectedAcyclic(): CanonicalGraph {
  return buildGraph({
    directed: false,
    weighted: false,
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
    ],
    edges: [
      { id: "e1", source: "A", target: "B" },
      { id: "e2", source: "B", target: "C" },
    ],
  });
}

describe("Cycle Detection", () => {
  describe("directed graphs (DFS)", () => {
    it("detects cycle in directed cyclic graph", () => {
      const output = cycleDetection({ graph: directedCyclic(), config: { algorithm: "cycle_detection" } });

      expect(output.result.status).toBe("success");
      expect(output.result.output.hasCycle).toBe(true);
      expect(output.result.output.cycle).toBeDefined();

      const cycleEvent = output.events.find((e) => e.type === "CYCLE_DETECTED");
      expect(cycleEvent).toBeDefined();
      expect(cycleEvent?.payload.cycle).toEqual(output.result.output.cycle);
    });

    it("result message says 'directed graph' when cycle found", () => {
      const output = cycleDetection({ graph: directedCyclic(), config: { algorithm: "cycle_detection" } });
      expect(output.result.summary).toContain("directed graph");
    });

    it("reports no cycle in acyclic directed graph", () => {
      const output = cycleDetection({ graph: directedAcyclic(), config: { algorithm: "cycle_detection" } });

      expect(output.result.output.hasCycle).toBe(false);
      const types = output.events.map((e) => e.type);
      expect(types).not.toContain("CYCLE_DETECTED");
    });

    it("result message says 'directed graph' when no cycle", () => {
      const output = cycleDetection({ graph: directedAcyclic(), config: { algorithm: "cycle_detection" } });
      expect(output.result.summary).toContain("directed graph");
    });
  });

  describe("undirected graphs (union-find)", () => {
    it("detects cycle in undirected cyclic graph", () => {
      const output = cycleDetection({ graph: undirectedCyclic(), config: { algorithm: "cycle_detection" } });

      expect(output.result.output.hasCycle).toBe(true);
      const cycleEvent = output.events.find((e) => e.type === "CYCLE_DETECTED");
      expect(cycleEvent?.payload.cycle).toEqual(output.result.output.cycle);
    });

    it("result message says 'undirected graph' when cycle found", () => {
      const output = cycleDetection({ graph: undirectedCyclic(), config: { algorithm: "cycle_detection" } });
      expect(output.result.summary).toContain("undirected graph");
    });

    it("reports no cycle in acyclic undirected graph", () => {
      const output = cycleDetection({ graph: undirectedAcyclic(), config: { algorithm: "cycle_detection" } });
      expect(output.result.output.hasCycle).toBe(false);
    });

    it("result message says 'undirected graph' when no cycle", () => {
      const output = cycleDetection({ graph: undirectedAcyclic(), config: { algorithm: "cycle_detection" } });
      expect(output.result.summary).toContain("undirected graph");
    });
  });

  it("starts with RUN_STARTED and ends with RUN_COMPLETED", () => {
    const output = cycleDetection({ graph: directedCyclic(), config: { algorithm: "cycle_detection" } });
    expect(output.events[0].type).toBe("RUN_STARTED");
    expect(output.events[output.events.length - 1].type).toBe("RUN_COMPLETED");
  });
});
