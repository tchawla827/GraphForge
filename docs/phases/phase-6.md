# Phase 6 — Polish

## Directive
> **Model:** `claude-sonnet-4-6` for UI polish, onboarding, admin, and analytics; `claude-haiku-4-5` for the four additional algorithms (follow established Phase 4 patterns exactly)
> **Skills:** `/typescript-pro` `/react-expert` `/epic-design` `/senior-devops` `/webapp-testing`
> **Workflow:** `/pro-workflow:develop` then `/pro-workflow:deslop` before final commit

## Goal
Add four remaining MVP algorithms (Topological Sort, Cycle Detection, Prim, Kruskal), onboarding/help content, sample graphs seeded from the dashboard, admin moderation shell, analytics events, landing page polish, and Playwright end-to-end tests. This phase closes the MVP. Run `/pro-workflow:deslop` before the final commit to remove any accumulated boilerplate.

## Preconditions
- Phases 1–5 complete and all verification checklists pass
- Algorithm engine patterns established in Phase 4 (pure AlgorithmFn, registry, event types, tests)
- Share system live (Phase 5) — sample graphs can be shared publicly

## Files to create

```
src/lib/algorithms/
  topologicalSort.ts          Pure AlgorithmFn — directed graphs only
  cycleDetection.ts           Pure AlgorithmFn — directed (DFS back-edge) and undirected (union-find)
  prim.ts                     Pure AlgorithmFn — undirected weighted only
  kruskal.ts                  Pure AlgorithmFn — undirected weighted only (union-find)
src/lib/samples/
  sampleGraphs.ts             3–5 hardcoded CanonicalGraph objects with descriptive names
  index.ts                    Re-exports
src/features/onboarding/
  HelpPanel.tsx               Full HelpTab content: format examples, algorithm constraints, keyboard shortcuts
src/app/(admin)/admin/
  page.tsx                    Admin dashboard (role check — see implementation task 9)
  _components/
    StatsCards.tsx            User count, project count, share count, run count
    ShareModerationTable.tsx  List of active public shares; revoke button per row
src/app/api/admin/
  stats/route.ts              GET — admin only
  moderation/share/[id]/revoke/route.ts  POST — admin only
src/lib/analytics/
  events.ts                   Typed analytics event names and payload shapes
  track.ts                    Thin wrapper around Vercel Analytics track() or custom endpoint
tests/unit/algorithms/
  topologicalSort.test.ts
  cycleDetection.test.ts
  prim.test.ts
  kruskal.test.ts
tests/e2e/
  editorFlow.test.ts          Playwright: sign in → create project → add nodes/edges → run Dijkstra → verify step count
  importFlow.test.ts          Playwright: paste adjacency list → verify canvas node count
  shareFlow.test.ts           Playwright: create public share → open in incognito → fork
```

## Files to modify
```
src/lib/algorithms/registry.ts              Register 4 new algorithms
src/features/editor/components/tabs/HelpTab.tsx   Replace placeholder with full HelpPanel
src/app/(dashboard)/dashboard/page.tsx       Wire "Open sample" in empty state to load a sample graph
src/app/page.tsx                             Replace hero skeleton with full landing page content
src/lib/analytics/track.ts                  Add track() calls at key user actions (see task 10)
```

## Implementation tasks

1. **Add `topologicalSort.ts`** (use `claude-haiku-4-5` — follow Phase 4 patterns):
   - Directed graphs only (enforced by `validate.ts` — add constraint)
   - Kahn's algorithm (BFS-based): use in-degree tracking; emit `NODE_DISCOVERED` as nodes enter queue, `NODE_FINALIZED` as they are output
   - If a cycle exists (not all nodes finalized): emit `CYCLE_DETECTED` event with the remaining nodes, return `AlgorithmRunResult` with `status: "error"`, `summary: "Graph contains a cycle — topological sort not possible"`
   - `output.order`: array of node IDs in topological order (partial if cycle)

2. **Add `cycleDetection.ts`**:
   - Directed mode (when `config.directed === true`): DFS with color marking (white/gray/black); back-edge = cycle; emit `CYCLE_DETECTED` with cycle node IDs
   - Undirected mode: union-find; an edge between already-connected nodes = cycle
   - `RUN_COMPLETED` message must indicate mode: "Cycle detected in directed graph" vs "Cycle detected in undirected graph"
   - `output.hasCycle: boolean`, `output.cycle?: string[]`

3. **Add `prim.ts`**:
   - Undirected weighted only (enforced by `validate.ts` — add constraint)
   - Min-heap priority queue; start from any node (first node in `graph.nodes`)
   - Emit `EDGE_CONSIDERED`, `EDGE_RELAXED` (added to MST), `EDGE_REJECTED`, `NODE_FINALIZED`
   - `output.mstEdges: string[]` (edge IDs in MST), `output.totalWeight: number`

4. **Add `kruskal.ts`**:
   - Undirected weighted only
   - Sort edges by weight; union-find to detect cycle
   - Emit `EDGE_CONSIDERED`, `EDGE_RELAXED` (added), `EDGE_REJECTED` (would create cycle)
   - `output.mstEdges: string[]`, `output.totalWeight: number`

5. **Register all 4 in `registry.ts`** and add to `validate.ts` constraint checks

6. **Write unit tests** for all 4 algorithms following Phase 4 test patterns:
   - `topologicalSort`: valid DAG → correct topological order; graph with cycle → `CYCLE_DETECTED` + error status
   - `cycleDetection`: directed graph with back-edge → cycle found; acyclic directed → no cycle; undirected with redundant edge → cycle found
   - `prim` and `kruskal`: same known graph → same MST edges and total weight; disconnected graph → MST for largest component

7. **Build `HelpPanel.tsx`** (full HelpTab content, use `/epic-design` for visual polish):
   - **Keyboard shortcuts section:** Delete = delete selected; Escape = deselect; Ctrl+Z = undo (if implemented); Ctrl+S = force save
   - **Algorithm constraints section:** table of algorithm → required graph type → required inputs — render from a constant (not hardcoded strings)
   - **Import format examples section:** collapsible examples for adjacency list and matrix formats
   - **Limits section:** max 200 nodes / 1000 edges / 1 MB import

8. **Build sample graphs** (`src/lib/samples/sampleGraphs.ts`):
   Create 4 samples as complete `CanonicalGraph` objects (with node positions spaced for visual clarity):
   - `dijkstraSample`: 6-node directed weighted graph suitable for Dijkstra demo
   - `dagSample`: 7-node DAG for topological sort demo (no cycles)
   - `mstSample`: 5-node undirected weighted graph for Prim/Kruskal demo
   - `cycleSample`: 4-node directed graph with one cycle for cycle detection demo
   Wire the dashboard empty state "Open sample" dropdown to create a new project and load one of these graphs via `graphService.replaceGraph`.

9. **Build admin shell**:
   - Admin check: `isAdmin` boolean on `User` model in Prisma (add migration) OR hardcode allowed email(s) in env var `ADMIN_EMAILS="a@b.com,c@d.com"` — use env var approach to avoid schema migration
   - `GET /api/admin/stats`: count users, projects, active shares, algorithm runs; return as JSON
   - `POST /api/admin/moderation/share/:id/revoke`: admin-only; calls `shareService.revokeShare` with admin bypass of ownership check; log action to `ActivityLog` table (add if not exists, or use console.log if ActivityLog not yet in schema)
   - Admin dashboard page: simple table layout, no fancy charts needed for MVP

10. **Add analytics events** (use Vercel Analytics or a thin custom wrapper):
    ```ts
    // events.ts
    type AnalyticsEvent =
      | { name: 'project_created' }
      | { name: 'graph_imported'; format: 'adjacency_list'|'adjacency_matrix'|'json' }
      | { name: 'algorithm_run'; algorithm: AlgorithmKey }
      | { name: 'share_created'; type: 'public'|'private_token' }
      | { name: 'project_forked' }
    ```
    Add `track()` calls in: `projectService.createProject`, import API routes, `algorithmService.run`, `shareService.createPublicShare/createPrivateShare`, fork API route.
    Use `import { track } from '@vercel/analytics'` on the client side for user-facing events.

11. **Polish landing page** (`src/app/page.tsx`, use `/epic-design`):
    - Hero: headline, subheadline, "Try Demo" → navigate to editor with sample graph, "Sign in with Google"
    - Feature highlights: 3 cards (Custom graphs, Step-by-step algorithms, Save & share)
    - Algorithm list: badge grid of all 9 algorithm names
    - Public sample projects: link to 2–3 public share URLs (create these manually before launch)

12. **Write Playwright e2e tests** (use `/webapp-testing`):
    - `editorFlow.test.ts`: sign in → create project → add 3 nodes + 2 edges → open Algorithm tab → select BFS → run → verify PlaybackPanel appears → step forward 3 times
    - `importFlow.test.ts`: sign in → create project → click Import → paste adjacency list `A: B(4), C(2)\nB: D(7)` → validate → import → verify canvas shows 4 nodes
    - `shareFlow.test.ts`: sign in → create project → add node → create public share → copy URL → open URL in new browser context (no cookies) → verify read-only badge visible → click Fork → sign-in redirect

13. **Run `/pro-workflow:deslop`** before final commit:
    - Remove all `console.log` debug statements
    - Remove placeholder comments like "// TODO: Phase X"
    - Remove over-engineered abstractions that were added "just in case"
    - Verify no unused imports or dead code

14. **Final quality pass**:
    - `pnpm test` — all tests pass
    - `pnpm typecheck` — zero errors
    - `pnpm lint` — zero errors
    - `pnpm build` — builds successfully with no warnings
    - Deploy to Vercel; verify env vars in Vercel dashboard
    - Smoke test: sign in, create project, import graph, run Dijkstra, create public share, open share in incognito, fork

## Reference docs
- `@docs/schema.md §4 §10` — algorithm keys and constraint rules
- `@docs/api.md §6` — admin API contracts
- `@docs/ui-spec.md §7 §8` — help/onboarding and error states

## Verification checklist
- [ ] Topological sort on a valid DAG produces a correct topological order (verify no node appears before its dependencies)
- [ ] Topological sort on a cyclic directed graph emits `CYCLE_DETECTED` and returns `status: "error"`
- [ ] Cycle detection correctly identifies cycles in directed graphs (DFS) and undirected graphs (union-find) with different messages
- [ ] Prim and Kruskal produce the same MST total weight on the same undirected weighted graph
- [ ] Prim/Kruskal on a directed graph → validation error before run
- [ ] All 9 algorithm unit test files pass
- [ ] Sample graphs load from dashboard empty state → correct graph appears in editor
- [ ] HelpTab shows algorithm constraints table with correct info for all 9 algorithms
- [ ] Admin route returns stats JSON for admin user; returns 403 for non-admin
- [ ] Analytics `track()` fires for: project_created, algorithm_run, share_created (verify in browser network tab or Vercel Analytics dashboard)
- [ ] Playwright e2e tests all pass
- [ ] `pnpm build` — no errors
- [ ] `pnpm typecheck` — zero errors
- [ ] Vercel deployment is live; can sign in with Google, create a project, run an algorithm, and share
- [ ] `/pro-workflow:deslop` has been run and no TODO comments remain in src/

## Notes for next phase
This is the final MVP phase. After this phase is complete:
- Run `/pro-workflow:wrap-up` to capture session learnings
- Update `docs/tasks.md` to mark all phases done
- Post-MVP items are in the Backlog section of `docs/tasks.md` and the post-MVP features section of `docs/prd.md`
