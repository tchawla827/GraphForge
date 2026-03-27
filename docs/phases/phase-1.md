# Phase 1 — Foundation

## Directive
> **Model:** `claude-haiku-4-5` for scaffolding/boilerplate; `claude-sonnet-4-6` for Prisma schema, auth wiring, and canonical types
> **Skills:** `/nextjs-developer` `/database-schema-designer` `/env-secrets-manager` `/epic-design`
> **Workflow:** `/pro-workflow:develop` (Research → Plan → Implement)

## Goal
Initialize the Next.js project, establish all 8 Prisma entities, wire Auth.js Google OAuth, define the canonical TypeScript types that every subsequent phase depends on, create the app shell (landing, dashboard, editor placeholder), and apply the dark theme base. This phase produces the skeleton — no feature logic, just the foundation that phases 2–6 build on.

## Preconditions
- Node.js 20+ and pnpm installed
- Google Cloud project with OAuth credentials created (CLIENT_ID + CLIENT_SECRET)
- Neon PostgreSQL database provisioned (connection string available)
- Empty working directory at project root

## Files to create

```
package.json                                  pnpm workspace root with all dependencies
next.config.ts                                Next.js config (App Router, TypeScript paths)
tailwind.config.ts                            Dark theme tokens, custom color palette
tsconfig.json                                 TypeScript config with path aliases
.env.example                                  Template with all required env var names (no real values)
.env.local                                    Actual secrets (gitignored)
.gitignore                                    Ensure .env.local, node_modules, .next excluded
prisma/schema.prisma                          Full database schema (8 models)
src/lib/db/client.ts                          Prisma singleton (dev/prod pattern)
src/lib/auth/config.ts                        Auth.js config with Prisma adapter + Google provider
src/types/graph.ts                            CanonicalGraph, GraphNode, GraphEdge, GraphConfig, AlgorithmKey, AlgorithmRunConfig
src/types/events.ts                           PlaybackEvent, PlaybackEventType, AlgorithmRunResult
src/types/api.ts                              ApiError shape, shared API response types
src/app/layout.tsx                            Root layout: dark bg, ThemeProvider, QueryClientProvider, SessionProvider
src/app/page.tsx                              Landing page (hero + CTA skeleton — polish is Phase 6)
src/app/(auth)/sign-in/page.tsx               Sign-in page with "Sign in with Google" button
src/app/(dashboard)/dashboard/page.tsx        Dashboard shell (protected route, empty state placeholder)
src/app/(dashboard)/layout.tsx               Dashboard layout with auth guard
src/app/(editor)/editor/[projectId]/page.tsx  Editor route placeholder (protected, renders "editor coming soon")
src/app/(editor)/layout.tsx                  Editor layout with auth guard
src/app/api/auth/[...nextauth]/route.ts       Auth.js catch-all handler
src/components/ui/                            shadcn/ui init output (button, card, dialog, tabs, etc.)
src/components/layout/navbar.tsx              Top nav: logo, sign-in/out, user avatar
src/components/layout/app-shell.tsx           Authenticated page wrapper
src/components/providers.tsx                  Combined client providers (QueryClient, Session)
```

## Files to modify
None — greenfield project.

## Implementation tasks

1. **Scaffold project** — `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`. Do NOT use `--use-npm`; use pnpm throughout.

2. **Install all dependencies in one pass** (use `/nextjs-developer` patterns for version compatibility):
   ```
   pnpm add @prisma/client next-auth@beta @auth/prisma-adapter
   pnpm add @xyflow/react zustand @tanstack/react-query zod
   pnpm add -D prisma @types/node
   pnpm dlx shadcn@latest init
   ```
   Add shadcn components: `pnpm dlx shadcn@latest add button card dialog tabs input label select separator toast`

3. **Environment setup** (use `/env-secrets-manager`):
   - Create `.env.example` with all 4 required var names and descriptions, no values
   - Create `.env.local` with real values
   - Verify `.gitignore` includes `.env.local`

4. **Prisma schema** (`prisma/schema.prisma`) — use `/database-schema-designer`:
   - `User` (id, email, name, avatarUrl, createdAt, updatedAt)
   - `Account` (Auth.js adapter requirement: id, userId, type, provider, providerAccountId, + OAuth fields)
   - `Session` (Auth.js adapter requirement: id, sessionToken, userId, expires)
   - `Project` (id, ownerId→User, title, description, visibilityDefault, createdAt, updatedAt, archivedAt)
   - `GraphRecord` (id, projectId→Project, schemaVersion, isDirected, isWeighted, allowSelfLoops, allowParallelEdges, createdAt, updatedAt)
   - `NodeRecord` (id, graphId→GraphRecord, label, x, y, metadataJson Json?)
   - `EdgeRecord` (id, graphId→GraphRecord, sourceNodeId, targetNodeId, weight Float?, label String?, metadataJson Json?)
   - `ShareLink` (id, projectId→Project, type, slug?, tokenHash?, isActive, createdBy→User, createdAt, revokedAt?)
   - `AlgorithmRun` (id, projectId→Project, algorithm, sourceNodeId?, targetNodeId?, configJson Json, resultJson Json, eventCount, createdAt)
   - `ImportRecord` (id, projectId→Project, type, originalFilename?, status, errorSummary?, createdAt)
   - Run `pnpm prisma migrate dev --name init`

5. **Canonical types** (`src/types/graph.ts`, `src/types/events.ts`) — use `/typescript-pro`:
   - Types must exactly match `docs/schema.md §1` and `§6`
   - Export all types; these are the single source of truth for phases 2–6
   - Include JSDoc comments on `CanonicalGraph` and `PlaybackEvent` explaining their role

6. **Auth.js config** (`src/lib/auth/config.ts`):
   - Use `@auth/prisma-adapter` with the Prisma client from `src/lib/db/client.ts`
   - Configure Google provider with `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
   - Export `{ handlers, auth, signIn, signOut }` from the config

7. **Dark theme** — use `/epic-design`:
   - `tailwind.config.ts`: extend colors with near-black surface (`#0a0a0a`), dark card (`#111111`), border (`#222222`), accent (single restrained color — e.g., indigo-500 or violet-500), text hierarchy (primary/secondary/muted)
   - Set `darkMode: 'class'` and apply `dark` class on `<html>` in root layout
   - Import and apply Inter or Geist font

8. **Root layout** (`src/app/layout.tsx`):
   - Apply dark background, font, and `dark` class
   - Wrap with `<Providers>` (combined QueryClient + Session providers)
   - No sidebar or nav in root layout — each route group handles its own layout

9. **Auth guard pattern** — create auth guard in `(dashboard)/layout.tsx` and `(editor)/layout.tsx`:
   - Call `auth()` from Auth.js
   - If no session, redirect to `/sign-in`
   - Pass session to child via context or props

10. **Verify and commit** — run `pnpm typecheck`, `pnpm lint`, `pnpm build`; fix all errors before marking done

## Reference docs
- `@docs/schema.md §3` — Persistence entities (exact field names)
- `@docs/schema.md §1` — Canonical graph model (types/graph.ts source)
- `@docs/schema.md §6` — Playback event schema (types/events.ts source)
- `@docs/decisions.md` D-002, D-003, D-004

## Verification checklist
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm build` — builds successfully
- [ ] `pnpm prisma migrate dev` — runs without error against Neon DB
- [ ] `pnpm dev` — starts; landing page renders dark background with "Sign in" CTA
- [ ] Clicking "Sign in with Google" completes OAuth and creates a `User` row in the database
- [ ] Navigating to `/dashboard` without a session redirects to `/sign-in`
- [ ] Navigating to `/editor/[anyId]` without a session redirects to `/sign-in`
- [ ] `src/types/graph.ts` exports `CanonicalGraph`, `GraphNode`, `GraphEdge`, `GraphConfig`, `AlgorithmKey`, `AlgorithmRunConfig`
- [ ] `src/types/events.ts` exports `PlaybackEvent`, `PlaybackEventType`, `AlgorithmRunResult`
- [ ] `.env.local` is absent from git history; `.env.example` is present

## Notes for next phase
Phase 2 imports `CanonicalGraph`, `GraphNode`, `GraphEdge` from `src/types/graph.ts` — these types must be stable before Phase 2 starts. Phase 2 also uses the Prisma `GraphRecord`, `NodeRecord`, `EdgeRecord` models — ensure the migration ran successfully and models are accessible via the Prisma client.
