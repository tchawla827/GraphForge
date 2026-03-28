# GraphForge Task Tracker

Last updated: 2026-03-28

## Active phase
**Phase 5 — Save/Share/Fork**
Execution spec: `@docs/phases/phase-5.md`

## Phase status
- [x] Phase 1 — Foundation (`@docs/phases/phase-1.md`)
- [x] Phase 2 — Graph Editor (`@docs/phases/phase-2.md`)
- [x] Phase 3 — Import/Export (`@docs/phases/phase-3.md`)
- [x] Phase 4 — Algorithm Engine + Playback (`@docs/phases/phase-4.md`)
- [ ] Phase 5 — Save/Share/Fork (`@docs/phases/phase-5.md`)
- [ ] Phase 6 — Polish (`@docs/phases/phase-6.md`)

Note: Phases 3 and 4 can run in parallel (no dependency between them). Phases 3, 4, and 5 all depend on Phase 2.

## Now
Phase 5 — Save/Share/Fork. See `@docs/phases/phase-5.md`.

## Blockers
- `pnpm prisma migrate dev --name init` requires `.env.local` with real DATABASE_URL.
  User must create `.env.local` from `.env.example` before running migrations.
- OAuth sign-in verification requires real AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET in `.env.local`.

## Done
- **Phase 4 complete** (2026-03-28):
  - Pure algorithm functions: BFS, DFS, Dijkstra, A*, Bellman-Ford
  - Algorithm types: AlgorithmInput/Output/Fn contracts, EventBuilder, pathReconstruction
  - Per-algorithm validation: source/target requirements, negative weight checks, graph type constraints
  - Algorithm registry with labels for all 9 MVP algorithms (5 implemented, 4 slots for Phase 6)
  - PlaybackEngine class: next/previous/goTo/play/pause/restart with setInterval playback
  - computeVisualState: derives node/edge visual highlights from event timeline
  - Playback Zustand store: events, engine, visual highlights, speed control, run lifecycle
  - PlaybackPanel: play/pause/step/restart controls, speed selector, timeline scrubber, step description, run summary
  - AlgorithmTab: algorithm selector, source/target node pickers, heuristic selector, real-time validation, run button
  - algorithmService: validate → run → persist AlgorithmRun metadata → return events + result
  - API route: POST /api/projects/[id]/run with Zod validation
  - Graph mutation invalidation: addNode/removeNode/addEdge/removeEdge/reconnectEdge/updateConfig call invalidateRun()
  - Canvas wiring: playbackStore.visualHighlights passed to toReactFlow adapter
  - Toolbar Run button enabled and wired to algorithm tab
  - 46 new unit tests — all passing (92 total)
  - `pnpm typecheck` ✓ (zero new errors) | `pnpm test` ✓

- Final PRD completed and accepted
- Claude Code instruction system planned
- Documentation rewritten with phase execution specs and 3-tier loading protocol
- **Phase 3 complete** (2026-03-27):
  - Pure parsers: adjacencyList, adjacencyMatrix, jsonImport (all with size limits)
  - ParseResult<T> / ParseError types in `src/lib/parsers/`
  - importService: stamps real graph IDs, calls replaceGraph, writes ImportRecord
  - API routes: POST /api/projects/[id]/import/{adjacency-list,adjacency-matrix,json}
  - ImportModal with three tabs (client-side validation preview, confirm-to-replace)
  - Toolbar Import button wired; Export JSON already present
  - 43 unit tests — all passing
  - `pnpm typecheck` ✓ | `pnpm test` ✓

- **Phase 2 complete** (2026-03-27):
  - Zustand stores: graphStore (CanonicalGraph + mutations), selectionStore, uiStore (toolMode/saveStatus)
  - React Flow adapters: toReactFlow (with playbackHighlights stub), fromReactFlow
  - Custom NodeComponent, EdgeComponent with visualState-based styling
  - ToolRail (select/addNode/connect/delete), Toolbar (export JSON, disabled stubs), InspectorPanel (4 tabs)
  - PlaybackPanel placeholder, useGraphSync (debounced autosave), useEditorKeymap
  - projectService, graphService (Zod-validated, Prisma transaction)
  - API routes: GET/POST /api/projects, GET/PATCH/DELETE /api/projects/[id], GET/PUT /api/projects/[id]/graph
  - Full dashboard (TanStack Query, ProjectCard grid, CreateProjectButton, EmptyState)
  - Full editor page with ReactFlowProvider and load-on-mount
  - `pnpm typecheck` ✓ | `pnpm lint` ✓

- **Phase 1 complete** (2026-03-27):
  - Next.js 16 + React 19 + TypeScript project scaffolded
  - Prisma 6 schema: 10 models (User, Account, Session, VerificationToken, Project,
    GraphRecord, NodeRecord, EdgeRecord, ShareLink, AlgorithmRun, ImportRecord)
  - Auth.js v5 beta configured (Google OAuth + PrismaAdapter)
  - Canonical types: `src/types/graph.ts`, `src/types/events.ts`, `src/types/api.ts`
  - Dark theme (Tailwind v4 CSS tokens, indigo accent, #0a0a0a surface)
  - App shell: Navbar, AppShell, Providers (QueryClient + Session)
  - Routes: `/` (landing), `/sign-in`, `/dashboard` (auth-guarded), `/editor/[projectId]` (auth-guarded)
  - Auth.js catch-all route handler
  - `pnpm typecheck` ✓ | `pnpm lint` ✓ | `pnpm build` ✓

## Backlog (post-MVP)
- SCC
- Bridges / articulation points
- Floyd-Warshall
- Random graph generator
- PNG/SVG export
- Version history
- Side-by-side compare mode
- Presentation mode

## Update rules
- Check off a phase checkbox only when all items in its verification checklist pass.
- Record schema/API/contract changes with a note and date.
- Update "Active phase" and "Now" when moving between phases.
- Keep this file practical — no aspirational content.
