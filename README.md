# opencode-example

A Pokemon database project that ingests comprehensive Pokemon data from CSV files into a PostgreSQL database (hosted on InsForge), with a Next.js web frontend.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, `@insforge/sdk` |
| Backend | InsForge (managed PostgreSQL) |
| Data Pipeline | Python 3, psycopg2, Pydantic |
| AI Agent | OpenCode with custom `/commit` skill |

## Project Structure

```
opencode-example/
├── assets/csv/           # 19 Pokemon CSV data files (~383k rows)
├── scripts/              # Python data pipeline
│   ├── inject_data.py    # CSV → PostgreSQL injector (psycopg2)
│   └── generate_schema.py # CSV → SQL schema generator (Pydantic)
├── migrations/           # InsForge SQL migrations
├── web/                  # Next.js 16 Pokedex frontend
│   ├── app/
│   │   ├── page.tsx          # Server Component — fetches Pokemon data
│   │   ├── pokedex-client.tsx # Client Component — search, filter, pagination
│   │   └── layout.tsx        # Root layout with Geist fonts
│   ├── components/
│   │   ├── pokemon-card.tsx  # Card with sprite, types, stat bars
│   │   ├── search-bar.tsx    # Search input + type filter buttons
│   │   └── type-badge.tsx    # Colored type pill
│   └── lib/
│       ├── insforge.ts       # InsForge SDK client
│       ├── types.ts          # TypeScript interfaces
│       └── pokemon-colors.ts # Type colors + sprite URL helper
├── .insforge/            # InsForge project config
└── .opencode/            # OpenCode AI agent config
```

## Database Schema

19 tables covering the full Pokemon domain:

| Table | Rows | Description |
|---|---|---|
| `learnsets` | 188,221 | Pokemon-move-game-method-level junction |
| `learnsets_raw` | 182,543 | Learnsets with string references |
| `learnsets_suppl` | 5,678 | Supplementary learnset data |
| `pokemon` | 1,161 | All Pokemon with normalized FK IDs |
| `pokemon_raw` | 1,161 | Pokemon with string references |
| `moves` | 864 | Moves with type/category IDs |
| `moves_raw` | 864 | Moves with string references |
| `natures` | 472 | Nature nicknames per trainer/game |
| `evolutions` | 530 | Evolution chains (prevo/evo/base IDs) |
| `evolutions_raw` | 530 | Evolutions with names |
| `legalities` | 463 | Ball legality per Pokemon |
| `abilities` | 306 | Abilities with flavor text |
| `aliases` | 82 | Pokemon name aliases |
| `types` | 18 | The 18 Pokemon types |
| `egg_groups` | 15 | Egg group names |
| `gender_ratios` | 8 | Gender ratio categories |
| `learn_methods` | 6 | Move learn methods |
| `games` | 4 | USUM, SwSh, BDSP, SV |
| `move_categories` | 3 | Physical, Special, Status |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- `psycopg2-binary` (`pip install psycopg2-binary`)

### Data Injection

Inject all CSV data into the database:

```bash
python scripts/inject_data.py
```

Options:

```bash
# Inject specific tables
python scripts/inject_data.py --tables pokemon types

# Clear existing data before injecting
python scripts/inject_data.py --clear

# Custom batch size
python scripts/inject_data.py --batch-size 10000

# Dry run (no database changes)
python scripts/inject_data.py --dry-run
```

### Schema Generation

Generate SQL schema from CSVs:

```bash
python scripts/generate_schema.py
```

### Frontend (Pokedex)

```bash
cd web
pnpm install
pnpm dev
```

The home page is a Pokedex that:

- Displays all 1,161 Pokemon in a responsive grid (2→3→4→5 columns)
- Shows sprite images from PokeAPI, national dex numbers, type badges, and stat bars (HP/Atk/Def/SpA/SpD/Spe)
- Filters by name or dex number via search input
- Filters by type via clickable type buttons
- Paginates with "Load More" (50 at a time)

Data is fetched server-side via the InsForge SDK and rendered in a Server Component, with search/filter/pagination handled client-side.

## Data Flow

```
assets/csv/  →  generate_schema.py  →  migrations/*.sql  →  InsForge DB  ←  web/ (InsForge SDK)
                  inject_data.py   →                                           │
                                                                               └─ Pokedex UI
```

1. CSV files live in `assets/csv/` with both "raw" (string-based) and "normalized" (ID-based) variants
2. `generate_schema.py` reads CSVs, infers PostgreSQL types via Pydantic, and outputs CREATE TABLE statements
3. `inject_data.py` reads CSVs and batch-inserts data via direct psycopg2 connection
4. Migrations in `migrations/` are applied to the InsForge-hosted PostgreSQL
5. The Next.js frontend queries the database via `@insforge/sdk` using the anon key
