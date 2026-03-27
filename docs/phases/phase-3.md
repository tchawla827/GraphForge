# Phase 3 — Import/Export

## Directive
> **Model:** `claude-sonnet-4-6`
> **Skills:** `/typescript-pro` `/senior-backend` `/webapp-testing`
> **Workflow:** `/pro-workflow:develop`

## Goal
Build three pure import parsers (adjacency list, adjacency matrix, JSON), the import modal UI with live validation preview, three API import routes, and full unit test coverage for all parsers. Exports (JSON download) should already exist from Phase 2 — verify and add CSV export if scope allows.

## Preconditions
- Phase 2 complete and verified
- `graphService.replaceGraph` is stable
- `src/lib/graph/validate.ts` Zod schema for CanonicalGraph is complete
- Editor loads and saves graphs correctly

## Files to create

```
src/lib/parsers/
  types.ts                    ParseResult<T>, ParseError { line?: number; message: string; context?: string }
  adjacencyList.ts            Pure parser: adjacency list text → ParseResult<CanonicalGraph>
  adjacencyMatrix.ts          Pure parser: adjacency matrix text → ParseResult<CanonicalGraph>
  jsonImport.ts               Validates JSON against CanonicalGraph Zod schema → ParseResult<CanonicalGraph>
  index.ts                    Re-exports all parsers
src/features/editor/components/
  ImportModal.tsx             Tabbed modal: adjacency list / matrix / JSON
  import-tabs/
    AdjListTab.tsx            Textarea, format example, validate button, error display
    AdjMatrixTab.tsx          Textarea, format example, validate button, error display
    JsonImportTab.tsx         Textarea + file upload, validate button, error display
src/app/api/projects/[id]/import/
  adjacency-list/route.ts     POST: parse → validate → graphService.replaceGraph
  adjacency-matrix/route.ts   POST: parse → validate → graphService.replaceGraph
  json/route.ts               POST: parse → validate → graphService.replaceGraph
tests/unit/parsers/
  adjacencyList.test.ts
  adjacencyMatrix.test.ts
  jsonImport.test.ts
```

## Files to modify
```
src/features/editor/components/Toolbar.tsx     Wire Import button to open ImportModal
src/server/importService.ts                    (create if not exists) orchestrate parse + replace + ImportRecord creation
```

## Implementation tasks

1. **Write `src/lib/parsers/types.ts`**:
   ```ts
   type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: ParseError[] }
   interface ParseError { line?: number; column?: number; message: string; context?: string }
   ```

2. **Write `adjacencyList.ts`** (pure function, no side effects, use `/typescript-pro`):
   - Accept input formats: `A: B(4), C(2)` (weighted) and `A: B, C` (unweighted)
   - Also accept `A -> B: 4` or `A B 4` as alternate weighted forms
   - Auto-create nodes for any label seen as source or target
   - Auto-generate positions in a grid layout (e.g., 100px spacing)
   - Return `ParseResult<CanonicalGraph>` with `schemaVersion: 1`
   - Error cases: malformed line, non-numeric weight → include line number in error

3. **Write `adjacencyMatrix.ts`** (pure function):
   - First row may optionally contain node labels (detect by checking if first cell is non-numeric)
   - Matrix must be square — return error if not
   - Cell values: `0` or empty = no edge; positive number = edge weight; `∞` or `Inf` = no edge (for display-only representations)
   - Negative values: record as negative weight (Dijkstra validation happens at run time, not parse time)
   - Auto-generate labels if none provided (`n1`, `n2`, ...)
   - Auto-generate positions in a grid layout

4. **Write `jsonImport.ts`**:
   - Import the CanonicalGraph Zod schema from `src/lib/graph/validate.ts`
   - Validate `schemaVersion === 1` first — if not, return error "Unsupported schema version"
   - Run full Zod validation; map Zod errors to `ParseError[]`
   - On success, return the validated CanonicalGraph

5. **Write import API routes** — each route:
   - `auth()` check + ownership check
   - Call the parser on the request body `text` or `graph` field
   - If `ParseResult.ok === false`, return 400 with `{ error: { code: "VALIDATION_ERROR", message: "...", details: { errors: ParseError[] } } }`
   - If ok, call `graphService.replaceGraph`
   - Create `ImportRecord` in DB (success or error)
   - Return `{ graph: summary, summary: { nodeCount, edgeCount } }` on success

6. **Build `ImportModal.tsx`** with three tabs:
   - Each tab has: large textarea for pasting, a "Format example" collapsible showing the exact expected format, a "Validate" button (calls parser client-side first for instant feedback), error list with line numbers, node/edge count preview when valid, "Import and Replace Graph" confirm button (calls API route, closes modal on success, shows success toast)
   - Warn user that import will replace the current graph
   - File upload button in JSON tab (reads file content into textarea)

7. **Wire Import button** in `Toolbar.tsx` to open `ImportModal` using a dialog state

8. **Enforce limits in parsers** (before returning ok):
   - `nodes.length > 200` → error "Graph exceeds maximum of 200 nodes"
   - `edges.length > 1000` → error "Graph exceeds maximum of 1000 edges"
   - Input text `> 1MB` → error "Input exceeds maximum size of 1 MB" (check in route handler via `request.text()` length)

9. **Write parser unit tests** (use `/webapp-testing`). For each parser test:
   - Valid weighted input → correct node/edge count and weights
   - Valid unweighted input → edges without weights
   - Invalid input → `ok: false` with descriptive errors
   - Empty input → `ok: false`
   - Single node, no edges → valid
   - Input with self-loop → valid (parser allows; GraphConfig enforces at editor level)
   - Input with 201 nodes → `ok: false` with limit error
   - Matrix: non-square → `ok: false` with error
   - JSON: wrong schemaVersion → `ok: false`
   - JSON: missing required fields → `ok: false` with Zod-derived errors

## Reference docs
- `@docs/schema.md §8 §9` — import formats and limits
- `@docs/api.md §3` — import API contracts

## Verification checklist
- [ ] Adjacency list `A: B(4), C(2)\nB: D(7)` → 4 nodes, 3 edges, correct weights
- [ ] Adjacency list with no weights → edges created with `weight: null`
- [ ] Adjacency matrix with first-row labels → correct node labels and edges
- [ ] Invalid adjacency list line → `ParseError` with `line` number set
- [ ] JSON with `schemaVersion: 2` → 400 error "Unsupported schema version"
- [ ] Input with 201 nodes → rejected before hitting DB
- [ ] Import replaces graph in editor immediately (canvas updates)
- [ ] Import modal shows node/edge count preview before user confirms
- [ ] Failed import shows exact error messages (not generic "Something went wrong")
- [ ] `ImportRecord` is written to DB for both successful and failed imports
- [ ] All parser unit tests pass (`pnpm test`)
- [ ] `pnpm typecheck` — zero errors

## Notes for next phase
Phase 4 does not depend on Phase 3. Phases 3 and 4 can be developed in parallel if needed. The parser types (`ParseResult`, `ParseError`) are self-contained and do not affect Phase 4's algorithm types.
