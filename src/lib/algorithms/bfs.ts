import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";

export const bfs: AlgorithmFn = ({ graph, config }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, `Starting BFS from ${config.sourceNodeId}`)];

  const source = config.sourceNodeId!;
  const directed = graph.config.directed;

  // Build adjacency list with edge references
  const adj = new Map<string, { nodeId: string; edgeId: string }[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    adj.get(edge.source)?.push({ nodeId: edge.target, edgeId: edge.id });
    if (!directed) {
      adj.get(edge.target)?.push({ nodeId: edge.source, edgeId: edge.id });
    }
  }

  const visited = new Set<string>();
  const queue: string[] = [source];
  visited.add(source);

  let visitedCount = 0;
  let edgesConsidered = 0;

  events.push(eb.emit("NODE_DISCOVERED", { nodeId: source }, `Discovered source node ${findLabel(source)}`));
  events.push(eb.emit("QUEUE_UPDATED", { items: [...queue] }, `Queue: [${queue.map(findLabel).join(", ")}]`));

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedCount++;
    events.push(eb.emit("NODE_VISITED", { nodeId: current }, `Visiting node ${findLabel(current)}`));

    const neighbors = adj.get(current) ?? [];
    for (const { nodeId: neighbor, edgeId } of neighbors) {
      edgesConsidered++;
      events.push(
        eb.emit("EDGE_CONSIDERED", { edgeId, from: current, to: neighbor },
          `Considering edge ${findLabel(current)} → ${findLabel(neighbor)}`)
      );

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        events.push(
          eb.emit("NODE_DISCOVERED", { nodeId: neighbor }, `Discovered node ${findLabel(neighbor)}`)
        );
      }
    }

    events.push(eb.emit("QUEUE_UPDATED", { items: [...queue] },
      queue.length > 0
        ? `Queue: [${queue.map(findLabel).join(", ")}]`
        : "Queue is empty"));
  }

  events.push(eb.emit("RUN_COMPLETED", {}, "BFS traversal complete"));

  return {
    events,
    result: {
      algorithm: "bfs",
      status: "success",
      summary: `BFS visited ${visitedCount} node${visitedCount !== 1 ? "s" : ""} starting from ${findLabel(source)}`,
      metrics: {
        visitedNodeCount: visitedCount,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: { visitedOrder: [...visited] },
      warnings: [],
    },
  };

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }
};
