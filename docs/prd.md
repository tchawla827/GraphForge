# FINAL PRD — Graph Visualizer + Pathfinding Playground

## 1. Product Overview

### Product name ideas
- GraphForge
- PathLab
- GraphScope
- NodeRoute
- TraceGraph

**Chosen working name:** **GraphForge**

### One-line product summary
A web-based, full-stack graph algorithm workspace where users can build custom graphs, run algorithms step-by-step, and save or share interactive visualizations.

### Elevator pitch
GraphForge turns graph algorithms from static textbook concepts into an interactive, explorable workspace. Users can create custom directed or undirected weighted graphs, run traversal and shortest-path algorithms with precise playback controls, inspect each step, and save or share projects. It is designed to feel more like a serious engineering tool than a classroom toy.

### Core vision
Build the best desktop web product for understanding, demonstrating, and presenting graph algorithms on arbitrary user-created graphs.

### Why now
There are established algorithm visualization tools, but most are either academic, fixed-demo oriented, or not designed as polished collaborative web products. The opportunity is a modern, product-grade custom graph workspace.

---

## 2. Problem Statement

### What exact user problem is being solved
Students, interview candidates, and educators understand graph algorithms better when they can see state changes, not just read pseudocode. Existing tools often fail one of these needs:
- users cannot create realistic custom graphs easily
- playback is too limited
- projects cannot be saved/shared cleanly
- the product feels like a demo, not a reusable workspace
- algorithms are shown in isolation instead of through a consistent graph editor

### Current alternatives users use
- whiteboard + pen
- LeetCode/editor + imagination
- static YouTube tutorials
- VisuAlgo
- Algorithm Visualizer
- classroom visualizers from universities
- generic diagram tools with no algorithm engine

### Why existing solutions are insufficient
- too many are constrained to preset examples
- many prioritize explanation over creation
- many do not support saved user projects
- sharing is weak or non-existent
- editor UX is often dated
- few feel polished enough to use as both learning tool and public portfolio artifact

### Pain points ranked by severity
1. Inability to inspect state transitions on custom graphs
2. Weak creation/editing UX for graphs
3. No persistent saved workspace
4. No clean share/fork loop
5. Too many tools feel educational but not professional

---

## 3. Target Users

### Primary user persona
**DSA-focused student / interview prep user**
- Age: 18–28
- Uses LeetCode, YouTube, notes, and coding platforms
- Wants intuition, not only implementation
- Needs to see why an algorithm chose a path, updated a distance, or skipped an edge

**Goals**
- understand graph algorithms deeply
- build intuition for interviews/contests
- test edge cases on custom graphs
- share examples with peers

**Behaviors**
- experiments often
- copies sample graphs from problems
- revisits the same concepts multiple times
- wants quick setup, not a long tutorial

**Frustrations**
- textbook diagrams are too static
- existing visualizers are too rigid
- hard to compare algorithm behavior on the same graph

**Buying motivation / trigger**
- preparing for graph-heavy DSA rounds
- wants a cleaner tool than current free learning sites
- wants saved projects and sharable explanations

### Secondary user persona
**CS educator / TA / mentor**
- needs reusable examples
- wants to demo a graph live
- wants students to open the same graph and inspect it
- values clarity, stable share links, and polished visuals

### Who this product is NOT for
- enterprise network analysis teams
- graph database users needing Cypher/Gremlin tooling
- researchers needing very large graph performance
- users wanting real-time multi-user collaboration at launch
- users needing full mobile editing

---

## 4. Market Positioning

### Category of product
Interactive algorithm visualization SaaS / developer education tool.

### Differentiation
GraphForge is not trying to be the biggest algorithm encyclopedia. It is positioning as:
- graph-first
- custom-graph-first
- save/share-first
- product-grade UX
- portfolio-quality presentation

### Competitive comparison

| Product | Strength | Weakness | GraphForge Advantage |
|---|---|---|---|
| VisuAlgo | rich educational content, many algorithm modules | feels more educational portal than reusable workspace | cleaner custom graph workflow, project saving, modern dashboard |
| Algorithm Visualizer | code-oriented visualization concept | less focused on graph-editor product experience | stronger graph UX, explicit playback and sharing |
| USFCA Visualizations | broad academic coverage | dated UI, less productized | premium UI, persistence, sharing, project model |
| Generic diagram tools | flexible graph drawing | no real algorithm engine | actual stepwise algorithm playback |
| LeetCode + paper | familiar to users | no visualization | makes graph state visible and shareable |

### Why users would choose this over alternatives
- build their own graph in seconds
- run multiple algorithms on the same graph
- inspect every step
- save projects
- share a live interactive result
- use a tool that looks polished enough for public demos

### Monetization potential
Moderate. Strong as a portfolio project and plausible as a niche freemium product for interview prep and education. Higher monetization would require classroom features, curated exercise packs, or premium sharing/teaching workflows later.

---

## 5. Product Goals

### Business goals
- launch a polished, public, usable product
- create a project credible for resume and portfolio
- validate whether users care enough about saved projects and advanced explanations to support future freemium upgrades

### User goals
- create a custom graph quickly
- run algorithms visually
- understand each state transition
- save and revisit projects
- share examples with others

### MVP goals
- deliver a fully functional graph editor
- support core graph algorithms with event-driven playback
- support login, save, load, public share, and private link share
- ship a dark, polished dashboard and editor

### Success criteria for first 3 months after launch
- 40%+ of signed-in users create at least one project
- 25%+ of project creators run at least one algorithm
- 15%+ of project creators share at least one project
- median editor session length > 6 minutes
- at least 10 high-quality public demo projects created by users
- near-zero critical bugs in save/load and playback engine

---

## 6. Scope Definition

### MVP features
This PRD intentionally narrows MVP to the features that create a strong product, not a bloated showcase.

1. Google OAuth sign-in
2. Project dashboard
3. Graph editor
4. Directed/undirected toggle
5. Weighted/unweighted toggle
6. Node and edge property editing
7. Manual graph creation
8. Adjacency list paste import
9. Adjacency matrix paste import
10. JSON import/export
11. Save/load projects
12. Public read-only share links
13. Private tokenized share links
14. Fork shared project
15. Playback engine
16. BFS
17. DFS
18. Dijkstra
19. A*
20. Bellman-Ford
21. Topological sort
22. Cycle detection
23. Prim
24. Kruskal
25. Shortest path reconstruction
26. Step / play / pause / resume / restart / speed control
27. Dark premium dashboard
28. Basic onboarding/help

### V1 post-MVP features
- SCC
- bridges / articulation points
- Floyd-Warshall
- random graph generator
- preset sample graphs
- PNG/SVG export
- keyboard shortcut cheat sheet
- version history snapshots
- side-by-side algorithm compare mode
- educator-ready presentation mode

### Future expansion ideas
- classroom assignments
- challenge/problem library
- premium curated graph scenarios
- annotations / comments on graphs
- export to embed widget
- collaborative editing
- graph interview simulator

### Explicit out of scope
- mobile editing parity
- real-time collaboration
- payments in MVP
- leaderboard
- classroom mode
- graph database integrations
- huge-graph optimization for thousands of nodes
- custom user-authored algorithms

---

## 7. Detailed Feature Breakdown

## Feature 1: Authentication
**Why it exists**  
Supports saved projects, ownership, and sharing.

**User story**  
As a user, I want to sign in quickly with Google so I can save and revisit projects.

**Functional requirements**
- Sign in with Google
- persistent session
- sign out
- protected dashboard/editor routes

**Edge cases**
- OAuth cancelled
- expired session
- duplicate account from same email provider

**Validation rules**
- only authenticated users can create or save projects
- public share pages do not require auth

**Permissions / roles**
- guest
- authenticated user

**Success metrics**
- sign-in completion rate
- authenticated-to-project-created conversion

**Priority**
- P0

---

## Feature 2: Project Dashboard
**Why it exists**  
Makes the product reusable, not one-off.

**User story**  
As a user, I want to view, open, duplicate, rename, and delete my graph projects.

**Functional requirements**
- list user projects
- sort by updated date
- create new project
- rename
- duplicate
- soft delete
- open recent project

**Edge cases**
- zero projects
- failed load
- deleted shared project

**Validation rules**
- project title required
- max title length 100 chars

**Permissions / roles**
- owner only for project mutation

**Success metrics**
- returning-user open rate
- projects per user

**Priority**
- P0

---

## Feature 3: Graph Editor
**Why it exists**  
It is the core product.

**User story**  
As a user, I want to create a graph visually and edit nodes and edges easily.

**Functional requirements**
- click to add node
- drag to reposition node
- connect nodes with edges
- edit edge weight and label
- delete node/edge
- multi-select delete
- pan/zoom
- fit view
- toggle directed/undirected
- toggle weighted/unweighted

**Edge cases**
- duplicate parallel edges
- self-loops
- switching weighted → unweighted
- switching directed → undirected on existing graph

**Validation rules**
- node IDs unique
- edge IDs unique
- weights numeric
- when weighted is false, weights are ignored in algorithm execution
- parallel edges allowed only if project setting enabled
- self-loops allowed only if project setting enabled

**Permissions / roles**
- owner/editor only

**Success metrics**
- time to first graph creation
- editor drop-off rate
- save success rate

**Priority**
- P0

---

## Feature 4: Graph Import/Export
**Why it exists**  
Users often already have a graph in textual form.

**User story**  
As a user, I want to paste or upload graph data so I do not have to recreate everything manually.

**Functional requirements**
- import adjacency list
- import adjacency matrix
- import JSON in internal schema
- export JSON
- parse and validate input
- map imported graph to canonical schema

**Edge cases**
- malformed input
- matrix not square
- unsupported weight formats
- invalid node references

**Validation rules**
- adjacency matrix must be square
- adjacency list source/target nodes must exist or be auto-created
- max import size: 1 MB
- max nodes in MVP: 200
- max edges in MVP: 1000

**Permissions / roles**
- owner/editor only

**Success metrics**
- import success rate
- parse error rate by source type

**Priority**
- P0

---

## Feature 5: Playback Engine
**Why it exists**  
This is the actual learning/demonstration value.

**User story**  
As a user, I want to step through algorithms and inspect state changes.

**Functional requirements**
- next step
- previous step
- play
- pause
- restart
- speed control
- scrub through timeline
- show current step description
- show result state at completion

**Edge cases**
- changing graph mid-playback
- rerunning algorithm after graph change
- switching algorithms during playback

**Validation rules**
- playback state invalidated when graph changes
- only one active run at a time
- timeline generated from immutable event list

**Permissions / roles**
- all viewers can control playback on their local session
- only owners can save changes to original project

**Success metrics**
- completed algorithm runs
- average steps viewed
- replay usage

**Priority**
- P0

---

## Feature 6: Core Algorithms
**Why it exists**  
Without good algorithms, there is no product.

**User story**  
As a user, I want to run major graph algorithms on my custom graph.

**Functional requirements**
- BFS
- DFS
- Dijkstra
- A*
- Bellman-Ford
- Topological sort
- Cycle detection
- Prim
- Kruskal
- shortest path reconstruction where relevant

**Edge cases**
- disconnected graph
- unreachable target
- negative edges
- negative cycles
- non-DAG topo request
- MST request on directed graph

**Validation rules**
- Dijkstra blocked if any negative edge exists
- A* requires source and target
- Bellman-Ford allowed on negative weights and reports negative cycle if found
- Topological sort only allowed on directed graphs; surface invalid-state warning if cycle exists
- Prim/Kruskal operate only on undirected weighted graphs
- BFS/DFS allowed on any graph, but directedness respected

**Permissions / roles**
- all viewers can run locally

**Success metrics**
- algorithm run count
- run completion rate
- invalid-run prevention rate

**Priority**
- P0

---

## Feature 7: Sharing
**Why it exists**  
Sharing turns the product from personal utility into networked utility.

**User story**  
As a user, I want to share a read-only version of my graph project.

**Functional requirements**
- generate public link
- generate private token link
- revoke private share link
- fork shared project after sign-in
- shared project opens in read-only mode

**Edge cases**
- revoked links
- owner deletes project
- unauthorized access to private link
- stale share metadata

**Validation rules**
- shared page never mutates original project
- private token length minimum 32 chars
- public share slug unique

**Permissions / roles**
- owner can create/revoke share
- viewer can only view and fork

**Success metrics**
- share rate
- shared project open rate
- fork-from-share rate

**Priority**
- P0

---

## Feature 8: Onboarding & Help
**Why it exists**  
The product should feel usable immediately.

**User story**  
As a first-time user, I want to understand how to create a graph and run an algorithm quickly.

**Functional requirements**
- first-run tooltip guide
- starter sample graph button
- help panel with supported algorithms and constraints
- input format examples

**Edge cases**
- dismissed onboarding
- repeat visits

**Validation rules**
- onboarding shown once per account, resettable in settings

**Permissions / roles**
- all users

**Success metrics**
- time to first successful run
- onboarding completion rate

**Priority**
- P1

---

## Feature 9: Random Graph Generator
**Why it exists**  
Useful, but not necessary to prove core value.

**Priority**
- P1 post-MVP

---

## Feature 10: Side-by-Side Compare Mode
**Why it exists**  
Strong educational value, but not needed for MVP.

**Priority**
- P2

---

## 8. User Flows

### Onboarding
1. User lands on homepage
2. Sees product value proposition and demo CTA
3. Clicks “Try Demo” or “Sign in with Google”
4. If signed in first time, sees empty dashboard with “Create Project” and “Open Sample”
5. Opens editor
6. Tooltip walkthrough highlights node creation, edge creation, algorithm panel, and run button
7. User creates graph or opens sample
8. User selects algorithm and runs it
9. User sees result and is prompted to save project

### Main core workflow
1. User creates or opens project
2. Builds graph
3. Sets graph type options
4. Chooses algorithm
5. Sets source/target when required
6. Clicks run
7. Timeline is generated
8. User uses step/play/pause controls
9. User inspects result
10. Saves project
11. Generates share link

### Return user flow
1. User signs in
2. Dashboard shows recent projects
3. Opens a previous project
4. Modifies graph or reruns algorithm
5. Saves updated version or duplicates project
6. Shares or forks to new scenario

### Payment / upgrade flow
Not in MVP. For future:
1. Free user hits project/share/export limit
2. Upgrade modal shown
3. User selects Pro
4. Completes checkout
5. Limits increase immediately

### Admin / back office flow
Minimal MVP:
1. Admin logs into internal admin route
2. Views total users, projects, share counts, import failures
3. Can revoke abusive public projects
4. Can view flagged share pages

### Error / empty-state scenarios
- no projects yet → “Create your first graph”
- empty graph on run → “Add at least one node and one valid edge”
- invalid algorithm state → human-readable explanation
- failed save → retry banner
- revoked share → 404-style read-only error page
- malformed import → show exact parse error line when possible

---

## 9. Screens / Pages / Information Architecture

## 1. Landing Page
**Purpose**  
Explain value and convert to demo/sign-in.

**Main UI elements**
- hero
- animated demo preview
- feature highlights
- CTA buttons
- sample algorithms supported
- public sample links

**Actions**
- sign in
- open demo
- view public samples

**Data shown**
- marketing copy
- sample screenshots

**Empty states**
- n/a

**Error states**
- auth failure toast

**Responsive notes**
- fully responsive
- editor itself remains desktop-optimized

---

## 2. Dashboard
**Purpose**  
User’s home for project management.

**Main UI elements**
- project list/grid
- recent projects
- create project
- import project
- filters/search

**Actions**
- create
- open
- rename
- duplicate
- delete
- share

**Data shown**
- title
- updated date
- graph stats
- last algorithm used

**Empty state**
- first project CTA
- open sample CTA

**Error states**
- failed project load
- failed delete/duplicate

---

## 3. Editor Workspace
**Purpose**  
Core creation and visualization environment.

**Main UI elements**
- central graph canvas
- top toolbar
- left quick tools
- right properties/algorithm panel
- bottom playback/timeline panel

**Actions**
- add/edit/delete graph elements
- import/export
- save
- share
- run algorithms
- playback control

**Data shown**
- graph
- selected node/edge properties
- algorithm config
- playback event info

**Empty state**
- prompts to add nodes or open sample

**Error states**
- invalid run
- parse error
- failed autosave

**Responsive notes**
- desktop primary
- tablet view partial support
- mobile view can show a read-only warning or restricted mode later

---

## 4. Shared Project Page
**Purpose**  
Read-only public/private viewing.

**Main UI elements**
- graph canvas
- algorithm/run controls
- metadata
- fork button
- owner attribution optional

**Actions**
- run locally
- replay
- fork after login

**Data shown**
- shared graph and saved settings

**Empty state**
- revoked or deleted share page

**Error states**
- invalid token
- project removed

---

## 5. Import Modal
**Purpose**  
Bring in graph data.

**Main UI elements**
- tabs for adjacency list, matrix, JSON
- format examples
- validation output
- preview summary

**Actions**
- paste
- upload
- validate
- import

**Error states**
- specific field/line errors

---

## 6. Share Modal
**Purpose**  
Manage public/private access.

**Main UI elements**
- public link toggle
- private token link
- copy buttons
- revoke controls

**Actions**
- create link
- copy link
- revoke link

---

## 7. Help / Learn Panel
**Purpose**  
Reduce confusion during first use.

**Main UI elements**
- algorithm descriptions
- supported graph types
- restrictions
- input examples
- shortcuts

---

## 10. UX Principles

### UX direction
Premium dark engineering dashboard, not cartoonish education UI.

### Design principles
- keep core action visible: build → run → inspect → save/share
- prefer spatial clarity over decorative density
- every algorithm run should feel inspectable
- do not hide important constraints

### Friction to minimize
- first graph creation
- selecting source/target
- import parsing
- save/share flow
- rerunning after edits

### Trust-building elements
- clear validation messages
- autosave indicator
- read-only badge on shared pages
- graph type badges
- deterministic playback

### Retention hooks
- recent projects
- sample templates
- fork shared projects
- last-run algorithm remembered
- visible improvement of saved portfolio/demo assets

### Accessibility considerations
- keyboard navigation for core controls
- non-color-only state cues
- readable contrast in dark mode
- screen-reader labels for main toolbar actions

---

## 11. Functional Requirements

## Module A — Auth
- The system shall allow sign-in via Google OAuth only.
- The system shall persist authenticated sessions.
- The system shall restrict project mutation actions to authenticated users.
- The system shall permit public and tokenized shared pages without authentication.

## Module B — Project Management
- The system shall allow users to create, rename, duplicate, archive, and delete projects.
- The system shall autosave graph state after editor changes with debounce.
- The system shall show last-updated timestamp on each project.
- The system shall soft delete projects and allow restore for 7 days.

## Module C — Graph Modeling
- The system shall maintain a canonical graph schema for all editor, import, export, and algorithm operations.
- The system shall support nodes with labels and coordinates.
- The system shall support edges with source, target, optional weight, label, and directedness.
- The system shall support project-level settings for weighted, directed, self-loops, and parallel edges.

## Module D — Editor
- The system shall allow node creation via canvas interaction.
- The system shall allow edge creation via node-to-node connect gesture.
- The system shall allow editing node and edge properties in a side panel.
- The system shall support pan, zoom, fit view, selection, and deletion.
- The system shall invalidate previous algorithm playback when graph structure changes.

## Module E — Import/Export
- The system shall accept adjacency list input.
- The system shall accept adjacency matrix input.
- The system shall accept JSON input following internal schema versioning.
- The system shall export the current graph as JSON.
- The system shall validate imported input before applying it.

## Module F — Algorithm Engine
- The system shall execute supported algorithms against canonical graph input.
- The system shall return immutable event timelines for playback.
- The system shall return final result summaries and warnings.
- The system shall block algorithm runs that violate algorithm constraints.
- The system shall support source/target selection where required.

## Module G — Playback
- The system shall support play, pause, resume, restart, next, previous, and speed control.
- The system shall render current step description and highlighted nodes/edges.
- The system shall allow the user to scrub to any step in the timeline.
- The system shall persist the most recent completed run configuration per project.

## Module H — Sharing
- The system shall allow owners to create public read-only share links.
- The system shall allow owners to create private tokenized links.
- The system shall allow owners to revoke share links.
- The system shall allow viewers to fork a shared project after authentication.

## Module I — Admin
- The system shall provide an internal admin dashboard with user/project/share metrics.
- The system shall allow admins to disable abusive public projects.
- The system shall log moderation actions.

---

## 12. Non-Functional Requirements

### Performance expectations
- initial dashboard load under 2.5s on broadband
- editor interactive within 3s for normal projects
- algorithm playback should feel smooth for graphs up to 200 nodes / 1000 edges
- step transition latency under 100ms after timeline generation

### Scalability expectations
- MVP optimized for low thousands of users, not massive scale
- architecture should support separating algorithm compute later if needed

### Security needs
- OAuth session security
- authorization checks server-side on all project mutations
- signed/private share tokens
- rate limiting on imports and share creation
- CSRF-safe auth flow
- input sanitization for project titles and metadata

### Privacy/compliance considerations
- collect minimal PII: name, email, avatar
- no sensitive data category involved
- clear delete-account and delete-project behavior
- shared projects are intentionally public or tokenized by user choice

### Reliability/uptime expectations
- MVP target 99.5% practical uptime
- graceful degraded behavior if DB unavailable
- autosave retries

### Logging/monitoring
- server error logging
- import parsing failures
- share access failures
- save failures
- auth callback errors
- performance timings for run generation

### Backup/recovery
- database backups through provider
- soft deletion for projects
- optional snapshot restore in post-MVP

### Browser/device support
- latest Chrome, Edge, Firefox, Safari desktop
- tablet viewing acceptable
- mobile viewing non-primary and non-guaranteed for editing

---

## 13. Data Model / Entities

### User
- id
- email
- name
- avatarUrl
- createdAt
- updatedAt

### AuthAccount
- id
- userId
- provider
- providerAccountId
- accessToken metadata as needed

### Project
- id
- ownerId
- title
- description
- visibilityDefault
- createdAt
- updatedAt
- archivedAt nullable

### Graph
- id
- projectId
- schemaVersion
- isDirected
- isWeighted
- allowSelfLoops
- allowParallelEdges
- createdAt
- updatedAt

### Node
- id
- graphId
- label
- x
- y
- metadataJson

### Edge
- id
- graphId
- sourceNodeId
- targetNodeId
- weight nullable
- label nullable
- isDirectedOverride nullable
- metadataJson

### AlgorithmRun
- id
- projectId
- algorithm
- sourceNodeId nullable
- targetNodeId nullable
- configJson
- resultJson
- eventCount
- createdAt

### ShareLink
- id
- projectId
- type (`public`, `private_token`)
- slug nullable
- tokenHash nullable
- isActive
- createdBy
- createdAt
- revokedAt nullable

### ImportRecord
- id
- projectId
- type
- originalFilename nullable
- status
- errorSummary nullable
- createdAt

### ActivityLog
- id
- actorUserId nullable
- projectId nullable
- action
- metadataJson
- createdAt

### Relationships
- User 1→many Project
- Project 1→1 Graph
- Graph 1→many Node
- Graph 1→many Edge
- Project 1→many AlgorithmRun
- Project 1→many ShareLink
- Project 1→many ImportRecord

---

## 14. Roles and Permissions

### Guest
Can:
- view landing page
- open public or tokenized share link
- run playback locally on shared pages
Cannot:
- save projects
- create projects
- fork without sign-in
- create shares

### Authenticated User
Can:
- create, edit, delete own projects
- import/export graphs
- run algorithms
- create public/private shares
- fork shared projects
Cannot:
- edit others’ original projects
- access admin controls

### Admin
Can:
- view moderation dashboard
- disable abusive public shares
- inspect aggregate metrics
Cannot:
- silently alter a user’s private project content without audit trail

---

## 15. Technical Recommendations

### Suggested architecture
Single-repo full-stack web app with Next.js App Router, server-side data access, and a client-heavy editor workspace.

### Suggested frontend/backend stack
- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Flow for graph editor/canvas
- Zustand for local editor/playback state
- TanStack Query for async server-state where helpful
- Zod for validation

### Database choice
**PostgreSQL** via **Neon**

Why:
- relational ownership and sharing model fits naturally
- easier future reporting and analytics
- good free starting tier

### ORM
**Prisma ORM**

Why:
- type-safe
- migration support
- strong fit with TypeScript and Postgres

### Auth approach
**Auth.js with Google OAuth**

Why:
- free
- open source
- best fit for simple, low-friction sign-in

### APIs/integrations needed
- Google OAuth
- database
- optional Vercel Blob later for export assets/screenshots
- optional analytics provider

### File storage
Not required in MVP beyond JSON/text import kept in DB-backed project state. Add object storage only when PNG/SVG export or large file uploads are introduced.

### AI model usage
None in MVP. Avoid AI features; they dilute the core.

### Deployment suggestion
- Vercel Hobby for app
- Neon Free for DB

### Analytics setup
- PostHog or self-hosted lightweight analytics later
- start with server-side event logging + simple product events

### Notification system
None in MVP. In-app toasts only.

### Payment system
Not in MVP. Stripe in post-MVP only if monetization is pursued.

---

## 16. API / Backend Module Planning

### Modules
1. Auth
2. Users
3. Projects
4. Graphs
5. Imports
6. Algorithm Runs
7. Sharing
8. Admin
9. Analytics

### High-level endpoints / responsibilities

**Auth**
- OAuth callback/session handling

**Projects**
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

**Graphs**
- `GET /api/projects/:id/graph`
- `PUT /api/projects/:id/graph`

**Imports**
- `POST /api/projects/:id/import/adjacency-list`
- `POST /api/projects/:id/import/adjacency-matrix`
- `POST /api/projects/:id/import/json`

**Algorithms**
- `POST /api/projects/:id/run`
- validates config and returns event timeline + summary

**Sharing**
- `POST /api/projects/:id/shares`
- `GET /api/share/:slugOrToken`
- `DELETE /api/shares/:id`
- `POST /api/share/:slugOrToken/fork`

**Admin**
- `GET /api/admin/stats`
- `POST /api/admin/moderation/share/:id/revoke`

---

## 17. Analytics and KPIs

### North star metric
**Weekly active projects with at least one completed algorithm run**

### Activation metric
User signs in, creates/imports a graph, and completes one algorithm run within first session.

### Retention metrics
- D7 return rate for signed-in users
- repeat project open rate
- projects per user after 30 days
- share rate among active creators

### Revenue metrics
Post-MVP only:
- free-to-paid conversion
- paid user retention
- average revenue per paid user

### Operational metrics
- save failure rate
- import failure rate
- run failure/invalid configuration rate
- median timeline generation time
- share page load success rate

### Events to track
- `signup_completed`
- `project_created`
- `graph_imported`
- `graph_saved`
- `algorithm_run_started`
- `algorithm_run_completed`
- `algorithm_run_blocked_invalid`
- `share_created_public`
- `share_created_private`
- `share_opened`
- `project_forked`
- `onboarding_completed`

---

## 18. Pricing / Monetization

### Recommendation
Do **not** launch payment in MVP.

### Practical monetization model
Freemium, added only after usage proves demand.

### Free
- up to 10 saved projects
- public sharing
- private token sharing
- core algorithms
- JSON export

### Paid Pro
- unlimited projects
- version history
- side-by-side compare mode
- presentation mode
- PNG/SVG export
- advanced algorithms pack
- educator template packs
- custom branding removal on share pages

### Pricing logic
- monthly: $6–10
- yearly: discounted 2 months free equivalent

### Upgrade triggers
- user hits project limit
- wants history or export assets
- educator wants reusable teaching mode
- power user wants compare/presentation tools

### Why users would pay
Not for “algorithms.” They would pay for:
- persistence at scale
- better presentation
- faster teaching/demo workflow
- export/versioning convenience

---

## 19. Risks and Challenges

### Product risks
- trying to include too many algorithms before nailing core UX
- building for everyone instead of one strong use case
- over-educational copy harming product feel

**Mitigation**
- keep MVP graph-first and workspace-first
- ship only the strongest algorithm set first

### Technical risks
- playback state bugs
- graph-editor complexity
- import parsing edge cases
- invalid algorithm constraint handling

**Mitigation**
- event-driven algorithm engine
- canonical schema
- strong validation layer
- unit tests per algorithm + parsing

### Adoption risks
- niche product
- users may use once and churn

**Mitigation**
- emphasize save/share/fork loop
- ship strong sample projects
- make public demos indexable

### Legal/privacy risks
- public shared content moderation
- abuse via share links

**Mitigation**
- moderation tools
- rate limiting
- abuse reporting on public pages

### Operational risks
- free-tier deployment/resource limits
- spike on shared public pages

**Mitigation**
- efficient caching for public share pages
- keep algorithm runs client-side where practical for shared read-only sessions

---

## 20. Assumptions Made

1. The product is primarily a portfolio project, with business potential secondary.
2. Desktop web is the priority; mobile editing is intentionally excluded.
3. Google OAuth only is acceptable at launch.
4. Users care more about custom graph creation and playback than about a giant algorithm catalog.
5. MVP should avoid payments and real-time collaboration.
6. CSV import is intentionally excluded from MVP because adjacency list/matrix + JSON cover the real use cases better and more reliably.
7. A* will use node canvas coordinates for heuristic support.
8. Performance target is moderate-sized graphs, not research-scale graph processing.
9. Public share pages are read-only and forkable, not collaborative.
10. Private sharing is token-link based, not invite-by-email.
11. Admin tooling can be minimal and internal-only.
12. Version history is useful, but not required to prove core value in MVP.

---

## 21. Open Questions

1. Should public shared pages be indexed by search engines or noindex by default?
2. Should forked projects preserve attribution to original shared project?
3. Do you want public sample projects curated manually or seeded automatically at launch?

These are important, but not blockers to starting implementation.

---

## 22. Execution Plan

### Suggested build phases
**Phase 1:** foundation  
**Phase 2:** editor  
**Phase 3:** import/export  
**Phase 4:** algorithm engine + playback  
**Phase 5:** save/share/fork  
**Phase 6:** polish + admin + analytics

### Recommended build order
1. app shell + auth + DB schema
2. dashboard + project CRUD
3. graph editor
4. canonical graph model
5. JSON persistence
6. BFS/DFS + playback engine
7. Dijkstra/A*/Bellman-Ford
8. topo/cycle/MST
9. import flows
10. sharing/forking
11. polish, onboarding, analytics, moderation

### What to ship in first 2 weeks
- auth
- dashboard
- project CRUD
- basic editor
- save/load graph JSON
- node/edge editing
- directed/weighted toggles

### What to ship in first version
- full MVP list from Section 6
- polished landing page
- public/private share
- BFS/DFS/Dijkstra/A*/Bellman-Ford/topo/cycle/Prim/Kruskal
- playback controls
- adjacency list/matrix/JSON import

### Suggested 6–8 week roadmap for a solo/small team

**Week 1**
- repo setup
- DB schema
- auth
- layout shell
- dashboard skeleton

**Week 2**
- project CRUD
- graph model
- editor canvas basics

**Week 3**
- edge/node inspector
- save/load
- graph settings
- autosave

**Week 4**
- playback engine foundation
- BFS/DFS
- event timeline rendering

**Week 5**
- Dijkstra, A*, Bellman-Ford
- validation/warnings
- shortest path UI

**Week 6**
- topo, cycle detection, Prim, Kruskal
- import flows
- export JSON

**Week 7**
- share pages
- private token links
- fork flow
- onboarding/help

**Week 8**
- landing page polish
- analytics
- admin moderation
- bug fixing
- sample projects
- performance cleanup

---

## 23. Acceptance Criteria

### Core MVP Feature: Sign in
- Given a guest user, when they click “Sign in with Google” and complete OAuth, then they are redirected to the dashboard.
- Given an authenticated session, when the user reloads the app, then the session remains active.
- Given a guest, when they try to access `/dashboard`, then they are redirected to sign-in.

### Core MVP Feature: Create and save project
- Given an authenticated user, when they click “Create Project,” then a new project is created and visible on dashboard.
- Given an edited graph, when autosave completes, then a refresh restores the same graph.
- Given a deleted project, when user views dashboard, then the project is not visible in active projects.

### Core MVP Feature: Graph editing
- Given an open project, when the user clicks canvas create-node action, then a node appears on canvas.
- Given two nodes, when user connects them, then an edge is created.
- Given a selected edge, when the user edits its weight, then the new weight is persisted.
- Given a node deletion, when the node is removed, then all connected edges are removed.

### Core MVP Feature: Import
- Given valid adjacency list input, when user imports, then the graph is created accurately.
- Given invalid adjacency matrix input, when user validates, then import is blocked and a readable error is shown.
- Given valid JSON input in schema version, when user imports, then graph state loads without corruption.

### Core MVP Feature: Algorithm run
- Given a valid graph and valid algorithm config, when user clicks run, then a timeline is generated and playback controls become active.
- Given a graph with negative edges, when user selects Dijkstra, then run is blocked with a clear validation message.
- Given a graph change after a completed run, when user attempts playback of old run, then the user is prompted to rerun.

### Core MVP Feature: Playback
- Given a generated timeline, when user clicks next, then exactly one step advances.
- Given a generated timeline, when user clicks previous, then exactly one step reverses.
- Given play mode, when user clicks pause, then playback stops and current state remains visible.
- Given speed control change, then subsequent playback speed updates.

### Core MVP Feature: Share/fork
- Given a project owner, when they create a public share link, then the shared page is accessible without auth.
- Given a private token link, when an invalid token is used, then access is denied.
- Given an authenticated viewer on a shared page, when they click fork, then a new editable copy is added to their dashboard.
- Given a revoked share link, when opened, then it no longer loads project content.

---

## 24. Final Recommendation

This is a strong product idea for a portfolio project and a credible MVP for a niche educational SaaS.

### Viability
- As MVP: strong
- As business: moderate, but only if it becomes more than a single-use visual toy
- As portfolio project: excellent

### What single feature matters most
**The event-driven playback engine on top of a custom graph editor.**

That is the heart of the product. If that feels sharp, the whole product feels serious.

### What to avoid while building
Do not chase breadth before polish. A mediocre product with 20 algorithms is weaker than a sharp product with 8–10 well-visualized algorithms, save/share, and excellent UX.

---

# A. Founder Notes

1. The editor and playback experience are the product. Not the landing page. Not auth. Not the algorithm count.
2. You do not win by adding obscure graph algorithms early. You win by making the same graph feel alive under different algorithms.
3. Public share links are more important than most “fancy” features because they make the product demo-able.
4. Keep the internal data model clean. If the graph schema becomes messy, everything becomes messy.
5. The first impression must be: “I can build a graph in 30 seconds and immediately understand what’s happening.”
6. Make the visuals feel intentional. Colors, states, and motion should communicate meaning, not decoration.
7. If you want this to help on a resume, ship it publicly, seed it with beautiful example graphs, and write a strong architecture readme.

---

# B. Biggest MVP Mistakes to Avoid

1. Building too many algorithms before the editor is smooth
2. Supporting mobile editing too early
3. Adding payments before usage exists
4. Using server calls for every tiny playback step
5. Mixing graph UI state and algorithm engine logic tightly
6. Weak validation messages
7. No sample graphs on day one
8. Making shared pages require login
9. Letting imports silently “best effort” bad data instead of surfacing errors clearly
10. Treating this like an academic page instead of a product

---

# C. Best Version of This Product for Resume vs Business

## Best version for resume
- premium dark UI
- polished editor
- event-driven playback
- save/share/fork
- 8–10 well-done algorithms
- clean architecture
- excellent public demo examples
- strong README and system design explanation

This version proves:
- frontend depth
- full-stack ability
- product thinking
- state management discipline
- algorithm understanding

## Best version for business
- reduce open-ended complexity
- focus on one customer: interview-prep users or educators
- add premium limits and upgrade triggers
- add sample problem packs
- add presentation mode / compare mode / version history
- build a repeat-use loop
- eventually add classroom workflows

### Bottom line
For **resume value**, prioritize elegance, architecture, and demos.  
For **business value**, prioritize repeat usage and a clear willingness-to-pay path.

The best near-term move is to build the **resume version first**, but structure it so it can become the business version later.
