#!/usr/bin/env python3
"""
CSV data injector for PostgreSQL via direct connection (psycopg2).

Reads CSV files from assets/csv/ and inserts data into the database
in batches for efficiency.

Usage:
    python scripts/inject_data.py
    python scripts/inject_data.py --tables pokemon types
    python scripts/inject_data.py --batch-size 500
    python scripts/inject_data.py --clear --tables learnsets
"""

import argparse
import csv
import json
import os
import subprocess
import sys
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import execute_values

    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

CSV_DIR = Path(__file__).resolve().parent.parent / "assets" / "csv"
INSFORGE_DIR = Path(__file__).resolve().parent.parent / ".insforge"
DEFAULT_BATCH_SIZE = 5000


def sanitize_col_name(name: str) -> str:
    return name.strip().lower().replace(" ", "_").replace("-", "_")


def sanitize_table_name(filename: str) -> str:
    return Path(filename).stem.lower().replace("-", "_")


def get_connection_string() -> str:
    """Get PostgreSQL connection string from InsForge CLI or environment."""
    # Try environment variable first
    conn_str = os.environ.get("INSFORGE_DATABASE_URL")
    if conn_str:
        return conn_str

    # Try InsForge CLI
    result = subprocess.run(
        ["npx", "@insforge/cli", "db", "connection-string"],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        for line in result.stdout.strip().split("\n"):
            line = line.strip()
            if line.startswith("postgresql://"):
                return line

    # Try building from project.json + env password
    project_file = INSFORGE_DIR / "project.json"
    if project_file.exists():
        with open(project_file) as f:
            project = json.load(f)

        db_password = os.environ.get("INSFORGE_DB_PASSWORD")
        if db_password:
            appkey = project["appkey"]
            region = project["region"]
            host = f"{appkey}.{region}.database.insforge.app"
            return f"postgresql://postgres:{db_password}@{host}:5432/insforge?sslmode=require"

    print(
        "Error: Could not get database connection string.\n"
        "  Set INSFORGE_DATABASE_URL or INSFORGE_DB_PASSWORD env var,\n"
        "  or ensure `npx @insforge/cli db connection-string` works.",
        file=sys.stderr,
    )
    sys.exit(1)


def inject_csv(connection, table_name: str, filepath: Path, batch_size: int, clear: bool) -> int:
    """Inject a single CSV file via direct PostgreSQL connection."""
    cursor = connection.cursor()

    if clear:
        cursor.execute(f"TRUNCATE {table_name} RESTART IDENTITY CASCADE")
        connection.commit()
        print(f"  Cleared table {table_name}")

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            print(f"  No headers in {filepath.name}", file=sys.stderr)
            return 0

        columns = [sanitize_col_name(c) for c in reader.fieldnames]
        total = 0
        batch = []

        for row in reader:
            vals = [row.get(c, "") or None for c in reader.fieldnames]
            batch.append(vals)
            if len(batch) >= batch_size:
                sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES %s ON CONFLICT DO NOTHING"
                execute_values(cursor, sql, batch, page_size=batch_size)
                connection.commit()
                total += len(batch)
                batch = []

        if batch:
            sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES %s ON CONFLICT DO NOTHING"
            execute_values(cursor, sql, batch, page_size=batch_size)
            connection.commit()
            total += len(batch)

    cursor.close()
    return total


def main():
    parser = argparse.ArgumentParser(description="Inject CSV data into PostgreSQL")
    parser.add_argument(
        "--csv-dir", "-d",
        type=Path,
        default=CSV_DIR,
        help="Directory containing CSV files",
    )
    parser.add_argument(
        "--tables", "-t",
        nargs="*",
        help="Specific tables to inject (without .csv). Default: all.",
    )
    parser.add_argument(
        "--batch-size", "-b",
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help=f"Rows per INSERT batch (default: {DEFAULT_BATCH_SIZE})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print SQL without executing",
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Truncate tables before injecting (clears existing data)",
    )
    args = parser.parse_args()

    if not HAS_PSYCOPG2:
        print("Error: psycopg2 is required. Install with: pip install psycopg2-binary", file=sys.stderr)
        sys.exit(1)

    csv_dir: Path = args.csv_dir
    if not csv_dir.is_dir():
        print(f"Error: CSV directory not found: {csv_dir}", file=sys.stderr)
        sys.exit(1)

    # Collect CSV files
    if args.tables:
        csv_files = []
        for t in args.tables:
            path_hyphen = csv_dir / f"{t.replace('_', '-')}.csv"
            path_under = csv_dir / f"{t}.csv"
            if path_hyphen.exists():
                csv_files.append(path_hyphen)
            elif path_under.exists():
                csv_files.append(path_under)
            else:
                print(f"Error: CSV file not found for table '{t}'", file=sys.stderr)
                sys.exit(1)
    else:
        csv_files = sorted(csv_dir.glob("*.csv"))

    if not csv_files:
        print(f"No CSV files found in {csv_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"Injecting {len(csv_files)} CSV files (batch size: {args.batch_size})")
    print("=" * 60)

    if args.dry_run:
        for csv_file in csv_files:
            table_name = sanitize_table_name(csv_file.name)
            row_count = sum(1 for _ in open(csv_file)) - 1
            print(f"{table_name} ({row_count} rows) - dry run, would inject")
        print("\nDone (dry run).")
        return

    conn_str = get_connection_string()
    conn = psycopg2.connect(conn_str)
    print(f"Connected to database")

    grand_total = 0
    for csv_file in csv_files:
        table_name = sanitize_table_name(csv_file.name)
        row_count = sum(1 for _ in open(csv_file)) - 1
        print(f"\n{table_name} ({row_count} rows)...")

        total = inject_csv(conn, table_name, csv_file, args.batch_size, args.clear)
        grand_total += total
        print(f"  {total} rows inserted")

    conn.close()
    print("\n" + "=" * 60)
    print(f"Done. Total: {grand_total} rows injected.")


if __name__ == "__main__":
    main()
