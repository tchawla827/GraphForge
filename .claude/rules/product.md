# Product Rules

These rules apply across the entire project.

## Product intent
GraphForge is a portfolio-first, production-grade graph algorithm workspace. Build it like a polished product, not a classroom toy and not a bloated feature demo.

## MVP only
Unless the user explicitly asks otherwise, stay inside MVP.

Included in MVP:
- Google OAuth sign-in
- project dashboard
- graph editor
- directed/undirected toggle
- weighted/unweighted toggle
- node and edge editing
- adjacency list import
- adjacency matrix import
- JSON import/export
- save/load projects
- public read-only share links
- private tokenized share links
- fork shared project
- playback engine
- BFS, DFS, Dijkstra, A*, Bellman-Ford, Topological Sort, Cycle Detection, Prim, Kruskal
- shortest path reconstruction where relevant
- play, pause, resume, restart, next, previous, speed control
- dark premium dashboard
- basic onboarding/help

Not in MVP:
- real-time collaboration
- classroom mode
- leaderboard
- payments
- AI features
- full mobile editing
- huge graph optimization
- custom user-authored algorithms

## UX priorities
Always prioritize:
1. Build a graph quickly.
2. Run an algorithm quickly.
3. Understand the current state immediately.
4. Save and share without confusion.

## Product tone
- Premium dark engineering dashboard
- Serious, clean, minimal
- Dense enough for power users, but not cluttered
- Explanatory where needed, never academic-looking by default

## Scope guardrails
- Do not add features because they are “cool.”
- Remove or postpone features that weaken clarity or polish.
- If a feature increases complexity without helping the main loop, defer it.

## Core loop
Build → Run → Inspect → Save → Share → Fork
