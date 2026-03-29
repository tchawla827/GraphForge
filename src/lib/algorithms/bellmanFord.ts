import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";
import { reconstructPath } from "./pathReconstruction";

export const bellmanFord: AlgorithmFn = ({ graph, config }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, `Starting Bellman-Ford from ${config.sourceNodeId}`)];

  const source = config.sourceNodeId!;
  const target = config.targetNodeId ?? null;
  const directed = graph.config.directed;
  const vertexCount = graph.nodes.length;

  const edgeList: { edgeId: string; from: string; to: string; weight: number }[] = [];
  for (const edge of graph.edges) {
    const w = edge.weight ?? 1;
    edgeList.push({ edgeId: edge.id, from: edge.source, to: edge.target, weight: w });
    if (!directed) {
      edgeList.push({ edgeId: edge.id, from: edge.target, to: edge.source, weight: w });
    }
  }

  const dist: Record<string, number> = {};
  const parentNode: Record<string, string | null> = {};
  const parentEdge: Record<string, string | null> = {};

  for (const node of graph.nodes) {
    dist[node.id] = Infinity;
    parentNode[node.id] = null;
    parentEdge[node.id] = null;
  }
  dist[source] = 0;

  events.push(
    eb.emit("DISTANCE_UPDATED", { nodeId: source, distance: 0 }, `Distance to ${findLabel(source)} = 0`)
  );
  events.push(eb.emit("NODE_VISITED", { nodeId: source }, `Source node ${findLabel(source)} initialized`));

  let visitedCount = 1;
  let edgesConsidered = 0;
  const warnings: string[] = [];

  for (let iteration = 0; iteration < vertexCount - 1; iteration++) {
    let relaxed = false;

    for (const { edgeId, from, to, weight } of edgeList) {
      if (dist[from] === Infinity) continue;

      edgesConsidered++;
      events.push(
        eb.emit(
          "EDGE_CONSIDERED",
          { edgeId, from, to },
          `Iteration ${iteration + 1}: considering ${findLabel(from)} -> ${findLabel(to)} (weight: ${weight})`
        )
      );

      const newDist = dist[from] + weight;
      if (newDist < dist[to]) {
        const isFirstVisit = dist[to] === Infinity;
        dist[to] = newDist;
        parentNode[to] = from;
        parentEdge[to] = edgeId;
        relaxed = true;

        if (isFirstVisit) {
          visitedCount++;
          events.push(eb.emit("NODE_VISITED", { nodeId: to }, `Reached node ${findLabel(to)}`));
        }

        events.push(
          eb.emit(
            "EDGE_RELAXED",
            { edgeId, newDistance: newDist, via: from },
            `Relaxed: distance to ${findLabel(to)} = ${newDist} via ${findLabel(from)}`
          )
        );
        events.push(
          eb.emit(
            "DISTANCE_UPDATED",
            { nodeId: to, distance: newDist },
            `Distance to ${findLabel(to)} = ${newDist}`
          )
        );
      } else {
        events.push(
          eb.emit(
            "EDGE_REJECTED",
            { edgeId, reason: "no improvement" },
            `No improvement for ${findLabel(from)} -> ${findLabel(to)}`
          )
        );
      }
    }

    if (!relaxed) break;
  }

  let hasNegativeCycle = false;
  for (const { from, to, weight } of edgeList) {
    if (dist[from] === Infinity) continue;
    if (dist[from] + weight < dist[to]) {
      hasNegativeCycle = true;

      const cycle = traceCycle(from, parentNode);
      const warning = "Graph contains a negative weight cycle. Shortest paths are not well-defined.";
      events.push(
        eb.emit("CYCLE_DETECTED", { cycle }, `Negative cycle detected: ${cycle.map(findLabel).join(" -> ")}`)
      );
      events.push(eb.emit("RUN_WARNING", { message: warning }, "Negative weight cycle detected"));
      warnings.push(warning);
      break;
    }
  }

  let path: string[] | undefined;
  let pathEdgeIds: string[] | undefined;
  if (target && !hasNegativeCycle) {
    const result = reconstructPath(parentNode, parentEdge, source, target, eb);
    if (result) {
      events.push(result.event);
      path = result.path;
      pathEdgeIds = result.edgeIds;
    }
  }

  for (const node of graph.nodes) {
    if (dist[node.id] !== Infinity) {
      events.push(
        eb.emit(
          "NODE_FINALIZED",
          { nodeId: node.id },
          `Finalized ${findLabel(node.id)} with distance ${dist[node.id]}`
        )
      );
    }
  }

  const distances: Record<string, number> = {};
  for (const [nodeId, distance] of Object.entries(dist)) {
    if (distance !== Infinity) {
      distances[nodeId] = distance;
    }
  }

  const unreachableNodeIds = graph.nodes
    .map((node) => node.id)
    .filter((nodeId) => dist[nodeId] === Infinity);

  if (target && !hasNegativeCycle && dist[target] === Infinity) {
    warnings.push(`Target ${findLabel(target)} is unreachable from ${findLabel(source)}.`);
  }

  if (unreachableNodeIds.length > 0) {
    warnings.push(
      `Graph is disconnected from ${findLabel(source)}; ${unreachableNodeIds.length} node${unreachableNodeIds.length !== 1 ? "s are" : " is"} unreachable.`
    );
  }

  for (const warning of warnings) {
    if (warning.includes("unreachable")) {
      events.push(eb.emit("RUN_WARNING", { message: warning }, warning));
    }
  }

  events.push(eb.emit("RUN_COMPLETED", {}, "Bellman-Ford complete"));

  return {
    events,
    result: {
      algorithm: "bellman_ford",
      status: hasNegativeCycle || warnings.length > 0 ? "warning" : "success",
      summary: hasNegativeCycle
        ? "Negative weight cycle detected. Shortest paths are unreliable."
        : target
          ? path
            ? `Shortest path from ${findLabel(source)} to ${findLabel(target)}: distance ${dist[target]}`
            : `No path from ${findLabel(source)} to ${findLabel(target)}`
          : `Bellman-Ford computed distances from ${findLabel(source)}`,
      metrics: {
        visitedNodeCount: visitedCount,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: {
        distances,
        unreachableNodeIds,
        ...(path ? { path, pathEdgeIds } : {}),
        hasNegativeCycle,
      },
      warnings,
    },
  };

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }
};

function traceCycle(startNode: string, parent: Record<string, string | null>): string[] {
  const visited = new Set<string>();
  const cycle: string[] = [];
  let current: string | null = startNode;

  while (current && !visited.has(current)) {
    visited.add(current);
    current = parent[current] ?? null;
  }

  if (!current) return [startNode];

  const cycleStart = current;
  cycle.push(cycleStart);
  current = parent[cycleStart] ?? null;

  while (current && current !== cycleStart) {
    cycle.push(current);
    current = parent[current] ?? null;
  }

  cycle.push(cycleStart);
  cycle.reverse();
  return cycle;
}
