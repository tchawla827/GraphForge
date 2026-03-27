import type { GraphConfig, GraphEdge } from "@/types/graph";

let nodeCounter = 0;
let edgeCounter = 0;

export function generateNodeId(): string {
  return `n_${Date.now()}_${++nodeCounter}`;
}

export function generateEdgeId(): string {
  return `e_${Date.now()}_${++edgeCounter}`;
}

export function defaultGraphConfig(): GraphConfig {
  return {
    directed: true,
    weighted: false,
    allowSelfLoops: false,
    allowParallelEdges: false,
  };
}

export function getParallelEdgeKey(
  source: string,
  target: string,
  directed: boolean
): string {
  if (directed) {
    return `${source}->${target}`;
  }

  return [source, target].sort().join("--");
}

export function normalizeEdgesForConfig(
  edges: GraphEdge[],
  config: GraphConfig
): GraphEdge[] {
  const seen = new Set<string>();

  return edges.filter((edge) => {
    if (!config.allowSelfLoops && edge.source === edge.target) {
      return false;
    }

    if (config.allowParallelEdges) {
      return true;
    }

    const key = getParallelEdgeKey(edge.source, edge.target, config.directed);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
