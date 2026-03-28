import { describe, expect, it } from "vitest";
import { prim } from "../../../src/lib/algorithms/prim";
import { buildGraph } from "./helpers";
import type { CanonicalGraph } from "../../../src/types/graph";

// 5-node undirected weighted graph
// A-B(1), A-C(4), B-C(2), B-D(5), C-D(1), D-E(3)
// MST: A-B(1), B-C(2), C-D(1), D-E(3) = total 7
function mstGraph(): CanonicalGraph {
  return buildGraph({
    directed: false,
    weighted: true,
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
      { id: "D", label: "D", x: 300, y: 0 },
      { id: "E", label: "E", x: 400, y: 0 },
    ],
    edges: [
      { id: "e1", source: "A", target: "B", weight: 1 },
      { id: "e2", source: "A", target: "C", weight: 4 },
      { id: "e3", source: "B", target: "C", weight: 2 },
      { id: "e4", source: "B", target: "D", weight: 5 },
      { id: "e5", source: "C", target: "D", weight: 1 },
      { id: "e6", source: "D", target: "E", weight: 3 },
    ],
  });
}

function disconnectedMstGraph(): CanonicalGraph {
  return buildGraph({
    directed: false,
    weighted: true,
    nodes: [
      { id: "A", label: "A", x: 0, y: 0 },
      { id: "B", label: "B", x: 100, y: 0 },
      { id: "C", label: "C", x: 200, y: 0 },
      { id: "D", label: "D", x: 300, y: 0 },
    ],
    edges: [
      { id: "e1", source: "A", target: "B", weight: 1 },
      { id: "e2", source: "A", target: "C", weight: 2 },
      // D is isolated
    ],
  });
}

describe("Prim's Algorithm", () => {
  it("computes MST with correct total weight on connected graph", () => {
    const output = prim({ graph: mstGraph(), config: { algorithm: "prim" } });

    expect(output.result.status).toBe("success");
    expect(output.result.algorithm).toBe("prim");
    expect(output.result.output.totalWeight).toBe(7);
  });

  it("MST has exactly n-1 edges for connected graph", () => {
    const output = prim({ graph: mstGraph(), config: { algorithm: "prim" } });
    const mstEdges = output.result.output.mstEdges as string[];
    expect(mstEdges).toHaveLength(4); // 5 nodes → 4 MST edges
  });

  it("emits EDGE_CONSIDERED, EDGE_RELAXED, EDGE_REJECTED events", () => {
    const output = prim({ graph: mstGraph(), config: { algorithm: "prim" } });
    const types = output.events.map((e) => e.type);

    expect(types).toContain("EDGE_CONSIDERED");
    expect(types).toContain("EDGE_RELAXED");
    expect(types).toContain("EDGE_REJECTED");
    expect(types).toContain("NODE_FINALIZED");
  });

  it("starts with RUN_STARTED and ends with RUN_COMPLETED", () => {
    const output = prim({ graph: mstGraph(), config: { algorithm: "prim" } });
    expect(output.events[0].type).toBe("RUN_STARTED");
    expect(output.events[output.events.length - 1].type).toBe("RUN_COMPLETED");
  });

  it("returns warning status for disconnected graph", () => {
    const output = prim({ graph: disconnectedMstGraph(), config: { algorithm: "prim" } });
    expect(output.result.status).toBe("warning");
    expect(output.result.warnings.length).toBeGreaterThan(0);
  });
});
