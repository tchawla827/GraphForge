import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";

export const kruskal: AlgorithmFn = ({ graph }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, "Starting Kruskal's MST algorithm")];

  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};

  for (const n of graph.nodes) {
    parent[n.id] = n.id;
    rank[n.id] = 0;
  }

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: string, y: string): boolean {
    const rx = find(x);
    const ry = find(y);
    if (rx === ry) return false;
    if (rank[rx] < rank[ry]) { parent[rx] = ry; }
    else if (rank[rx] > rank[ry]) { parent[ry] = rx; }
    else { parent[ry] = rx; rank[rx]++; }
    return true;
  }

  // Sort edges by weight ascending
  const sortedEdges = [...graph.edges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));

  const mstEdges: string[] = [];
  let totalWeight = 0;
  let edgesConsidered = 0;

  for (const edge of sortedEdges) {
    edgesConsidered++;
    const w = edge.weight ?? 1;

    events.push(
      eb.emit("EDGE_CONSIDERED", { edgeId: edge.id, from: edge.source, to: edge.target, weight: w },
        `Considering edge ${findLabel(edge.source)} — ${findLabel(edge.target)} (weight: ${w})`)
    );

    if (union(edge.source, edge.target)) {
      mstEdges.push(edge.id);
      totalWeight += w;
      events.push(
        eb.emit("EDGE_RELAXED", { edgeId: edge.id, weight: w },
          `Added edge ${findLabel(edge.source)} — ${findLabel(edge.target)} (weight: ${w}) to MST`)
      );
    } else {
      events.push(
        eb.emit("EDGE_REJECTED", { edgeId: edge.id, reason: "would create cycle" },
          `Rejected: ${findLabel(edge.source)} — ${findLabel(edge.target)} would create a cycle`)
      );
    }
  }

  const expectedEdges = graph.nodes.length - 1;
  const isConnected = mstEdges.length >= expectedEdges;
  const warnings: string[] = [];
  if (!isConnected) {
    warnings.push("Graph is disconnected — MST covers the largest connected component only");
  }

  events.push(
    eb.emit("RUN_COMPLETED", { mstEdgeCount: mstEdges.length, totalWeight },
      `Kruskal's algorithm complete — MST has ${mstEdges.length} edge${mstEdges.length !== 1 ? "s" : ""}, total weight: ${totalWeight}`)
  );

  return {
    events,
    result: {
      algorithm: "kruskal",
      status: isConnected ? "success" : "warning",
      summary: `MST total weight: ${totalWeight} (${mstEdges.length} edges)`,
      metrics: {
        visitedNodeCount: graph.nodes.length,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: { mstEdges, totalWeight },
      warnings,
    },
  };

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }
};
