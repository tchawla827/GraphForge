import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";

export const dfs: AlgorithmFn = ({ graph, config }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, `Starting DFS from ${config.sourceNodeId}`)];

  const source = config.sourceNodeId!;
  const directed = graph.config.directed;

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
  const callStack: string[] = [];
  let visitedCount = 0;
  let edgesConsidered = 0;

  dfsVisit(source, null, null, true);

  events.push(eb.emit("RUN_COMPLETED", {}, "DFS traversal complete"));

  return {
    events,
    result: {
      algorithm: "dfs",
      status: "success",
      summary: `DFS visited ${visitedCount} node${visitedCount !== 1 ? "s" : ""} starting from ${findLabel(source)}`,
      metrics: {
        visitedNodeCount: visitedCount,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: { visitedOrder: [...visited] },
      warnings: [],
    },
  };

  function dfsVisit(
    nodeId: string,
    parentNodeId: string | null,
    viaEdgeId: string | null,
    isSource = false
  ) {
    if (visited.has(nodeId)) return;

    callStack.push(nodeId);
    events.push(
      eb.emit(
        "NODE_DISCOVERED",
        {
          nodeId,
          label: findLabel(nodeId),
          ...(parentNodeId
            ? {
                from: parentNodeId,
                fromLabel: findLabel(parentNodeId),
                viaEdgeId,
              }
            : {}),
        },
        isSource ? `Start at ${findLabel(nodeId)}` : `Discovered ${findLabel(nodeId)}`
      )
    );
    events.push(
      eb.emit(
        "STACK_UPDATED",
        { items: [...callStack], displayItems: callStack.map(findLabel) },
        formatStackMessage(
          isSource
            ? `Pushed ${findLabel(nodeId)} as the starting node`
            : `Pushed ${findLabel(nodeId)}`
        )
      )
    );

    visited.add(nodeId);
    visitedCount++;
    events.push(eb.emit("NODE_VISITED", { nodeId }, `Visit ${findLabel(nodeId)}`));

    const neighbors = adj.get(nodeId) ?? [];
    for (const { nodeId: neighbor, edgeId } of neighbors) {
      edgesConsidered++;
      events.push(
        eb.emit(
          "EDGE_CONSIDERED",
          { edgeId, from: nodeId, to: neighbor },
          `Check edge ${findLabel(nodeId)} -> ${findLabel(neighbor)}`
        )
      );

      if (!visited.has(neighbor)) {
        dfsVisit(neighbor, nodeId, edgeId);
      }
    }

    callStack.pop();
    events.push(
      eb.emit(
        "STACK_UPDATED",
        { items: [...callStack], displayItems: callStack.map(findLabel) },
        formatStackMessage(`Returning from ${findLabel(nodeId)}`)
      )
    );
  }

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }

  function formatStackMessage(action: string): string {
    return callStack.length > 0
      ? `${action}. Stack: [${callStack.map(findLabel).join(", ")}]`
      : `${action}. Stack is empty`;
  }
};
