# opencode-example

A Pokemon database project that ingests comprehensive Pokemon data from CSV files into a PostgreSQL database (hosted on InsForge), with a Next.js web frontend.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
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
├── web/                  # Next.js 16 frontend (scaffolded)
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

### Frontend

```bash
cd web
pnpm install
pnpm dev
```

## Data Pipeline

```
assets/csv/  →  generate_schema.py  →  migrations/*.sql  →  InsForge DB
                  inject_data.py   →
```

1. CSV files live in `assets/csv/` with both "raw" (string-based) and "normalized" (ID-based) variants
2. `generate_schema.py` reads CSVs, infers PostgreSQL types via Pydantic, and outputs CREATE TABLE statements
3. `inject_data.py` reads CSVs and batch-inserts data via direct psycopg2 connection
4. Migrations in `migrations/` are applied to the InsForge-hosted PostgreSQL
