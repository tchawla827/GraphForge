# Phase 2 — Graph Editor

## Directive
> **Model:** `claude-opus-4-6` for Zustand store design and canonical↔ReactFlow adapter architecture; `claude-sonnet-4-6` for UI components, inspector panels, and API routes
> **Skills:** `/react-expert` `/senior-frontend` `/typescript-pro` `/senior-backend`
> **Workflow:** `/pro-workflow:develop`

## Goal
Deliver the full working graph editor: React Flow canvas with add/connect/delete nodes and edges, an inspector panel for property editing, graph config toggles, and save/load to the database via debounced autosave. This is the product's core surface — the canonical↔ReactFlow adapter pattern established here is the foundation for all subsequent phases.

## Preconditions
- Phase 1 complete and verified
- `src/types/graph.ts` and `src/types/events.ts` are stable
- Prisma migration ran; `GraphRecord`, `NodeRecord`, `EdgeRecord` models accessible
- Auth works (sign-in creates User, protected routes redirect)

## Files to create

```
src/features/editor/
  store/
    graphStore.ts               Zustand slice: CanonicalGraph state + edit operations (addNode, removeNode, addEdge, removeEdge, updateNode, updateEdge, updateConfig)
    selectionStore.ts           Zustand slice: selected node/edge IDs, selection mode
    uiStore.ts                  Zustand slice: tool mode (select/addNode/connect/delete), panel state
  adapters/
    toReactFlow.ts              CanonicalGraph → ReactFlow nodes/edges with visual style props
    fromReactFlow.ts            ReactFlow change events → CanonicalGraph mutation calls
  components/
    EditorCanvas.tsx            ReactFlow provider wrapper, background grid, controls, minimap
    NodeComponent.tsx           Custom RF node renderer (label, visual state classes)
    EdgeComponent.tsx           Custom RF edge renderer (weight label, visual state classes)
    ToolRail.tsx                Left tool rail (select/addNode/connect/delete mode buttons)
    Toolbar.tsx                 Top toolbar (title, save status, import placeholder, export JSON, share placeholder, run placeholder)
    InspectorPanel.tsx          Right panel with 4 tabs
    tabs/
      GraphTab.tsx              Directed/weighted/self-loops/parallel edges toggles
      SelectionTab.tsx          Node: label editor. Edge: weight + label editor
      AlgorithmTab.tsx          Placeholder — "Coming in Phase 4"
      HelpTab.tsx               Placeholder — "Coming in Phase 6"
    PlaybackPanel.tsx           Bottom panel placeholder — "Coming in Phase 4"
  hooks/
    useGraphSync.ts             Debounced PUT /api/projects/:id/graph on any graph mutation (1000ms)
    useEditorKeymap.ts          Delete key for selected nodes/edges, Escape to deselect
src/app/(dashboard)/dashboard/
  page.tsx                      Full dashboard: project list grid, create button, empty state
  _components/
    ProjectCard.tsx             Title, updated time, node/edge count, actions menu (rename/duplicate/delete)
    CreateProjectButton.tsx     Creates project then navigates to editor
    EmptyState.tsx              "Create your first graph" + "Open sample (Phase 6)"
src/app/(editor)/editor/[projectId]/
  page.tsx                      Full editor page: loads project, renders editor layout
src/app/api/projects/
  route.ts                      GET (list owned), POST (create) — auth required
  [id]/
    route.ts                    GET (single), PATCH (title/description), DELETE (soft) — auth + ownership
    graph/
      route.ts                  GET (canonical graph), PUT (replace graph) — auth + ownership
src/server/
  projectService.ts             createProject, listProjects, getProject, updateProject, deleteProject
  graphService.ts               getGraph, replaceGraph (validates CanonicalGraph with Zod before saving)
src/lib/graph/
  validate.ts                   Zod schema for CanonicalGraph — used by graphService and importService
  utils.ts                      generateNodeId(), generateEdgeId(), defaultGraphConfig()
```

## Files to modify
```
src/app/(editor)/editor/[projectId]/page.tsx   Replace placeholder with full editor implementation
src/app/(dashboard)/dashboard/page.tsx          Replace placeholder with full dashboard implementation
```

## Implementation tasks

1. **Design Zustand stores first** (use `claude-opus-4-6`, `/typescript-pro`):
   - `graphStore`: state = `{ graph: CanonicalGraph | null, isDirty: boolean }`. Operations: `setGraph`, `addNode`, `removeNode` (also removes incident edges), `addEdge`, `removeEdge`, `updateNode`, `updateEdge`, `updateConfig`. Never store ReactFlow objects in this store.
   - `selectionStore`: `{ selectedNodeIds: string[], selectedEdgeIds: string[], clearSelection, selectNodes, selectEdges }`
   - `uiStore`: `{ toolMode: 'select'|'addNode'|'connect'|'delete', activePanel: 'graph'|'selection'|'algorithm'|'help', setSaveStatus }`

2. **Write `toReactFlow.ts` adapter** (use `claude-opus-4-6`):
   - Input: `CanonicalGraph`, `playbackHighlights?: Record<nodeId, 'discovered'|'visited'|'finalized'|'path'>` (for Phase 4)
   - Output: `{ nodes: Node[], edges: Edge[] }` with `data` and `style` props mapped from canonical fields
   - Edge label shows weight when `config.weighted === true`
   - Visual state classes on nodes/edges use `data.visualState` prop (idle/discovered/visited/finalized/path/rejected)

3. **Write `fromReactFlow.ts` adapter**:
   - Handle `onNodesChange`: position changes → `updateNode` in store
   - Handle `onEdgesChange`: edge deletions → `removeEdge` in store
   - Handle `onConnect`: validate against `GraphConfig` (self-loops, parallel edges), then `addEdge`

4. **Build `EditorCanvas.tsx`** (use `/react-expert`):
   - Register custom `NodeComponent` and `EdgeComponent` types
   - Subscribe to `graphStore` via selector, transform with `toReactFlow`, pass to ReactFlow
   - In `addNode` tool mode: `onPaneClick` creates a node at click position
   - ReactFlow `onConnect` calls `fromReactFlow` connection handler
   - Background with dots grid, `<Controls />`, `<MiniMap />`
   - Never call `setNodes`/`setEdges` directly — all mutations go through `graphStore`

5. **Build `NodeComponent.tsx` and `EdgeComponent.tsx`**:
   - Render label; apply Tailwind classes based on `data.visualState`
   - NodeComponent: circle or rounded rect, label centered, selection ring
   - EdgeComponent: shows weight label when present; distinct styles per visual state

6. **Build `InspectorPanel.tsx`** with four tabs:
   - **GraphTab:** Toggles for `directed`, `weighted`, `allowSelfLoops`, `allowParallelEdges` — update `graphStore.updateConfig`
   - **SelectionTab:** When node selected — label input (updates `updateNode`). When edge selected — weight input (number, validates numeric), label input (updates `updateEdge`). Show "Select a node or edge" when nothing selected.
   - **AlgorithmTab:** Placeholder "Algorithm controls coming in Phase 4"
   - **HelpTab:** Placeholder "Help content coming in Phase 6"

7. **Build `Toolbar.tsx`**:
   - Project title display (non-editable here, rename is in dashboard)
   - Save status: "Saved" / "Saving..." / "Unsaved changes" driven by `uiStore.saveStatus`
   - Export JSON button: serializes `graphStore.graph` as JSON download
   - Import, Share, Run buttons: disabled with tooltip "Coming soon" (wired in Phases 3–5)
   - Fit view button, undo/redo (optional, can defer)

8. **Write `graphService.ts`**:
   - `getGraph(projectId, userId)`: fetch `GraphRecord` + `NodeRecord[]` + `EdgeRecord[]`, assemble `CanonicalGraph`, check ownership
   - `replaceGraph(projectId, userId, graph: CanonicalGraph)`: Zod-validate input, delete existing nodes/edges, insert new ones in a Prisma transaction, update `GraphRecord`
   - Use `src/lib/graph/validate.ts` Zod schema to validate before any DB write

9. **Write `projectService.ts`**: all project CRUD with `ownerId` checks on every mutation

10. **Write API routes** — every route: (a) call `auth()`, (b) verify session, (c) call service, (d) return typed response. Ownership errors return 403. Not-found returns 404. Validation errors return 400 with error shape from `docs/context.md`.

11. **Wire `useGraphSync`** (debounced autosave):
    - Watch `graphStore.isDirty`
    - After 1000ms idle: call `PUT /api/projects/:id/graph`, set save status to "Saving...", then "Saved"
    - On error: set save status to "Save failed" with retry button

12. **Build dashboard** (`dashboard/page.tsx`):
    - TanStack Query `useQuery` for project list
    - `ProjectCard` grid with `updatedAt`, node/edge counts from graph stats
    - Create project: POST `/api/projects`, navigate to `/editor/[id]`
    - Rename/duplicate/delete via dropdown menu (optimistic updates with TanStack Query)

## Reference docs
- `@docs/schema.md §1 §2` — canonical graph model and invariants
- `@docs/api.md §1 §2` — projects and graphs API contracts
- `@docs/ui-spec.md §2 §3` — dashboard and editor workspace UI
- `@docs/decisions.md` D-005, D-006

## Verification checklist
- [ ] Can create a new project from dashboard — navigates to editor
- [ ] Can add nodes by clicking canvas in "addNode" tool mode
- [ ] Can connect two nodes by dragging from source handle to target; edge appears
- [ ] Self-loop blocked when `allowSelfLoops === false` (connection rejected silently or with toast)
- [ ] Parallel edge blocked when `allowParallelEdges === false`
- [ ] Node label editable in Selection tab; canvas updates immediately
- [ ] Edge weight editable; canvas shows weight label when `weighted === true`
- [ ] Toggling `directed` updates edge arrowheads on canvas immediately
- [ ] Deleting a node also removes all incident edges
- [ ] Autosave fires after 1 second of inactivity; toolbar shows "Saved"
- [ ] Refreshing the page restores the same graph (loaded from DB)
- [ ] Non-owner accessing `/api/projects/:id` returns 403
- [ ] `PUT /api/projects/:id/graph` with invalid payload returns 400 with error shape
- [ ] Export JSON downloads valid CanonicalGraph JSON
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero errors

## Notes for next phase
Phase 3 (Import/Export) needs `graphService.replaceGraph` to be stable — it will call this method after parsing. The `src/lib/graph/validate.ts` Zod schema must be complete before Phase 3 imports it. Phase 4 (Algorithm Engine) needs `toReactFlow.ts` to accept `playbackHighlights` — ensure the param is present as an optional argument even if unused in Phase 2.
