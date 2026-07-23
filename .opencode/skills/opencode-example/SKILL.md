---
name: opencode-example
description: >-
  Project skill for the opencode-example Pokedex app. Use when working on this
  codebase: InsForge database queries, Next.js 16 App Router components, pgvector
  semantic search, Pokemon data pipeline, SQL migrations, or Tailwind CSS styling.
  Covers architecture, conventions, known gotchas, and commands.
---

# opencode-example Project Skill

Pokedex web app with an InsForge (Postgres) backend and a Next.js 16 frontend.
All Pokemon data lives in 19 database tables; the frontend reads it via
`@insforge/sdk` and renders a searchable/filterable grid.

## Quick Reference

| What | Where |
|---|---|
| Frontend dev server | `cd web && pnpm dev` |
| Lint | `cd web && pnpm lint` |
| Build | `cd web && pnpm build` |
| SQL migrations | `migrations/*.sql` |
| Data injection | `python scripts/inject_data.py` |
| InsForge project config | `.insforge/project.json` |
| App env vars | `web/.env.local` (never commit) |

## Architecture

```
assets/csv/  ->  scripts/  ->  migrations/*.sql  ->  InsForge DB
                                                         |
                                                    web/ (SDK)
                                                         |
                                                    Pokedex UI
```

- **Server Component** (`web/app/page.tsx`): fetches all Pokemon + types via
  InsForge SDK, passes them as props to the client component.
- **Client Component** (`web/app/pokedex-client.tsx`): search, type filter,
  semantic search, and "Load More" pagination — all client-side.
- **API Route** (`web/app/api/search/route.ts`): embeds a query with Google
  Gemini, calls the `match_pokemon` RPC, returns matching IDs.

## InsForge Integration

### SDK Client

```ts
// web/lib/insforge.ts
import { createClient } from "@insforge/sdk"
export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
})
```

### Correct API Paths (CRITICAL)

InsForge does **not** use standard PostgREST paths. Getting these wrong
returns HTML 404 pages, not JSON errors.

| Operation | Correct Path | Wrong Path (404) |
|---|---|---|
| Table CRUD | `/api/database/records/{table}` | `/rest/v1/{table}` |
| RPC call | `/api/database/rpc/{function}` | `/rest/v1/rpc/{function}` |

Auth headers for both:

```
apikey: <anon_key>
Authorization: Bearer <anon_key>
```

### RPC Response Format

PostgREST returns RPC results as a **raw JSON array**, not `{ data, error }`.
Handle it like this:

```ts
const json = await rpcRes.json()
const results = Array.isArray(json) ? json : json.data ?? []
```

### Database Inserts

Inserts take an array (even for a single row):

```ts
await insforge.from("pokemon").insert([{ id: 1, name: "Bulbasaur" }])
```

### RLS Policies

Reference the auth user with `auth.users(id)` and use `auth.uid()` in policies.
The `anon` role needs explicit `GRANT EXECUTE` on any RPC function used from
the frontend.

## Pgvector Semantic Search

### match_pokemon Function

Defined in `migrations/20260722034615_pgvector-pokemon.sql`, fixed in
`migrations/20260723030958_fix-match-pokemon-search-path.sql`.

```sql
CREATE OR REPLACE FUNCTION match_pokemon(
  query_embedding vector(3072),
  match_count int DEFAULT 10,
  match_threshold float DEFAULT 0.5
)
RETURNS TABLE (pokemon_id int, similarity float)
LANGUAGE plpgsql
SET search_path = public   -- REQUIRED for PostgREST to expose the function
AS $$
BEGIN
  RETURN QUERY
  SELECT p.pokemon_id, 1 - (p.embedding <=> query_embedding) AS similarity
  FROM pokemon_embeddings p
  WHERE 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_pokemon TO anon;
```

**Gotcha:** Without `SET search_path = public`, InsForge / PostgREST cannot
resolve the `vector` type and the RPC endpoint returns 404.

### Embedding Model

Google Gemini `gemini-embedding-001` (3072 dimensions), called via
`@google/generative-ai` in the search API route.

## Known Gotchas

### ESLint `react-hooks/set-state-in-effect`

React 19's strict ESLint config flags synchronous `setState` calls inside
`useEffect` body. If you need to reset state on dependency change, derive it
from `useMemo` instead of calling `setState` directly in the effect.

### Next.js 16 Breaking Changes

This is Next.js **16**, not 16.x — it has breaking changes from earlier
versions. Before writing new Next.js code, read the relevant guide in
`node_modules/next/dist/docs/`. Heed deprecation notices.

### Tailwind CSS 4

This project uses Tailwind CSS **4** with `@tailwindcss/postcss`. Config is in
`web/postcss.config.mjs`. No `tailwind.config.js` — v4 uses CSS-based config
via `web/app/globals.css`.

## TypeScript Types

Defined in `web/lib/types.ts`:

- `Pokemon` — full row from the `pokemon` table (id, name, form, ndex, type1_id,
  type2_id, stats, ability/egg group FKs)
- `PokemonType` — `{ id: number; name: string }` from the `types` table
- `Ability` — `{ id, name, flavor_text }`

## File Conventions

- **Server Components** live in `web/app/page.tsx` (and nested `page.tsx` files)
- **Client Components** have `"use client"` directive at top
- **API Routes** are in `web/app/api/*/route.ts` exporting named HTTP methods
- **Shared components** are in `web/components/`
- **Lib/utilities** are in `web/lib/`
- **Migrations** are timestamped SQL files in `migrations/`
- **CSV data** lives in `assets/csv/` (both raw and normalized variants)
