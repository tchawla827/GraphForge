# GraphForge Schema

## 1. Canonical graph model

This is the single source of truth for graph data across editor, imports, algorithms, playback, persistence, and sharing.

```ts
export type GraphId = string;
export type NodeId = string;
export type EdgeId = string;

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
```

## 2. Invariants
- Node IDs are unique within a graph.
- Edge IDs are unique within a graph.
- `source` and `target` must reference existing node IDs.
- If `config.weighted === false`, weights are ignored by algorithms and UI should avoid requiring them.
- Self-loops are allowed only when `allowSelfLoops === true`.
- Parallel edges are allowed only when `allowParallelEdges === true`.

## 3. Persistence entities

### User
```ts
interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Project
```ts
interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  visibilityDefault: "private" | "public" | "shared_private";
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}
```

### GraphRecord
```ts
interface GraphRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  isDirected: boolean;
  isWeighted: boolean;
  allowSelfLoops: boolean;
  allowParallelEdges: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### NodeRecord
```ts
interface NodeRecord {
  id: string;
  graphId: string;
  label: string;
  x: number;
  y: number;
  metadataJson: unknown | null;
}
```

### EdgeRecord
```ts
interface EdgeRecord {
  id: string;
  graphId: string;
  sourceNodeId: string;
  targetNodeId: string;
  weight: number | null;
  label: string | null;
  metadataJson: unknown | null;
}
```

### ShareLink
```ts
interface ShareLink {
  id: string;
  projectId: string;
  type: "public" | "private_token";
  slug: string | null;
  tokenHash: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
}
```

### AlgorithmRun
```ts
interface AlgorithmRun {
  id: string;
  projectId: string;
  algorithm: AlgorithmKey;
  sourceNodeId: string | null;
  targetNodeId: string | null;
  configJson: unknown;
  resultJson: unknown;
  eventCount: number;
  createdAt: string;
}
```

### ImportRecord
```ts
interface ImportRecord {
  id: string;
  projectId: string;
  type: "adjacency_list" | "adjacency_matrix" | "json";
  originalFilename: string | null;
  status: "success" | "error";
  errorSummary: string | null;
  createdAt: string;
}
```

## 4. Algorithm keys
```ts
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
```

## 5. Run configuration
```ts
export interface AlgorithmRunConfig {
  algorithm: AlgorithmKey;
  sourceNodeId?: string;
  targetNodeId?: string;
  heuristic?: "euclidean" | "manhattan" | "zero";
}
```

## 6. Playback event schema

Playback is driven by immutable event timelines.

```ts
export type PlaybackEventType =
  | "RUN_STARTED"
  | "NODE_DISCOVERED"
  | "NODE_VISITED"
  | "NODE_FINALIZED"
  | "EDGE_CONSIDERED"
  | "EDGE_RELAXED"
  | "EDGE_REJECTED"
  | "QUEUE_UPDATED"
  | "STACK_UPDATED"
  | "PRIORITY_QUEUE_UPDATED"
  | "DISTANCE_UPDATED"
  | "PATH_UPDATED"
  | "CYCLE_DETECTED"
  | "RUN_WARNING"
  | "RUN_COMPLETED";

export interface PlaybackEvent {
  id: string;
  stepIndex: number;
  type: PlaybackEventType;
  atMs?: number;
  payload: Record<string, unknown>;
  message: string;
}
```

## 7. Run result schema
```ts
export interface AlgorithmRunResult {
  algorithm: AlgorithmKey;
  status: "success" | "warning" | "error";
  summary: string;
  metrics: {
    visitedNodeCount: number;
    consideredEdgeCount: number;
    stepCount: number;
    runtimeMs?: number;
  };
  output: Record<string, unknown>;
  warnings: string[];
}
```

## 8. Import formats

### Adjacency list
Accept lines shaped like:
- `A: B(4), C(2)`
- `B: D(7)`
- `C:`
- or a simplified unweighted form like `A: B, C`

### Adjacency matrix
- first row optional node labels
- matrix must be square
- blank / `0` / `∞` handling must be documented in parser behavior

### JSON
JSON imports must match the canonical graph model schema version.

## 9. Limits for MVP
- max import size: 1 MB
- max nodes: 200
- max edges: 1000

## 10. Constraint rules by algorithm

### BFS / DFS
- allowed on directed or undirected graphs
- source required

### Dijkstra
- source required
- target optional depending on UI flow
- reject if any negative edge exists

### A*
- source required
- target required
- heuristics use node positions

### Bellman-Ford
- source required
- negative weights allowed
- negative cycles must surface warning/error output

### Topological sort
- directed graphs only
- cycle should invalidate successful topo output

### Cycle detection
- allowed on directed and undirected, but result messaging must distinguish mode

### Prim / Kruskal
- undirected weighted graphs only
