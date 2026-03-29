import { describe, expect, it } from "vitest";
import { topologicalSort } from "../../../src/lib/algorithms/topologicalSort";
import { buildGraph } from "./helpers";
import type { CanonicalGraph } from "../../../src/types/graph";

function makeDag(): CanonicalGraph {
  return buildGraph({
    directed: true,
    weighted: false,
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
      { id: "D", label: "D", x: 300, y: 0 },
      { id: "E", label: "E", x: 400, y: 0 },
    ],
    edges: [
      { id: "e1", source: "A", target: "B" },
      { id: "e2", source: "A", target: "C" },
      { id: "e3", source: "B", target: "D" },
      { id: "e4", source: "C", target: "D" },
      { id: "e5", source: "D", target: "E" },
    ],
  });
}

function makeCyclicGraph(): CanonicalGraph {
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

describe("Topological Sort", () => {
  it("returns success and correct order for a valid DAG", () => {
    const graph = makeDag();
    const output = topologicalSort({ graph, config: { algorithm: "topological_sort" } });

    expect(output.result.status).toBe("success");
    expect(output.result.algorithm).toBe("topological_sort");

    const order = output.result.output.order as string[];
    expect(order).toHaveLength(5);

    // A must come before B and C
    expect(order.indexOf("A")).toBeLessThan(order.indexOf("B"));
    expect(order.indexOf("A")).toBeLessThan(order.indexOf("C"));
    // B and C must come before D
    expect(order.indexOf("B")).toBeLessThan(order.indexOf("D"));
    expect(order.indexOf("C")).toBeLessThan(order.indexOf("D"));
    // D must come before E
    expect(order.indexOf("D")).toBeLessThan(order.indexOf("E"));
  });

  it("emits RUN_STARTED and RUN_COMPLETED", () => {
    const graph = makeDag();
    const output = topologicalSort({ graph, config: { algorithm: "topological_sort" } });

    expect(output.events[0].type).toBe("RUN_STARTED");
    expect(output.events[output.events.length - 1].type).toBe("RUN_COMPLETED");
  });

  it("emits NODE_DISCOVERED and NODE_FINALIZED events", () => {
    const graph = makeDag();
    const output = topologicalSort({ graph, config: { algorithm: "topological_sort" } });
    const types = output.events.map((e) => e.type);

    expect(types).toContain("NODE_DISCOVERED");
    expect(types).toContain("NODE_FINALIZED");
  });

  it("emits CYCLE_DETECTED and returns error status for cyclic graph", () => {
    const graph = makeCyclicGraph();
    const output = topologicalSort({ graph, config: { algorithm: "topological_sort" } });

    expect(output.result.status).toBe("error");
    expect(output.result.summary).toContain("cycle");

    const cycleEvent = output.events.find((e) => e.type === "CYCLE_DETECTED");
    expect(cycleEvent?.payload.cycle).toEqual(["A", "B", "C"]);
  });

  it("partial order in output for cyclic graph", () => {
    const graph = makeCyclicGraph();
    const output = topologicalSort({ graph, config: { algorithm: "topological_sort" } });
    const order = output.result.output.order as string[];
    expect(order.length).toBeLessThan(3);
  });

  it("handles single-node graph", () => {
    const graph = buildGraph({
      directed: true,
      nodes: [{ id: "A", label: "A", x: 0, y: 0 }],
      edges: [],
    });
    const output = topologicalSort({ graph, config: { algorithm: "topological_sort" } });

    expect(output.result.status).toBe("success");
    expect(output.result.output.order).toEqual(["A"]);
  });
});
