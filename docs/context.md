# GraphForge — Quick Context

## Stack
Next.js 15 App Router | React 19 | TypeScript | Tailwind CSS | shadcn/ui
React Flow | Zustand | TanStack Query | Zod | Auth.js (Google OAuth)
Prisma | PostgreSQL (Neon) | Vercel deployment | pnpm

## File layout conventions
```
src/
  app/                        Next.js routes (App Router)
  app/api/                    Route handlers
  app/(auth)/                 Auth routes (sign-in)
  app/(dashboard)/dashboard/  Dashboard page
  app/(editor)/editor/[projectId]/  Editor page
  app/share/[slugOrToken]/    Public shared page
  app/(admin)/admin/          Admin page
  server/                     Service layer (projectService, graphService, etc.)
  lib/db/                     Prisma client singleton
  lib/auth/                   Auth.js config
  lib/algorithms/             Pure algorithm functions (no UI deps)
  lib/playback/               Playback engine
  lib/parsers/                Import parsers (adjacency list, matrix, JSON)
  lib/share/                  Token/slug generators
  lib/analytics/              Analytics event wrappers
  lib/samples/                Sample graph definitions
  features/editor/            Editor feature (store, adapters, components)
  features/share/             Share modal feature
  features/onboarding/        Help/onboarding feature
  components/ui/              shadcn/ui generated components
  components/layout/          App shell, navbar
  types/                      Canonical types (graph.ts, events.ts, api.ts)
prisma/schema.prisma          Database schema
tests/unit/                   Unit tests
tests/integration/            API + permission integration tests
tests/e2e/                    Playwright end-to-end tests
```

## Canonical types (full definitions in docs/schema.md §1)
```ts
interface CanonicalGraph {
  schemaVersion: 1;
  id: string;
  projectId: string;
  config: GraphConfig;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
  updatedAt: string;
}
interface GraphConfig {
  directed: boolean;
  weighted: boolean;
  allowSelfLoops: boolean;
  allowParallelEdges: boolean;
}
interface GraphNode { id: string; label: string; position: { x: number; y: number }; metadata?: Record<string, unknown> }
interface GraphEdge { id: string; source: string; target: string; weight?: number | null; label?: string | null; metadata?: Record<string, unknown> }

type AlgorithmKey = "bfs"|"dfs"|"dijkstra"|"astar"|"bellman_ford"|"topological_sort"|"cycle_detection"|"prim"|"kruskal"

interface PlaybackEvent { id: string; stepIndex: number; type: PlaybackEventType; atMs?: number; payload: Record<string, unknown>; message: string }
type PlaybackEventType = "RUN_STARTED"|"NODE_DISCOVERED"|"NODE_VISITED"|"NODE_FINALIZED"|"EDGE_CONSIDERED"|"EDGE_RELAXED"|"EDGE_REJECTED"|"QUEUE_UPDATED"|"STACK_UPDATED"|"PRIORITY_QUEUE_UPDATED"|"DISTANCE_UPDATED"|"PATH_UPDATED"|"CYCLE_DETECTED"|"RUN_WARNING"|"RUN_COMPLETED"
```

## API error shape
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Readable message", "details": {} } }
```
Error codes: `AUTH_REQUIRED` | `PERMISSION_DENIED` | `VALIDATION_ERROR` | `NOT_FOUND` | `CONSTRAINT_ERROR` | `SERVER_ERROR`

## Algorithm constraints (enforced at API and validate.ts)
- **BFS / DFS:** source required; directed or undirected
- **Dijkstra:** source required; reject if any edge has negative weight
- **A\*:** source + target required; heuristic from node `position` (euclidean/manhattan/zero)
- **Bellman-Ford:** source required; negative weights allowed; detect and surface negative cycles
- **Topological Sort:** directed graphs only; cycle → status `error` + `CYCLE_DETECTED` event
- **Cycle Detection:** directed (DFS back-edge) or undirected (union-find); result message must distinguish mode
- **Prim / Kruskal:** undirected weighted graphs only

## Architecture invariants
1. React Flow is an editor adapter only — never the persistent data model
2. Algorithm functions are pure: `(CanonicalGraph, AlgorithmRunConfig) → { events: PlaybackEvent[], result: AlgorithmRunResult }`
3. Playback engine consumes immutable `PlaybackEvent[]`; never mutates historical events
4. All project mutations: authentication required + ownership check server-side
5. All imports normalize into CanonicalGraph before being applied

## Service boundaries
`projectService` | `graphService` | `importService` | `algorithmService` | `shareService` | `adminService`

## Env vars
`DATABASE_URL` | `AUTH_SECRET` | `AUTH_GOOGLE_ID` | `AUTH_GOOGLE_SECRET`

## Import limits (enforced in parsers and API)
Max file size: 1 MB | Max nodes: 200 | Max edges: 1000
