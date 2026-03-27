---
paths:
  - "src/app/**/*"
  - "src/components/**/*"
  - "src/features/**/*.tsx"
  - "src/features/**/*.ts"
  - "src/lib/**/*.tsx"
---
# Frontend Rules

## UI direction
The UI should feel like a premium dark engineering dashboard:
- dark-first
- clean typography
- strong spacing hierarchy
- restrained color use
- meaningful motion only

## Component boundaries
- Keep presentational components separate from domain logic.
- Pull graph/algorithm logic into feature modules or hooks.
- Keep heavy state transitions out of leaf UI components.
- Avoid giant components that mix toolbar, canvas, inspector, and playback logic.

## State management
Use the right state in the right place:
- local UI-only state: component state
- editor/playback state: Zustand
- server state: TanStack Query or server components
- form validation: Zod + form layer

Do not duplicate the same data in multiple stores unless there is a clear adapter boundary.

## Accessibility
- All interactive controls need visible focus states.
- Do not rely only on color to express node/edge state.
- Use labels, tooltips, and legends for graph states.
- Ensure keyboard access for main toolbar, modal, and playback controls.

## Performance
- Memoize expensive graph-to-view transforms.
- Avoid full-canvas rerenders when only playback state changes.
- Split inspector, timeline, and canvas concerns.
- Prefer derived selectors over broad store subscriptions.

## UX expectations
- Empty states must always tell the user what to do next.
- Validation must be human-readable and specific.
- Shared pages must clearly indicate read-only mode.
- Playback controls must be obvious and stable.

## Styling
- Use Tailwind and shadcn/ui consistently.
- Avoid one-off styling patterns that fight the design system.
- Keep spacing, radius, and shadows consistent across the app.
