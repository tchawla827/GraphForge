import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";
import { reconstructPath } from "./pathReconstruction";
import type { GraphNode } from "@/types/graph";

type HeuristicFn = (a: GraphNode, b: GraphNode) => number;

const heuristics: Record<string, HeuristicFn> = {
  euclidean: (a, b) =>
    Math.sqrt((a.position.x - b.position.x) ** 2 + (a.position.y - b.position.y) ** 2),
  manhattan: (a, b) =>
    Math.abs(a.position.x - b.position.x) + Math.abs(a.position.y - b.position.y),
  zero: () => 0,
};

export const astar: AlgorithmFn = ({ graph, config }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, `Starting A* from ${config.sourceNodeId} to ${config.targetNodeId}`)];

  const source = config.sourceNodeId!;
  const target = config.targetNodeId!;
  const directed = graph.config.directed;
  const heuristicName = config.heuristic ?? "euclidean";
  const h = heuristics[heuristicName] ?? heuristics.euclidean;

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const targetNode = nodeMap.get(target)!;

  // Build adjacency list
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

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const finalized = new Set<string>();

  for (const node of graph.nodes) {
    gScore[node.id] = Infinity;
    fScore[node.id] = Infinity;
    parent[node.id] = null;
  }

  gScore[source] = 0;
  fScore[source] = h(nodeMap.get(source)!, targetNode);

  events.push(eb.emit("DISTANCE_UPDATED", { nodeId: source, distance: 0 }, `g(${findLabel(source)}) = 0`));

  // Open set as array-based priority queue on fScore
  const openSet: string[] = [source];
  let visitedCount = 0;
  let edgesConsidered = 0;
  let found = false;

  events.push(eb.emit("PRIORITY_QUEUE_UPDATED", { items: [source] }, `Open set: [${findLabel(source)}]`));

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let minIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (fScore[openSet[i]] < fScore[openSet[minIdx]]) minIdx = i;
    }
    const current = openSet.splice(minIdx, 1)[0];

    if (finalized.has(current)) continue;
    finalized.add(current);
    visitedCount++;

    events.push(eb.emit("NODE_VISITED", { nodeId: current }, `Visiting node ${findLabel(current)} (g=${gScore[current].toFixed(1)}, f=${fScore[current].toFixed(1)})`));
    events.push(eb.emit("NODE_FINALIZED", { nodeId: current }, `Finalized node ${findLabel(current)}`));

    if (current === target) {
      found = true;
      break;
    }

    const neighbors = adj.get(current) ?? [];
    for (const { nodeId: neighbor, edgeId, weight } of neighbors) {
      if (finalized.has(neighbor)) continue;

      edgesConsidered++;
      const tentativeG = gScore[current] + weight;

      events.push(
        eb.emit("EDGE_CONSIDERED", { edgeId, from: current, to: neighbor },
          `Considering edge ${findLabel(current)} → ${findLabel(neighbor)} (weight: ${weight})`)
      );

      if (tentativeG < gScore[neighbor]) {
        parent[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + h(nodeMap.get(neighbor)!, targetNode);

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }

        events.push(
          eb.emit("EDGE_RELAXED", { edgeId, newDistance: tentativeG, via: current },
            `Relaxed: g(${findLabel(neighbor)}) = ${tentativeG.toFixed(1)} via ${findLabel(current)}`)
        );
        events.push(
          eb.emit("DISTANCE_UPDATED", { nodeId: neighbor, distance: tentativeG },
            `g(${findLabel(neighbor)}) = ${tentativeG.toFixed(1)}`)
        );
      } else {
        events.push(
          eb.emit("EDGE_REJECTED", { edgeId, reason: "no improvement" },
            `Edge rejected: does not improve g(${findLabel(neighbor)})`)
        );
      }
    }

    events.push(
      eb.emit("PRIORITY_QUEUE_UPDATED", { items: [...openSet] },
        openSet.length > 0
          ? `Open set: [${openSet.map(findLabel).join(", ")}]`
          : "Open set is empty")
    );
  }

  let path: string[] | undefined;
  if (found) {
    const result = reconstructPath(parent, source, target, eb);
    if (result) {
      events.push(result.event);
      path = result.path;
    }
  }

  events.push(eb.emit("RUN_COMPLETED", {}, "A* search complete"));

  return {
    events,
    result: {
      algorithm: "astar",
      status: "success",
      summary: found
        ? `A* found path from ${findLabel(source)} to ${findLabel(target)}: distance ${gScore[target].toFixed(1)}`
        : `A* could not find a path from ${findLabel(source)} to ${findLabel(target)}`,
      metrics: {
        visitedNodeCount: visitedCount,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: {
        ...(path ? { path } : {}),
        ...(found ? { distance: gScore[target] } : {}),
        heuristic: heuristicName,
      },
      warnings: [],
    },
  };

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }
};
