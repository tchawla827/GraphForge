# Phase 4 — Algorithm Engine + Playback

## Directive
> **Model:** `claude-opus-4-6` for algorithm engine design, event schema finalization, and PlaybackEngine class; `claude-sonnet-4-6` for individual algorithm implementations (after patterns are established), playback UI components, and API route
> **Skills:** `/typescript-pro` `/senior-architect` `/react-expert` `/senior-backend`
> **Workflow:** `/pro-workflow:develop`

## Goal
Implement five pure algorithm functions (BFS, DFS, Dijkstra, A*, Bellman-Ford) that each produce an immutable `PlaybackEvent[]` timeline, the `PlaybackEngine` class that consumes these events, the playback controls UI panel, the algorithm selector tab in the editor, and the algorithm run API route. Algorithm correctness and event schema integrity are non-negotiable — this is the core product value.

## Preconditions
- Phase 2 complete and verified
- `src/types/events.ts` exports `PlaybackEvent`, `PlaybackEventType`, `AlgorithmRunResult`
- `graphService.getGraph` returns a correct `CanonicalGraph`
- `toReactFlow.ts` accepts optional `playbackHighlights` param (per Phase 2 notes)
- Phase 3 can be in parallel — no dependency

## Files to create

```
src/lib/algorithms/
  types.ts                    AlgorithmInput, AlgorithmOutput — input/output contracts for all algorithms
  validate.ts                 Per-algorithm pre-run validation returning { ok: boolean; error?: string }
  eventBuilder.ts             Helper to create typed PlaybackEvents with auto-incrementing stepIndex
  pathReconstruction.ts       Reconstruct shortest path from parent map → PATH_UPDATED events
  bfs.ts                      Pure: (CanonicalGraph, AlgorithmRunConfig) → AlgorithmOutput
  dfs.ts                      Pure: same signature
  dijkstra.ts                 Pure: same signature
  astar.ts                    Pure: same signature
  bellmanFord.ts              Pure: same signature
  registry.ts                 Map AlgorithmKey → algorithm function, used by algorithmService
  index.ts                    Re-exports
src/lib/playback/
  engine.ts                   PlaybackEngine class: next/prev/goTo/play/pause/restart
  applyEvent.ts               Map PlaybackEvent → VisualStateDiff (which nodes/edges change to which state)
  types.ts                    PlaybackState, VisualStateDiff, NodeVisualState, EdgeVisualState
src/features/editor/
  store/
    playbackStore.ts          Zustand: events[], currentStep, engineRef, visualHighlights, runStatus
  components/
    PlaybackPanel.tsx         Full implementation (replaces Phase 2 placeholder)
    timeline/
      TimelineScrubber.tsx    Range input scrubber mapped to event index
      StepDescription.tsx     event.message for current step
      RunSummary.tsx          AlgorithmRunResult summary shown at RUN_COMPLETED
    tabs/
      AlgorithmTab.tsx        Full implementation (replaces Phase 2 placeholder): algorithm selector, source/target pickers, heuristic selector, constraint warnings, Run button
src/server/
  algorithmService.ts         validate → run → persist AlgorithmRun record → return events + result
src/app/api/projects/[id]/run/
  route.ts                    POST: auth + ownership → algorithmService.run
tests/unit/algorithms/
  bfs.test.ts
  dfs.test.ts
  dijkstra.test.ts
  astar.test.ts
  bellmanFord.test.ts
tests/unit/playback/
  engine.test.ts
  applyEvent.test.ts
```

## Files to modify
```
src/types/events.ts                              Finalize all PlaybackEventType values and payload shapes
src/features/editor/adapters/toReactFlow.ts      Wire playbackHighlights from playbackStore to visual state props
src/features/editor/components/EditorCanvas.tsx  Subscribe to playbackStore for visual highlights
```

## Implementation tasks

1. **Finalize `src/types/events.ts`** (use `claude-opus-4-6`):
   - Document the expected `payload` shape for each `PlaybackEventType` in JSDoc
   - `NODE_DISCOVERED`: `{ nodeId: string }`
   - `NODE_VISITED`: `{ nodeId: string }`
   - `NODE_FINALIZED`: `{ nodeId: string }`
   - `EDGE_CONSIDERED`: `{ edgeId: string, from: string, to: string }`
   - `EDGE_RELAXED`: `{ edgeId: string, newDistance: number, via: string }`
   - `EDGE_REJECTED`: `{ edgeId: string, reason: string }`
   - `QUEUE_UPDATED` / `STACK_UPDATED` / `PRIORITY_QUEUE_UPDATED`: `{ items: string[] }`
   - `DISTANCE_UPDATED`: `{ nodeId: string, distance: number }`
   - `PATH_UPDATED`: `{ path: string[] }` (node ID sequence)
   - `CYCLE_DETECTED`: `{ cycle: string[] }` (node IDs in cycle)
   - `RUN_WARNING`: `{ message: string }`
   - `RUN_COMPLETED`: no payload (check `AlgorithmRunResult.status`)

2. **Write `src/lib/algorithms/types.ts`** (use `claude-opus-4-6`):
   ```ts
   interface AlgorithmInput { graph: CanonicalGraph; config: AlgorithmRunConfig }
   interface AlgorithmOutput { events: PlaybackEvent[]; result: AlgorithmRunResult }
   type AlgorithmFn = (input: AlgorithmInput) => AlgorithmOutput
   ```

3. **Write `validate.ts`** — pure validation, no side effects:
   - `validateAlgorithmInput(graph: CanonicalGraph, config: AlgorithmRunConfig): { ok: true } | { ok: false; error: string }`
   - Check each constraint from `docs/context.md` algorithm constraints section
   - Return human-readable error messages suitable for display in the UI

4. **Write `eventBuilder.ts`** — helper that maintains a counter and creates typed `PlaybackEvent` objects:
   ```ts
   class EventBuilder { private step = 0; emit(type, payload, message): PlaybackEvent }
   ```

5. **Write `bfs.ts`** — use a queue; emit events in order:
   - `RUN_STARTED`
   - For each node dequeued: `NODE_VISITED`, then for each neighbor: `NODE_DISCOVERED` (if unvisited), `EDGE_CONSIDERED`, `QUEUE_UPDATED`
   - `RUN_COMPLETED`
   - Respect `config.directed`: if undirected, traverse both directions per edge

6. **Write `dfs.ts`** — use a stack (iterative, not recursive to avoid stack overflow on large graphs):
   - Same event types as BFS but `STACK_UPDATED` instead of `QUEUE_UPDATED`

7. **Write `dijkstra.ts`** (use `claude-opus-4-6` for first implementation, pattern established for others):
   - Reject negative edges in `validate.ts` (not here)
   - Min-heap priority queue; emit `PRIORITY_QUEUE_UPDATED`, `EDGE_RELAXED`/`EDGE_REJECTED`, `DISTANCE_UPDATED`, `NODE_FINALIZED`
   - On completion: call `pathReconstruction.ts` to emit `PATH_UPDATED` events if target was specified
   - `AlgorithmRunResult.output` = `{ distances: Record<nodeId, number>, path?: nodeId[] }`

8. **Write `astar.ts`**:
   - Requires source + target (enforced by validate.ts)
   - Heuristic: `euclidean(a, b) = sqrt((a.x-b.x)² + (a.y-b.y)²)`, `manhattan = |a.x-b.x| + |a.y-b.y|`, `zero = 0`
   - Same event types as Dijkstra

9. **Write `bellmanFord.ts`**:
   - Relax all edges `|V|-1` times
   - On `|V|`-th iteration, detect negative cycle → emit `CYCLE_DETECTED` event + `RUN_WARNING` + `RUN_COMPLETED` with `status: "warning"`
   - If no cycle: emit `PATH_UPDATED` events for each reachable node

10. **Write `pathReconstruction.ts`**:
    - Input: `parent: Record<nodeId, nodeId | null>`, source, target
    - Walk parent map backwards; emit a single `PATH_UPDATED` event with the full path array
    - Return `null` if target unreachable

11. **Write `PlaybackEngine`** (use `claude-opus-4-6`):
    ```ts
    class PlaybackEngine {
      constructor(private events: readonly PlaybackEvent[]) {}
      get currentStep(): number
      get totalSteps(): number
      next(): PlaybackEvent | null
      previous(): PlaybackEvent | null
      goTo(index: number): PlaybackEvent
      play(onStep: (e: PlaybackEvent) => void, intervalMs: number): void
      pause(): void
      restart(): void
    }
    ```
    - `play` uses `setInterval`; `pause` clears it
    - Engine is stateful but events array is immutable

12. **Write `applyEvent.ts`**:
    - Maintains a `visualState: Record<id, NodeVisualState | EdgeVisualState>` by processing events 0..currentStep
    - NodeVisualState: `'idle'|'discovered'|'visited'|'finalized'|'path'`
    - EdgeVisualState: `'idle'|'considered'|'relaxed'|'rejected'|'path'`
    - This is how the UI knows what color to render each node/edge

13. **Update `playbackStore.ts`** (full implementation):
    - `startRun(events, result)`: stores events, creates PlaybackEngine, sets `runStatus: 'ready'`
    - `invalidateRun()`: called when graph mutates; sets `runStatus: 'invalidated'`, clears engine
    - `setStep(index)`: calls `engine.goTo`, recomputes `visualHighlights` via `applyEvent`
    - `visualHighlights`: `Record<id, NodeVisualState | EdgeVisualState>` — consumed by `toReactFlow` adapter

14. **Connect playback to canvas**:
    - `toReactFlow.ts`: accept `visualHighlights` param; map to `data.visualState` on each node/edge
    - `EditorCanvas.tsx`: subscribe to `playbackStore.visualHighlights`, pass to `toReactFlow`
    - Node/edge components: use `data.visualState` to pick Tailwind classes

15. **Build `PlaybackPanel.tsx`** (full implementation):
    - Shows only when `playbackStore.runStatus === 'ready'` or `'invalidated'`
    - Step back / play-pause / step forward / restart buttons
    - Speed selector (0.5x / 1x / 2x / 4x → maps to intervalMs)
    - `TimelineScrubber`: `<input type="range">` mapped to step index
    - `StepDescription`: renders `currentEvent.message`
    - `RunSummary`: shown when `playbackStore.currentStep === totalSteps - 1` (at RUN_COMPLETED)

16. **Build `AlgorithmTab.tsx`** (full implementation):
    - Algorithm selector (dropdown with all 9 keys + human labels)
    - Source node selector (searchable dropdown from current graph nodes)
    - Target node selector (shown only for Dijkstra, A*, Bellman-Ford)
    - Heuristic selector (shown only for A*)
    - Validation warning area: run `validate.ts` in real time as selections change; show human error if invalid
    - "Run Algorithm" button: disabled if validation fails; on click, calls `POST /api/projects/:id/run`, on response calls `playbackStore.startRun`
    - "Invalidated — Rerun?" banner when `runStatus === 'invalidated'`

17. **Write `algorithmService.ts`** and API route:
    - `run(projectId, userId, config)`: get graph → validate → run algorithm function → persist `AlgorithmRun` → return `AlgorithmOutput`
    - API route returns `{ run: { algorithm, events, result } }` per `docs/api.md §4`
    - Persist summary metadata in `AlgorithmRun.resultJson` (not the full event array)
    - Return full event array in API response (not persisted)

18. **Wire graph mutation invalidation**:
    - In `graphStore`: after any mutation (`addNode`, `removeNode`, `addEdge`, `removeEdge`, `updateConfig`), call `playbackStore.invalidateRun()`
    - Updating node/edge properties (label, weight) does NOT invalidate (position/style-only change)

19. **Write algorithm tests** for each algorithm:
    - Happy path: known small graph → verify correct event sequence and final output
    - Disconnected graph: source cannot reach some nodes → those nodes absent from output
    - Single node graph: valid run, no edges, trivial output
    - Constraint violation: call `validate.ts` directly → expect `ok: false` with correct message
    - Dijkstra: graph with negative edge → validation rejects before run
    - Bellman-Ford: graph with negative cycle → `CYCLE_DETECTED` event present, `status: "warning"`
    - A*: missing target → validation rejects
    - Playback engine tests: `next`/`previous`/`goTo`/`play`/`pause`/`restart` behavior

## Reference docs
- `@docs/schema.md §4 §5 §6 §7 §10` — algorithm keys, run config, event schema, result schema, constraints
- `@docs/api.md §4` — algorithm run API contract
- `@docs/decisions.md` D-006, D-010, D-011

## Verification checklist
- [ ] BFS on a 5-node directed graph produces `NODE_DISCOVERED` / `NODE_VISITED` in correct BFS order
- [ ] DFS uses `STACK_UPDATED` instead of `QUEUE_UPDATED`
- [ ] Dijkstra: graph with a negative edge → `validate.ts` returns `ok: false` before any event is emitted
- [ ] Dijkstra: correct shortest distances on a known test graph (e.g., Sedgewick tinyEWD)
- [ ] A*: missing target → validation error returned from API with 400 status
- [ ] A* with euclidean heuristic produces correct path on a 4-node grid graph
- [ ] Bellman-Ford: graph with negative cycle → `CYCLE_DETECTED` event in output, `status: "warning"`
- [ ] `PlaybackEngine.next()` advances step index; `previous()` rewinds; `goTo(n)` jumps
- [ ] `play()` fires `onStep` callback at the configured interval; `pause()` stops it
- [ ] Modifying graph (add/remove node/edge) sets `playbackStore.runStatus` to `"invalidated"`
- [ ] `AlgorithmTab` shows inline validation warning when selecting Dijkstra on a graph with negative edges
- [ ] Canvas nodes/edges change color during playback to reflect visual state
- [ ] Scrubber jumps to arbitrary step; visual state updates correctly
- [ ] All algorithm unit tests pass (`pnpm test`)
- [ ] `pnpm typecheck` — zero errors

## Notes for next phase
Phase 5 (Save/Share/Fork) depends on `graphService.getGraph` and `projectService` — both already exist from Phase 2. Phase 5 does not depend on any Phase 4 output. Phase 6 adds 4 more algorithms following the exact patterns established here: implement as pure `AlgorithmFn`, register in `registry.ts`, add tests.
