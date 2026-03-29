import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";
import { reconstructPath } from "./pathReconstruction";

export const dijkstra: AlgorithmFn = ({ graph, config }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, `Starting Dijkstra from ${config.sourceNodeId}`)];

  const source = config.sourceNodeId!;
  const target = config.targetNodeId ?? null;
  const directed = graph.config.directed;

  const adj = new Map<string, { nodeId: string; edgeId: string; weight: number }[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const w = edge.weight ?? 1;
    adj.get(edge.source)?.push({ nodeId: edge.target, edgeId: edge.id, weight: w });
    if (!directed) {
      adj.get(edge.target)?.push({ nodeId: edge.source, edgeId: edge.id, weight: w });
    }
  }

  const dist: Record<string, number> = {};
  const parentNode: Record<string, string | null> = {};
  const parentEdge: Record<string, string | null> = {};
  const finalized = new Set<string>();

  for (const node of graph.nodes) {
    dist[node.id] = Infinity;
    parentNode[node.id] = null;
    parentEdge[node.id] = null;
  }
  dist[source] = 0;

  events.push(
    eb.emit("DISTANCE_UPDATED", { nodeId: source, distance: 0 }, `Distance to ${findLabel(source)} = 0`)
  );

  const pq: [number, string][] = [[0, source]];
  let visitedCount = 0;
  let edgesConsidered = 0;

  events.push(
    eb.emit("PRIORITY_QUEUE_UPDATED", { items: [source] }, `Priority queue: [${findLabel(source)}]`)
  );

  while (pq.length > 0) {
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
      if (pq[i][0] < pq[minIdx][0]) minIdx = i;
    }
    const [currentDist, current] = pq.splice(minIdx, 1)[0];

    if (finalized.has(current)) continue;
    if (currentDist > dist[current]) continue;

    finalized.add(current);
    visitedCount++;

    events.push(
      eb.emit("NODE_VISITED", { nodeId: current }, `Visiting node ${findLabel(current)} (distance: ${currentDist})`)
    );
    events.push(
      eb.emit(
        "NODE_FINALIZED",
        { nodeId: current },
        `Finalized node ${findLabel(current)} with distance ${currentDist}`
      )
    );

    if (target && current === target) {
      break;
    }

    const neighbors = adj.get(current) ?? [];
    for (const { nodeId: neighbor, edgeId, weight } of neighbors) {
      if (finalized.has(neighbor)) continue;

      edgesConsidered++;
      const newDist = currentDist + weight;

      events.push(
        eb.emit(
          "EDGE_CONSIDERED",
          { edgeId, from: current, to: neighbor },
          `Considering edge ${findLabel(current)} -> ${findLabel(neighbor)} (weight: ${weight})`
        )
      );

      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        parentNode[neighbor] = current;
        parentEdge[neighbor] = edgeId;
        pq.push([newDist, neighbor]);

        events.push(
          eb.emit(
            "EDGE_RELAXED",
            { edgeId, newDistance: newDist, via: current },
            `Relaxed edge: distance to ${findLabel(neighbor)} updated to ${newDist} via ${findLabel(current)}`
          )
        );
        events.push(
          eb.emit(
            "DISTANCE_UPDATED",
            { nodeId: neighbor, distance: newDist },
            `Distance to ${findLabel(neighbor)} = ${newDist}`
          )
        );
      } else {
        events.push(
          eb.emit(
            "EDGE_REJECTED",
            { edgeId, reason: "no improvement" },
            `Edge rejected: ${findLabel(current)} -> ${findLabel(neighbor)} does not improve distance`
          )
        );
      }
    }

    events.push(
      eb.emit(
        "PRIORITY_QUEUE_UPDATED",
        { items: pq.map(([, id]) => id) },
        pq.length > 0
          ? `Priority queue: [${pq.map(([, id]) => findLabel(id)).join(", ")}]`
          : "Priority queue is empty"
      )
    );
  }

  let path: string[] | undefined;
  let pathEdgeIds: string[] | undefined;
  if (target) {
    const result = reconstructPath(parentNode, parentEdge, source, target, eb);
    if (result) {
      events.push(result.event);
      path = result.path;
      pathEdgeIds = result.edgeIds;
    }
  }

  const distances: Record<string, number> = {};
  for (const [nodeId, d] of Object.entries(dist)) {
    if (d !== Infinity) {
      distances[nodeId] = d;
    }
  }

  const unreachableNodeIds = graph.nodes
    .map((node) => node.id)
    .filter((nodeId) => dist[nodeId] === Infinity);
  const warnings: string[] = [];
  let status: "success" | "warning" = "success";

  if (target && dist[target] === Infinity) {
    const warning = `Target ${findLabel(target)} is unreachable from ${findLabel(source)}.`;
    warnings.push(warning);
    status = "warning";
    events.push(eb.emit("RUN_WARNING", { message: warning }, warning));
  }

  if (unreachableNodeIds.length > 0) {
    const warning = `Graph is disconnected from ${findLabel(source)}; ${unreachableNodeIds.length} node${unreachableNodeIds.length !== 1 ? "s are" : " is"} unreachable.`;
    warnings.push(warning);
    status = "warning";
    events.push(eb.emit("RUN_WARNING", { message: warning, nodeIds: unreachableNodeIds }, warning));
  }

  events.push(eb.emit("RUN_COMPLETED", {}, "Dijkstra's algorithm complete"));

  return {
    events,
    result: {
      algorithm: "dijkstra",
      status,
      summary: target
        ? path
          ? `Shortest path from ${findLabel(source)} to ${findLabel(target)}: distance ${dist[target]}`
          : `No path exists from ${findLabel(source)} to ${findLabel(target)}`
        : `Dijkstra computed shortest distances from ${findLabel(source)} to ${visitedCount} node${visitedCount !== 1 ? "s" : ""}`,
      metrics: {
        visitedNodeCount: visitedCount,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: {
        distances,
        unreachableNodeIds,
        ...(path ? { path, pathEdgeIds } : {}),
      },
      warnings,
    },
  };

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }
};
