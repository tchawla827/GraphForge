import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";

export const topologicalSort: AlgorithmFn = ({ graph }) => {
  const eb = new EventBuilder();
  const events = [eb.emit("RUN_STARTED", {}, "Starting Topological Sort (Kahn's algorithm)")];

  const nodeIds = graph.nodes.map((n) => n.id);
  const inDegree: Record<string, number> = {};
  for (const id of nodeIds) {
    inDegree[id] = 0;
  }

  for (const edge of graph.edges) {
    inDegree[edge.target] = (inDegree[edge.target] ?? 0) + 1;
  }

  const adj = new Map<string, string[]>();
  for (const id of nodeIds) {
    adj.set(id, []);
  }
  for (const edge of graph.edges) {
    adj.get(edge.source)?.push(edge.target);
  }

  const queue: string[] = [];
  for (const id of nodeIds) {
    if (inDegree[id] === 0) {
      queue.push(id);
      events.push(
        eb.emit("NODE_DISCOVERED", { nodeId: id }, `Node ${findLabel(id)} has in-degree 0, added to queue`)
      );
    }
  }

  events.push(
    eb.emit("QUEUE_UPDATED", { items: [...queue] }, `Queue: [${queue.map(findLabel).join(", ")}]`)
  );

  const order: string[] = [];
  let edgesConsidered = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    events.push(
      eb.emit("NODE_FINALIZED", { nodeId: current, position: order.length }, `Output node ${findLabel(current)} (position ${order.length})`)
    );

    const neighbors = adj.get(current) ?? [];
    for (const neighbor of neighbors) {
      edgesConsidered++;
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
        events.push(
          eb.emit("NODE_DISCOVERED", { nodeId: neighbor }, `Node ${findLabel(neighbor)} in-degree reached 0, added to queue`)
        );
      }
    }

    events.push(
      eb.emit("QUEUE_UPDATED", { items: [...queue] },
        queue.length > 0
          ? `Queue: [${queue.map(findLabel).join(", ")}]`
          : "Queue is empty")
    );
  }

  if (order.length < nodeIds.length) {
    const remaining = nodeIds.filter((id) => !order.includes(id));
    events.push(
      eb.emit("CYCLE_DETECTED", { cycle: remaining },
        `Cycle detected — nodes still in graph: [${remaining.map(findLabel).join(", ")}]`)
    );

    events.push(eb.emit("RUN_COMPLETED", { status: "error" }, "Topological sort failed — cycle detected"));

    return {
      events,
      result: {
        algorithm: "topological_sort",
        status: "error",
        summary: "Graph contains a cycle — topological sort not possible",
        metrics: {
          visitedNodeCount: order.length,
          consideredEdgeCount: edgesConsidered,
          stepCount: events.length,
        },
        output: { order },
        warnings: [],
      },
    };
  }

  events.push(eb.emit("RUN_COMPLETED", {}, "Topological sort complete"));

  return {
    events,
    result: {
      algorithm: "topological_sort",
      status: "success",
      summary: `Topological order: ${order.map(findLabel).join(" → ")}`,
      metrics: {
        visitedNodeCount: order.length,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: { order },
      warnings: [],
    },
  };

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }
};
