# Phase 5 — Save/Share/Fork

## Directive
> **Model:** `claude-sonnet-4-6`
> **Skills:** `/senior-backend` `/senior-security` `/senior-frontend` `/nextjs-developer`
> **Workflow:** `/pro-workflow:develop`

## Goal
Implement public share links (slug-based, no auth required), private tokenized share links, the shared read-only page (SSR), and the fork flow. This phase delivers the "share and fork" half of the product's core loop and enables public demos.

## Preconditions
- Phase 2 complete and verified
- `projectService.getProject` and `graphService.getGraph` are stable
- Auth works; `ShareLink` model exists in Prisma schema

## Files to create

```
src/lib/share/
  tokenGenerator.ts           Generate 32-byte random hex token; return { raw, hash }
  slugGenerator.ts            Generate readable public slug (e.g., "bright-graph-7a3f")
src/server/
  shareService.ts             createPublicShare, createPrivateShare, revokeShare, getShareBySlugOrToken, verifyAndGetShare
src/features/share/
  ShareModal.tsx              Modal with two states: no share active / share active
  ShareLinkDisplay.tsx        Shows URL, copy button, revoke button; private token shown once
src/app/share/
  [slugOrToken]/
    page.tsx                  SSR public shared page
    _components/
      ReadOnlyBadge.tsx       "Read-only" badge shown in top corner
      ForkButton.tsx          Fork CTA — shows sign-in prompt if guest, calls fork API if authenticated
src/app/api/projects/[id]/shares/
  route.ts                    POST: create share (public or private_token)
src/app/api/shares/
  [id]/
    route.ts                  DELETE: revoke share
src/app/api/share/
  [slugOrToken]/
    route.ts                  GET: resolve slug/token → return project + graph (read-only payload)
    fork/
      route.ts                POST: fork shared project into authenticated user's workspace
tests/integration/share/
  shareAccess.test.ts         Permission boundary tests for all share scenarios
```

## Files to modify
```
src/features/editor/components/Toolbar.tsx     Wire Share button to open ShareModal
src/app/(dashboard)/dashboard/page.tsx          Add share action to ProjectCard actions menu
```

## Implementation tasks

1. **Write `tokenGenerator.ts`** (use `/senior-security`):
   ```ts
   import { randomBytes, createHash } from 'crypto'
   function generateToken(): { raw: string; hash: string } {
     const raw = randomBytes(32).toString('hex')  // 64 char hex string
     const hash = createHash('sha256').update(raw).digest('hex')
     return { raw, hash }
   }
   ```
   - `raw` is shown to the user once and never stored
   - `hash` is stored in `ShareLink.tokenHash`
   - To verify: hash the incoming token, compare to stored hash

2. **Write `slugGenerator.ts`**:
   - Generate a readable slug: `${adjective}-${noun}-${4hexChars}` (e.g., "bright-graph-7a3f")
   - Use a small hardcoded word list (~50 adjectives, ~50 nouns) — keep it simple
   - Check for uniqueness in DB (loop until unique slug found, max 5 attempts)

3. **Write `shareService.ts`**:
   - `createPublicShare(projectId, userId)`: generate slug, create `ShareLink` record, return `{ id, url }`
   - `createPrivateShare(projectId, userId)`: generate token, store hash, return `{ id, url, rawToken }` — `rawToken` is ONLY returned here, never again
   - `revokeShare(shareId, userId)`: ownership check, set `isActive = false`, set `revokedAt`
   - `getShareBySlugOrToken(slugOrToken)`: try slug first, then hash the input and try tokenHash lookup; return project + graph payload if share is active; return null if revoked/not found
   - Never expose `tokenHash` in any API response

4. **Write share creation API route** (`POST /api/projects/:id/shares`):
   - Auth + ownership required
   - Request body: `{ type: "public" | "private_token" }`
   - Validate with Zod
   - Call `shareService.createPublicShare` or `createPrivateShare`
   - Return `{ share: { id, type, url, isActive } }` for public; add `rawToken` field for private (one time only)

5. **Write share revoke route** (`DELETE /api/shares/:id`):
   - Auth + ownership check (load share, check share.projectId → project.ownerId)
   - Call `shareService.revokeShare`
   - Return `{ ok: true }`

6. **Write share read route** (`GET /api/share/:slugOrToken`):
   - No auth required
   - Call `shareService.getShareBySlugOrToken`
   - If not found or revoked: return 404
   - Return `{ project: { id, title }, graph: CanonicalGraph, share: { type, readOnly: true } }`
   - Never leak private project data for non-matching tokens

7. **Write fork route** (`POST /api/share/:slugOrToken/fork`):
   - Auth required (fork requires sign-in)
   - Resolve share; if revoked/invalid return 404
   - Deep-clone the project: create new `Project`, new `GraphRecord`, duplicate all `NodeRecord` and `EdgeRecord` rows, set `ownerId` to the forking user
   - Title: `"Copy of {original title}"`
   - Return `{ project: { id, title } }` — client navigates to `/editor/[id]`

8. **Build `ShareModal.tsx`** (use `/senior-frontend`):
   - State 1 (no share): two buttons "Create public link" and "Create private link"
   - State 2 (public share active): URL field + "Copy" button + "Revoke" button
   - State 3 (private share just created): URL field + token display with "Copy all" + WARNING "This token will not be shown again" + "Revoke" button
   - State 4 (private share active, token gone): "Private link active" + "Revoke" button (no way to recover raw token)
   - Multiple share links: a project can have multiple active share links; list them
   - Use `react-query` to load existing shares on mount

9. **Build shared read-only page** (`/share/[slugOrToken]/page.tsx`) — use `/nextjs-developer`:
   - Server component: call `shareService.getShareBySlugOrToken` on the server at render time
   - If not found/revoked: render a clean 404 "This share link is no longer active" page
   - If found: render editor canvas in read-only mode with the shared graph
   - `ReadOnlyBadge` in top corner
   - `ForkButton`: if authenticated → "Fork to my workspace" → POST fork API; if guest → "Sign in to fork"
   - All Zustand editor mutations disabled (pass `readOnly={true}` prop to editor components)
   - Playback still works: user can run algorithms locally on the shared graph (no server save)
   - No Import, Export, Save, or Share buttons visible

10. **Enforce read-only mode**:
    - `EditorCanvas`: if `readOnly`, disable `onPaneClick`, `onConnect`, node drag
    - `ToolRail`: hidden in read-only mode
    - `Toolbar`: only show "Fork" and algorithm Run button in read-only mode
    - `InspectorPanel`: selection tab is display-only (no inputs)

11. **Write share integration tests**:
    - Public share URL accessible without auth → returns project + graph
    - Wrong private token → 403 with no project data
    - Revoked public share → 404
    - Fork creates new project owned by forking user (different `ownerId`)
    - Non-owner cannot create share for another user's project
    - Non-owner cannot revoke another user's share

## Reference docs
- `@docs/api.md §5` — sharing API contracts
- `@docs/ui-spec.md §5 §6` — share modal and shared project page
- `@docs/decisions.md` D-008, D-012

## Verification checklist
- [ ] Creating public share generates `/share/[slug]` URL accessible without auth
- [ ] Public share page renders the correct graph in read-only mode
- [ ] Creating private share shows raw token exactly once in the modal
- [ ] Wrong private token returns 403; no project data included in response
- [ ] Shared page has no edit controls (no tool rail, no add/connect/delete)
- [ ] Playback works on shared page — can run algorithm and step through events
- [ ] Fork creates new project in forking user's dashboard with all nodes/edges copied
- [ ] Fork of a public share does not require the original owner's auth
- [ ] Revoking a share makes the URL return 404
- [ ] `ShareLink.tokenHash` is never exposed in any API response (check via test)
- [ ] Non-owner cannot call `POST /api/projects/:id/shares` for another user's project → 403
- [ ] All share integration tests pass
- [ ] `pnpm typecheck` — zero errors

## Notes for next phase
Phase 6 (Polish) does not depend on Phase 5 completion — algorithms and onboarding work can proceed in parallel. Phase 6 does need Phase 5 when wiring "Share" on sample graphs, but that can be deferred. All critical share infrastructure must be complete and tested before Phase 6 is marked done.
