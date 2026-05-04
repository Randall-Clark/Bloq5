# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: bloq5 — Gestion Immobilière (Phase 1 MVP)

French-language real estate rental management platform.

### Architecture
- **Frontend**: React + Vite at `/` (port from `$PORT`) — artifact `bloq5`
- **Backend**: Express 5 API at `/api` (port 8080) — artifact `api-server`
- **Auth**: better-auth (email/password + OAuth: Google & GitHub via env vars)
- **DB**: PostgreSQL + Drizzle ORM (`@workspace/db`)
- **API codegen**: Orval from `lib/api-spec/openapi.yaml` → `lib/api-client-react`

### Critical Routing Note
The API server's `app.ts` uses `app.use(router)` (NOT `app.use("/api", router)`).
All route handlers in `artifacts/api-server/src/routes/*.ts` include the `/api/` prefix themselves.
Changing to `app.use("/api", router)` would cause all routes to 404.

### API Response Shapes
- `GET /api/properties` → `{ data: Property[], total, page, limit, totalPages }`
- `GET /api/properties/featured` → `Property[]`
- Other list endpoints: check generated client types for exact shape

### Seed Data
6 demo properties inserted (Paris, Bordeaux, Lyon, Nice, La Défense).
Owner IDs are `demo_owner_1` and `demo_owner_2` (not real Clerk users).
