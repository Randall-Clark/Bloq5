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
- **Two databases**: `SUPABASE_DATABASE_URL` (app data, used by Drizzle) and local `DATABASE_URL` (executeSql tool only)

### Critical Routing Note
The API server's `app.ts` uses `app.use(router)` (NOT `app.use("/api", router)`).
All route handlers in `artifacts/api-server/src/routes/*.ts` include the `/api/` prefix themselves.
Changing to `app.use("/api", router)` would cause all routes to 404.

### API Response Shapes
- `GET /api/properties` → `{ data: Property[], total, page, limit, totalPages }`
- `GET /api/properties/featured` → `Property[]`
- Other list endpoints: check generated client types for exact shape

### Startup Migration
`artifacts/api-server/src/lib/migrate.ts` runs on server startup to apply schema changes and seed data that can't go through `db push` (e.g. adding `rooms` column, seeding co-living room data).

### Co-living Feature
- `propertiesTable` has `rooms: json[]` column (number, price, status, availableFrom)
- Min 2 bedrooms enforced in pro property form for co-living type
- Property detail page shows per-room status/price grid + sidebar room selection
- Application page has co-living-specific step for room selection (single room or whole apartment)
- Co-living properties in Supabase: IDs 25–29 (Mile End, Plateau, CDN, Toronto, Québec)

### Seed Data
43 demo properties (Montréal, Toronto, Québec, Vancouver, etc.) — owner ID `seed_owner_bloq5`.
Old demo seed: owner IDs `demo_owner_1`/`demo_owner_2` (6 Paris/France properties, may still exist).

### New Property Fields (Phase 1.1)
Added via startup migration: `apartment_number` (text), `building_floors` (integer), `housing_aid_eligible` (boolean, default false), `dpe_class` (text), `dpe_annual_cost_min` (integer), `dpe_annual_cost_max` (integer), `attachments` (jsonb array of {name,url}).
- Amenity labels updated: "Stationnement gratuit" / "Stationnement payant" / "Casier de rangement gratuit" / "Casier de rangement payant" / "Taxe ordures incluse"
- Detail page shows DPE badge, attachments (N/D if empty), housing aid badge (conditional on housingAidEligible)
- Form sections: DPE (A-G picker + cost range), Plan du bâtiment (URL+file), Pièces jointes (multi-file), Aides & conditions (checkbox), Photos with file upload
- File upload via FileReader → base64 data URL stored in DB (MVP)

### Codegen Note
- `lib/api-zod/src/index.ts` only exports `./generated/api` (the zod generator does NOT emit `api.schemas.ts`)
- `lib/api-client-react/src/index.ts` exports both `./generated/api` and `./generated/api.schemas`
- After any OpenAPI change: run codegen, then fix `lib/api-zod/src/index.ts` (remove api.schemas export), restart both workflows
