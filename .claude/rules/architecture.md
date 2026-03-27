# Architecture Rules

## Core separation
Keep these layers separate:

1. Canonical graph model
2. Import/export and validation
3. Pure algorithm engine
4. Playback engine
5. UI rendering/editor layer
6. Persistence and sharing layer

Do not collapse these layers together.

## Canonical graph schema
All graph data must flow through a canonical schema:
- editor writes canonical state
- imports normalize into canonical state
- algorithms read canonical state
- exports serialize canonical state
- shared pages render canonical state

Never let React Flow node/edge objects become the source of truth.

## Algorithm engine
Algorithms must:
- be pure or near-pure functions
- accept canonical graph input plus run config
- return immutable event timelines and final results
- avoid direct UI dependencies
- be unit-testable without browser APIs

## Playback engine
Playback must:
- consume immutable event timelines
- support next/previous/play/pause/restart/scrub
- derive render state from the event list
- invalidate old runs when the graph changes

Do not mutate historical event objects.

## UI/editor layer
React Flow is a rendering/editor tool, not the data model.
- Keep mapping adapters between canonical graph and React Flow state.
- Keep domain rules out of view components.
- Side panels should edit canonical entities, not ad hoc local duplicates.

## Persistence
Persist:
- project metadata
- graph state
- project settings
- share settings
- optionally latest run config metadata

Do not persist giant UI-only transient objects unless needed.

## Server rules
- All project mutations require authentication.
- All project reads that are private require ownership checks.
- Public shares are read-only.
- Private shares use token-based access.
- Never trust client-provided ownership or permissions.

## Change management
If you change:
- the graph schema
- event schema
- API contracts
- share permissions
- algorithm constraints

then update:
- `docs/schema.md`
- `docs/api.md`
- `docs/decisions.md`
- `docs/tasks.md`
