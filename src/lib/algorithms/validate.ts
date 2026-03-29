import type { CanonicalGraph, AlgorithmRunConfig } from "@/types/graph";

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateAlgorithmInput(
  graph: CanonicalGraph,
  config: AlgorithmRunConfig
): ValidationResult {
  const { algorithm, sourceNodeId, targetNodeId } = config;
  const nodeIds = new Set(graph.nodes.map((n) => n.id));

  if (graph.nodes.length === 0) {
    return { ok: false, error: "The graph has no nodes." };
  }

  // Source validation for algorithms that require it
  const requiresSource = [
    "bfs",
    "dfs",
    "dijkstra",
    "astar",
    "bellman_ford",
  ] as const;

  if ((requiresSource as readonly string[]).includes(algorithm)) {
    if (!sourceNodeId) {
      return { ok: false, error: "A source node is required for this algorithm." };
    }
    if (!nodeIds.has(sourceNodeId)) {
      return { ok: false, error: "The selected source node does not exist in the graph." };
    }
  }

  // Target validation for A*
  if (algorithm === "astar") {
    if (!targetNodeId) {
      return { ok: false, error: "A* requires both a source and target node." };
    }
    if (!nodeIds.has(targetNodeId)) {
      return { ok: false, error: "The selected target node does not exist in the graph." };
    }
    if (sourceNodeId === targetNodeId) {
      return { ok: false, error: "Source and target must be different nodes for A*." };
    }
  }

  // Optional target validation for Dijkstra / Bellman-Ford
  if (
    (algorithm === "dijkstra" || algorithm === "bellman_ford") &&
    targetNodeId &&
    !nodeIds.has(targetNodeId)
  ) {
    return { ok: false, error: "The selected target node does not exist in the graph." };
  }

  // Dijkstra / A*: no negative weights
  if (algorithm === "dijkstra" || algorithm === "astar") {
    const hasNegative = graph.edges.some(
      (e) => e.weight != null && e.weight < 0
    );
    if (hasNegative) {
      return {
        ok: false,
        error:
          algorithm === "dijkstra"
            ? "Dijkstra's algorithm does not support negative edge weights. Use Bellman-Ford instead."
            : "A* does not support negative edge weights. Use Bellman-Ford instead.",
      };
    }
  }

  // Topological sort: directed only
  if (algorithm === "topological_sort" && !graph.config.directed) {
    return {
      ok: false,
      error: "Topological sort requires a directed graph.",
    };
  }

  // Prim / Kruskal: undirected weighted only
  if (algorithm === "prim" || algorithm === "kruskal") {
    if (graph.config.directed) {
      return {
        ok: false,
        error: `${algorithm === "prim" ? "Prim's" : "Kruskal's"} algorithm requires an undirected graph.`,
      };
    }
    if (!graph.config.weighted) {
      return {
        ok: false,
        error: `${algorithm === "prim" ? "Prim's" : "Kruskal's"} algorithm requires a weighted graph.`,
      };
    }
  }

  return { ok: true };
}
