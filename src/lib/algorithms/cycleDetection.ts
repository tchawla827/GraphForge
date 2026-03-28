import type { AlgorithmFn } from "./types";
import { EventBuilder } from "./eventBuilder";

export const cycleDetection: AlgorithmFn = ({ graph }) => {
  const eb = new EventBuilder();
  const directed = graph.config.directed;
  const mode = directed ? "directed" : "undirected";

  const events = [eb.emit("RUN_STARTED", {}, `Starting Cycle Detection on ${mode} graph`)];

  let hasCycle = false;
  let cycleNodes: string[] | undefined;
  let edgesConsidered = 0;

  if (directed) {
    // DFS with white/gray/black coloring
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color: Record<string, number> = {};
    const parent: Record<string, string | null> = {};

    for (const n of graph.nodes) {
      color[n.id] = WHITE;
      parent[n.id] = null;
    }

    const adj = new Map<string, string[]>();
    for (const n of graph.nodes) adj.set(n.id, []);
    for (const e of graph.edges) adj.get(e.source)?.push(e.target);

    const dfsStack: string[] = [];

    function dfs(nodeId: string): boolean {
      color[nodeId] = GRAY;
      dfsStack.push(nodeId);
      events.push(
        eb.emit("NODE_DISCOVERED", { nodeId }, `DFS visiting ${findLabel(nodeId)} (gray)`)
      );

      const neighbors = adj.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        edgesConsidered++;
        events.push(
          eb.emit("EDGE_CONSIDERED", { from: nodeId, to: neighbor },
            `Checking edge ${findLabel(nodeId)} → ${findLabel(neighbor)}`)
        );

        if (color[neighbor] === GRAY) {
          // Back edge — cycle found
          const cycleStart = dfsStack.indexOf(neighbor);
          cycleNodes = dfsStack.slice(cycleStart);
          events.push(
            eb.emit("CYCLE_DETECTED", { nodes: cycleNodes },
              `Back edge detected: ${findLabel(nodeId)} → ${findLabel(neighbor)} — cycle: [${cycleNodes.map(findLabel).join(" → ")}]`)
          );
          return true;
        }

        if (color[neighbor] === WHITE) {
          parent[neighbor] = nodeId;
          if (dfs(neighbor)) return true;
        }
      }

      color[nodeId] = BLACK;
      dfsStack.pop();
      events.push(
        eb.emit("NODE_FINALIZED", { nodeId }, `Node ${findLabel(nodeId)} finalized (black)`)
      );
      return false;
    }

    for (const n of graph.nodes) {
      if (color[n.id] === WHITE) {
        if (dfs(n.id)) {
          hasCycle = true;
          break;
        }
      }
    }
  } else {
    // Union-Find for undirected graphs
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

    for (const edge of graph.edges) {
      edgesConsidered++;
      events.push(
        eb.emit("EDGE_CONSIDERED", { edgeId: edge.id, from: edge.source, to: edge.target },
          `Checking edge ${findLabel(edge.source)} — ${findLabel(edge.target)}`)
      );

      if (!union(edge.source, edge.target)) {
        hasCycle = true;
        cycleNodes = [edge.source, edge.target];
        events.push(
          eb.emit("CYCLE_DETECTED", { nodes: cycleNodes },
            `Cycle detected: edge ${findLabel(edge.source)} — ${findLabel(edge.target)} connects already-joined components`)
        );
        break;
      }

      events.push(
        eb.emit("EDGE_RELAXED", { edgeId: edge.id },
          `Edge ${findLabel(edge.source)} — ${findLabel(edge.target)} added to spanning forest`)
      );
    }
  }

  const message = hasCycle
    ? directed
      ? "Cycle detected in directed graph"
      : "Cycle detected in undirected graph"
    : directed
      ? "No cycle found in directed graph"
      : "No cycle found in undirected graph";

  events.push(eb.emit("RUN_COMPLETED", { hasCycle }, message));

  return {
    events,
    result: {
      algorithm: "cycle_detection",
      status: "success",
      summary: message,
      metrics: {
        visitedNodeCount: graph.nodes.length,
        consideredEdgeCount: edgesConsidered,
        stepCount: events.length,
      },
      output: {
        hasCycle,
        ...(cycleNodes ? { cycle: cycleNodes } : {}),
      },
      warnings: [],
    },
  };

  function findLabel(nodeId: string): string {
    return graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  }
};
