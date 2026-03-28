import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";

export const dfs: AlgorithmFn = ({ graph, config }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, `Starting DFS from ${config.sourceNodeId}`)];

  const source = config.sourceNodeId!;
  const directed = graph.config.directed;

  // Build adjacency list
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
  const discovered = new Set<string>();
  const stack: string[] = [source];
  discovered.add(source);
  let visitedCount = 0;
  let edgesConsidered = 0;

  events.push(eb.emit("NODE_DISCOVERED", { nodeId: source }, `Discovered source node ${findLabel(source)}`));
  events.push(eb.emit("STACK_UPDATED", { items: [...stack] }, `Stack: [${stack.map(findLabel).join(", ")}]`));

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (visited.has(current)) continue;
    visited.add(current);
    visitedCount++;

    events.push(eb.emit("NODE_VISITED", { nodeId: current }, `Visiting node ${findLabel(current)}`));

    const neighbors = adj.get(current) ?? [];
    // Reverse to maintain intuitive left-to-right order when popping from stack
    for (const { nodeId: neighbor, edgeId } of [...neighbors].reverse()) {
      edgesConsidered++;
      events.push(
        eb.emit("EDGE_CONSIDERED", { edgeId, from: current, to: neighbor },
          `Considering edge ${findLabel(current)} → ${findLabel(neighbor)}`)
      );

      if (!visited.has(neighbor) && !discovered.has(neighbor)) {
        discovered.add(neighbor);
        stack.push(neighbor);
        events.push(
          eb.emit("NODE_DISCOVERED", { nodeId: neighbor }, `Discovered node ${findLabel(neighbor)}`)
        );
      }
    }

    events.push(eb.emit("STACK_UPDATED", { items: [...stack] },
      stack.length > 0
        ? `Stack: [${stack.map(findLabel).join(", ")}]`
        : "Stack is empty"));
  }

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

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }
};
