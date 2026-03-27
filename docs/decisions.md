# GraphForge Decisions

This file records settled decisions so implementation does not re-open the same debates repeatedly.

---

## D-001: Build the product as a portfolio-first, production-grade web app
**Status:** accepted

GraphForge is being optimized first for resume/portfolio value, with future business potential as a secondary concern.

Implications:
- polish matters
- architecture matters
- public demos and shareable projects matter
- avoid unnecessary business complexity in MVP

---

## D-002: Use Next.js App Router as a full-stack architecture
**Status:** accepted

Why:
- strong fit for a UI-heavy product
- simpler deployment and repo structure
- enough backend capability for auth, persistence, and sharing
- lower complexity than splitting frontend and backend too early

Implications:
- one repo
- route handlers/server actions for mutations
- server-rendered dashboard and public pages where useful

---

## D-003: Use PostgreSQL + Prisma
**Status:** accepted

Why:
- project ownership, shares, runs, and imports are relational
- Prisma improves type safety and migrations
- Neon is a good free starting DB

Implications:
- keep schema normalized enough for reporting and access control
- document schema changes carefully

---

## D-004: Use Auth.js with Google OAuth only in MVP
**Status:** accepted

Why:
- lowest-friction sign-in
- enough for saved projects and sharing
- avoids unnecessary auth surface area in MVP

Implications:
- no email/password in MVP
- auth must still protect all mutation routes

---

## D-005: Use a canonical graph schema as the source of truth
**Status:** accepted

Why:
- prevents drift between editor, imports, algorithms, and exports
- keeps React Flow as a rendering/editor adapter only
- makes testing much easier

Implications:
- never let React Flow objects become the persistent domain model
- all imports normalize into canonical graph first

---

## D-006: Keep algorithm engine independent from UI
**Status:** accepted

Why:
- algorithms need to be testable
- playback needs deterministic event timelines
- UI libraries should not infect domain logic

Implications:
- algorithms operate on canonical graph input
- output is immutable event timeline + result summary
- playback derives render state from events

---

## D-007: Desktop-first only for MVP
**Status:** accepted

Why:
- editor UX is the core product
- mobile editing would dilute polish and slow delivery
- desktop experience is more relevant for target users

Implications:
- mobile can be view-only or best-effort later
- design and QA prioritize desktop

---

## D-008: No real-time collaboration in MVP
**Status:** accepted

Why:
- complexity is high
- not necessary to prove the core loop
- save/share/fork is enough for the first version

Implications:
- private sharing uses tokenized links
- shared pages are read-only
- collaboration can be revisited after MVP

---

## D-009: Keep payment out of MVP
**Status:** accepted

Why:
- it does not help prove core product value
- it adds distraction and integration work
- usage should come before monetization

Implications:
- product should still be structured so limits and upgrades can be added later

---

## D-010: Ship a focused algorithm set in MVP
**Status:** accepted

MVP algorithms:
- BFS
- DFS
- Dijkstra
- A*
- Bellman-Ford
- Topological Sort
- Cycle Detection
- Prim
- Kruskal

Post-MVP candidates:
- SCC
- bridges / articulation points
- Floyd-Warshall

Why:
- these are enough to show real algorithm breadth without weakening execution quality

---

## D-011: A* uses node coordinates for heuristics
**Status:** accepted

Why:
- the graph editor already has node positions
- this makes A* meaningful without needing a separate grid product

Implications:
- support `euclidean`, `manhattan`, and `zero` heuristic options
- document heuristic assumptions in UI and code

---

## D-012: Shared pages are read-only and forkable
**Status:** accepted

Why:
- supports demos and learning workflows
- protects original projects
- avoids collaboration complexity

Implications:
- owners mutate originals
- viewers can replay locally
- authenticated viewers can fork into their workspace
