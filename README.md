# Graph Forge

Graph Forge is a Next.js 16 application for creating graph projects, editing them visually, importing graph data, sharing read-only copies, and running classic graph algorithms.

## Stack

- Next.js 16 App Router
- React 19
- Prisma with PostgreSQL
- Auth.js v5 with Google OAuth
- Zustand for editor state
- TanStack Query for client data
- Vitest for tests

## Features

- Project CRUD with soft-delete archive behavior
- Graph editor with nodes, edges, directed mode, and weighted mode
- Import from adjacency list, adjacency matrix, and canonical JSON
- Algorithm execution and playback
- Public and private share links with revoke support
- Shared graph forking into an authenticated user workspace
- Admin moderation routes
- Health and readiness probes

## Requirements

- Node.js 20 or newer
- pnpm
- PostgreSQL
- Google OAuth credentials

## Environment

Create `.env.local` from `.env.example`.

Required variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `ADMIN_EMAILS`

Rate-limit tuning:

- `GRAPH_FORGE_SHARE_CREATE_RATE_LIMIT_MAX`
- `GRAPH_FORGE_SHARE_CREATE_RATE_LIMIT_WINDOW_MS`
- `GRAPH_FORGE_IMPORT_RATE_LIMIT_MAX`
- `GRAPH_FORGE_IMPORT_RATE_LIMIT_WINDOW_MS`

## Install

```bash
pnpm install
```

## Database

Generate the Prisma client and run migrations:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

For local schema development:

```bash
pnpm prisma migrate dev
```

## Run

```bash
pnpm dev
```

Then open `http://localhost:3000`.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Operations

- `GET /api/health` returns a liveness payload.
- `GET /api/ready` checks database readiness and returns `503` if the app is not ready to serve traffic.
- Share creation and import routes are rate limited in-process. For horizontally scaled production, move this to shared storage.

## Deployment Notes

- Set all environment variables before deploy.
- Run Prisma migrations before serving traffic.
- Configure the correct Google OAuth callback URLs for the deployed domain.
- Wire `/api/health` and `/api/ready` into your platform probes.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` in CI.
