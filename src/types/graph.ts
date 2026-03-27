/**
 * Canonical graph model — the single source of truth for graph data across the
 * editor, imports, algorithms, playback, persistence, and sharing layers.
 *
 * All imports normalize into this shape before being applied.
 * All algorithm functions read from this shape.
 * React Flow is an adapter over this shape, not a replacement for it.
 */

export type GraphId = string;
export type NodeId = string;
export type EdgeId = string;

export interface GraphConfig {
  directed: boolean;
  weighted: boolean;
  allowSelfLoops: boolean;
  allowParallelEdges: boolean;
}

export interface GraphNode {
  id: NodeId;
  label: string;
  position: {
    x: number;
    y: number;
  };
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  weight?: number | null;
  label?: string | null;
  metadata?: Record<string, unknown>;
}

/** The canonical graph — authoritative for all phases. */
export interface CanonicalGraph {
  schemaVersion: 1;
  id: GraphId;
  projectId: string;
  config: GraphConfig;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
  updatedAt: string;
}

export type AlgorithmKey =
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "astar"
  | "bellman_ford"
  | "topological_sort"
  | "cycle_detection"
  | "prim"
  | "kruskal";

export interface AlgorithmRunConfig {
  algorithm: AlgorithmKey;
  sourceNodeId?: string;
  targetNodeId?: string;
  heuristic?: "euclidean" | "manhattan" | "zero";
}
