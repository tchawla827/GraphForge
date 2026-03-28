import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";

export const prim: AlgorithmFn = ({ graph }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, "Starting Prim's MST algorithm")];

  const start = graph.nodes[0].id;
  const inMST = new Set<string>();
  const mstEdges: string[] = [];
  let totalWeight = 0;
  let edgesConsidered = 0;

  // Build undirected adjacency: nodeId → [{nodeId, edgeId, weight}]
  const adj = new Map<string, { nodeId: string; edgeId: string; weight: number }[]>();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const e of graph.edges) {
    const w = e.weight ?? 1;
    adj.get(e.source)?.push({ nodeId: e.target, edgeId: e.id, weight: w });
    adj.get(e.target)?.push({ nodeId: e.source, edgeId: e.id, weight: w });
  }

  inMST.add(start);
  events.push(
    eb.emit("NODE_DISCOVERED", { nodeId: start }, `Starting MST from node ${findLabel(start)}`)
  );

  // Lazy Prim: push all crossing edges; emit EDGE_REJECTED when popping a node already in MST
  // Min-heap: [weight, nodeId, edgeId, fromId]
  const pq: [number, string, string, string][] = [];
  for (const { nodeId, edgeId, weight } of adj.get(start) ?? []) {
    pq.push([weight, nodeId, edgeId, start]);
  }

  while (pq.length > 0) {
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
      if (pq[i][0] < pq[minIdx][0]) minIdx = i;
    }
    const [weight, nodeId, edgeId, fromId] = pq.splice(minIdx, 1)[0];

    edgesConsidered++;
    events.push(
      eb.emit("EDGE_CONSIDERED", { edgeId, from: fromId, to: nodeId, weight },
        `Considering edge ${findLabel(fromId)} — ${findLabel(nodeId)} (weight: ${weight})`)
    );

    if (inMST.has(nodeId)) {
      events.push(
        eb.emit("EDGE_REJECTED", { edgeId, reason: "already in MST" },
          `Rejected: ${findLabel(nodeId)} already in MST`)
      );
      continue;
    }

    inMST.add(nodeId);
    mstEdges.push(edgeId);
    totalWeight += weight;

    events.push(
      eb.emit("EDGE_RELAXED", { edgeId, weight },
        `Added edge ${findLabel(fromId)} — ${findLabel(nodeId)} (weight: ${weight}) to MST`)
    );
    events.push(
      eb.emit("NODE_FINALIZED", { nodeId, totalWeight },
        `Node ${findLabel(nodeId)} joined MST (total weight: ${totalWeight})`)
    );

    for (const { nodeId: neighbor, edgeId: eid, weight: w } of adj.get(nodeId) ?? []) {
      pq.push([w, neighbor, eid, nodeId]);
    }
  }

  const isConnected = inMST.size === graph.nodes.length;
  const warnings: string[] = [];
  if (!isConnected) {
    warnings.push("Graph is disconnected — MST covers the largest connected component only");
  }

  events.push(
    eb.emit("RUN_COMPLETED", { mstEdgeCount: mstEdges.length, totalWeight },
      `Prim's algorithm complete — MST has ${mstEdges.length} edge${mstEdges.length !== 1 ? "s" : ""}, total weight: ${totalWeight}`)
  );

  return {
    events,
    result: {
      algorithm: "prim",
      status: isConnected ? "success" : "warning",
      summary: `MST total weight: ${totalWeight} (${mstEdges.length} edges)`,
      metrics: {
        visitedNodeCount: inMST.size,
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
