# GraphForge Task Tracker

Last updated: 2026-03-27

## Active phase
**Phase 1 — Foundation**
Execution spec: `@docs/phases/phase-1.md`

## Phase status
- [ ] Phase 1 — Foundation (`@docs/phases/phase-1.md`)
- [ ] Phase 2 — Graph Editor (`@docs/phases/phase-2.md`)
- [ ] Phase 3 — Import/Export (`@docs/phases/phase-3.md`)
- [ ] Phase 4 — Algorithm Engine + Playback (`@docs/phases/phase-4.md`)
- [ ] Phase 5 — Save/Share/Fork (`@docs/phases/phase-5.md`)
- [ ] Phase 6 — Polish (`@docs/phases/phase-6.md`)

Note: Phases 3 and 4 can run in parallel (no dependency between them). Phases 3, 4, and 5 all depend on Phase 2.

## Now
1. Initialize Next.js App Router project with TypeScript, Tailwind, ESLint, src directory
2. Install and configure all core dependencies
3. Set up Prisma schema and Auth.js

See `@docs/phases/phase-1.md` for exact file paths, implementation tasks, and verification checklist.

## Blockers
- None

## Done
- Final PRD completed and accepted
- Claude Code instruction system planned
- Documentation rewritten with phase execution specs and 3-tier loading protocol

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
