---
paths:
  - "src/app/api/**/*"
  - "src/server/**/*"
  - "src/lib/db/**/*"
  - "src/features/**/*.server.ts"
  - "prisma/**/*"
---
# Backend Rules

## API design
- Keep routes resource-oriented and predictable.
- Validate request payloads with Zod at the boundary.
- Return stable, typed response shapes.
- Use explicit error messages for invalid graph or algorithm states.

## Auth and authorization
- Every mutation requires authentication.
- Every project mutation requires ownership checks.
- Shared public pages are read-only.
- Private share tokens must be verified server-side.
- Never expose private project data through share routes.

## Database usage
- Use Prisma for normal database access.
- Prefer transactions when writing multiple related records.
- Avoid raw SQL unless there is a clear performance or feature reason.
- Keep schema changes documented in `docs/schema.md` and `docs/decisions.md`.

## Domain structure
Prefer:
- route handler / server action
- service layer
- repository or data access layer
- shared validation/schema layer

Avoid putting business logic directly in route handlers.

## Error handling
Use consistent error categories:
- auth error
- permission error
- validation error
- not found
- domain constraint error
- unexpected server error

Never swallow exceptions silently.

## Security
- Sanitize text inputs.
- Hash or safely store private share tokens.
- Rate limit imports and share creation if implemented.
- Do not trust client-sent graph flags without validation.

## Algorithm execution
- Keep server-side algorithm execution optional and explicit.
- If algorithm runs are stored, persist summary metadata, not unnecessary UI state.
