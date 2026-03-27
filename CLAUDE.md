# GraphForge

GraphForge is a full-stack graph algorithm workspace for building custom graphs, running algorithms step-by-step, and saving or sharing interactive visualizations.

## Loading protocol
For any implementation session, load in order:
1. This file (always)
2. `@docs/context.md` (always — types, file layout, invariants, constraints)
3. `@docs/phases/phase-N.md` — match N to the phase being implemented

Do NOT load `prd.md`, `schema.md`, `api.md`, or `ui-spec.md` at session start. Reference them only when a specific question is not answered by `context.md` or the phase file.

Reference docs (on demand): `@docs/prd.md` `@docs/schema.md` `@docs/api.md` `@docs/ui-spec.md` `@docs/decisions.md`

## Current phase
→ See `docs/tasks.md`

## Working mode
- Use plan mode first for any non-trivial task.
- Stay inside MVP unless explicitly asked to build post-MVP items.
- Prefer small, reviewable commits and focused diffs.
- Before making structural changes, check `docs/decisions.md`.
- After meaningful progress, update `docs/tasks.md`.
- Do not silently change product scope, database schema, or API contracts.

## Product boundaries
- Desktop-first web product. Do not optimize for mobile editing in MVP.
- No real-time collaboration in MVP.
- No payments in MVP.
- No AI features in MVP.
- Public shared pages are read-only and forkable.
- Private sharing is token-link based, not invite-by-email.

## Architecture invariants
- The canonical graph schema is the single source of truth.
- Algorithm logic must remain independent from React Flow UI state.
- Playback must be driven by immutable event timelines.
- UI components must not contain core algorithm logic.
- All server mutations require authentication and ownership checks.
- Dijkstra must reject graphs with negative edges.
- A* requires source and target and uses node coordinates for heuristics.
- Prim and Kruskal only apply to undirected weighted graphs.
- Topological sort only applies to directed graphs and must surface cycle errors.

## Stack
- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Flow (@xyflow/react)
- Zustand
- TanStack Query
- Zod
- Auth.js with Google OAuth
- Prisma
- PostgreSQL (Neon)
- Vercel deployment
- pnpm

## Commands
- Install: `pnpm install`
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Build: `pnpm build`
- Prisma generate: `pnpm prisma generate`
- Prisma migrate dev: `pnpm prisma migrate dev`

## Definition of done
A task is not done unless:
- the implementation matches `docs/prd.md`
- types pass (`pnpm typecheck`)
- lint passes (`pnpm lint`)
- relevant tests are added or updated
- docs are updated if contracts or architecture changed
- `docs/tasks.md` reflects the new status
- all items in the phase verification checklist pass

## Code style
- Prefer feature-based folders over dumping everything in shared folders.
- Prefer pure functions for algorithm and parsing logic.
- Validate all external input with Zod.
- Keep components small and composable.
- Prefer explicit names over clever abstractions.
- Avoid TODO comments without an owning task in `docs/tasks.md`.

## File map
- Product truth: `docs/prd.md`
- Universal quick-facts: `docs/context.md`
- Current execution state: `docs/tasks.md`
- Phase execution specs: `docs/phases/phase-N.md`
- Canonical data model and event schema: `docs/schema.md`
- API contracts: `docs/api.md`
- UI behavior: `docs/ui-spec.md`
- Settled technical decisions: `docs/decisions.md`
- Additional coding rules: `.claude/rules/*.md`
