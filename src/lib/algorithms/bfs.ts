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

  events.push(
    eb.emit(
      "NODE_DISCOVERED",
      { nodeId: source, label: findLabel(source) },
      `Start at ${findLabel(source)}`
    )
  );
  events.push(
    eb.emit(
      "QUEUE_UPDATED",
      { items: [...queue], displayItems: queue.map(findLabel) },
      formatQueueMessage(`Added ${findLabel(source)} as the starting node`)
    )
  );

  while (queue.length > 0) {
    const current = queue.shift()!;
    events.push(
      eb.emit(
        "QUEUE_UPDATED",
        { items: [...queue], displayItems: queue.map(findLabel) },
        formatQueueMessage(`Dequeued ${findLabel(current)}`)
      )
    );

    visitedCount++;
    events.push(
      eb.emit("NODE_VISITED", { nodeId: current }, `Visit ${findLabel(current)}`)
    );

    const neighbors = adj.get(current) ?? [];
    for (const { nodeId: neighbor, edgeId } of neighbors) {
      edgesConsidered++;
      events.push(
        eb.emit(
          "EDGE_CONSIDERED",
          { edgeId, from: current, to: neighbor },
          `Check edge ${findLabel(current)} -> ${findLabel(neighbor)}`
        )
      );

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        events.push(
          eb.emit(
            "NODE_DISCOVERED",
            {
              nodeId: neighbor,
              label: findLabel(neighbor),
              from: current,
              fromLabel: findLabel(current),
              viaEdgeId: edgeId,
            },
            `Discovered ${findLabel(neighbor)} from ${findLabel(current)} via ${findLabel(current)} -> ${findLabel(neighbor)}`
          )
        );
        events.push(
          eb.emit(
            "QUEUE_UPDATED",
            { items: [...queue], displayItems: queue.map(findLabel) },
            formatQueueMessage(
              `Enqueued ${findLabel(neighbor)} after ${findLabel(current)} -> ${findLabel(neighbor)}`
            )
          )
        );
      }
    }
  }

  const unreachableNodeIds = graph.nodes
    .map((node) => node.id)
    .filter((nodeId) => !visited.has(nodeId));
  const warnings: string[] = [];

  if (unreachableNodeIds.length > 0) {
    const warning = `Graph is disconnected from ${findLabel(source)}; ${unreachableNodeIds.length} node${unreachableNodeIds.length !== 1 ? "s are" : " is"} unreachable.`;
    warnings.push(warning);
    events.push(
      eb.emit("RUN_WARNING", { message: warning, nodeIds: unreachableNodeIds }, warning)
    );
  }

  events.push(eb.emit("RUN_COMPLETED", {}, "BFS traversal complete"));

  return {
    events,
    result: {
      algorithm: "bfs",
      status: warnings.length > 0 ? "warning" : "success",
      summary: `BFS visited ${visitedCount} node${visitedCount !== 1 ? "s" : ""} starting from ${findLabel(source)}`,
      metrics: {
        visitedNodeCount: visitedCount,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: { visitedOrder: [...visited], unreachableNodeIds },
      warnings,
    },
  };

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }

  function formatQueueMessage(action: string): string {
    return queue.length > 0
      ? `${action}. Queue: [${queue.map(findLabel).join(", ")}]`
      : `${action}. Queue is empty`;
  }
};
