#!/usr/bin/env python3
"""
CSV-to-PostgreSQL schema generator with migration support.

Reads CSV files from assets/csv/, infers column types using Pydantic,
and generates idempotent SQL migrations (CREATE TABLE IF NOT EXISTS + UPSERT).

Usage:
    python scripts/generate_schema.py
    python scripts/generate_schema.py --output scripts/migrations/001_init.sql
"""

import argparse
import csv
import os
import sys
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any, Optional

from pydantic import TypeAdapter, ValidationError

# ── Config ──────────────────────────────────────────────────────────────────

CSV_DIR = Path(__file__).resolve().parent.parent / "assets" / "csv"
DEFAULT_OUTPUT = Path(__file__).resolve().parent / "migrations" / "001_init.sql"

# Sample size for type inference
SAMPLE_SIZE = 50

# ── Type inference ───────────────────────────────────────────────────────────

# Order matters: try most specific types first
CANDIDATE_TYPES: list[tuple[str, type]] = [
    ("bool", bool),
    ("int", int),
    ("float", float),
    ("date", date),
    ("datetime", datetime),
    ("decimal", Decimal),
    ("text", str),
]

PG_TYPE_MAP: dict[str, str] = {
    "bool": "BOOLEAN",
    "int": "BIGINT",
    "float": "DOUBLE PRECISION",
    "date": "DATE",
    "datetime": "TIMESTAMPTZ",
    "decimal": "NUMERIC",
    "text": "TEXT",
}


def infer_column_type(values: list[str], col_name: str) -> str:
    """Infer the best PostgreSQL type for a column from sample values."""
    non_empty = [v.strip() for v in values if v.strip()]
    if not non_empty:
        return "TEXT"

    # Try each type in order of specificity
    for type_name, python_type in CANDIDATE_TYPES:
        if type_name == "text":
            continue  # fallback, handle below
        adapter = TypeAdapter(python_type)
        all_match = True
        for val in non_empty:
            # Handle common representations
            if type_name == "bool":
                if val.lower() not in ("true", "false", "t", "f", "1", "0", "yes", "no"):
                    all_match = False
                    break
            elif type_name == "date":
                # Skip strings that look like they contain time or are too long
                if len(val) > 10 or " " in val:
                    all_match = False
                    break
            try:
                adapter.validate_python(val)
            except (ValidationError, ValueError, TypeError):
                all_match = False
                break
        if all_match:
            return PG_TYPE_MAP[type_name]

    return "TEXT"


def sanitize_col_name(name: str) -> str:
    """Convert CSV header to a safe PostgreSQL column name."""
    return name.strip().lower().replace(" ", "_").replace("-", "_")


def sanitize_table_name(filename: str) -> str:
    """Convert CSV filename to a safe PostgreSQL table name."""
    return Path(filename).stem.lower().replace("-", "_")


# ── SQL generation ───────────────────────────────────────────────────────────


def generate_create_table(
    table_name: str,
    columns: dict[str, str],
    pk_column: Optional[str] = None,
) -> str:
    """Generate an idempotent CREATE TABLE IF NOT EXISTS statement."""
    lines = []
    for col, pg_type in columns.items():
        constraint = " PRIMARY KEY" if col == pk_column else ""
        lines.append(f"    {col} {pg_type}{constraint}")

    cols_sql = ",\n".join(lines)
    return (
        f"CREATE TABLE IF NOT EXISTS {table_name} (\n"
        f"{cols_sql}\n"
        f");"
    )


def generate_upsert(
    table_name: str,
    columns: list[str],
    pk_column: Optional[str] = None,
) -> str:
    """Generate an INSERT ... ON CONFLICT DO UPDATE statement (template)."""
    cols = ", ".join(columns)
    placeholders = ", ".join(f"%({c})s" for c in columns)
    if pk_column:
        update_cols = [c for c in columns if c != pk_column]
        updates = ", ".join(f"{c} = EXCLUDED.{c}" for c in update_cols)
        return (
            f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})\n"
            f"ON CONFLICT ({pk_column}) DO UPDATE SET\n"
            f"    {updates};"
        )
    return f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders});"


# ── Main ─────────────────────────────────────────────────────────────────────


def process_csv(filepath: Path) -> tuple[str, dict[str, str], list[str]]:
    """Read a CSV and return (table_name, {col: pg_type}, sample_rows)."""
    table_name = sanitize_table_name(filepath.name)

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError(f"No headers found in {filepath.name}")

        columns_raw = list(reader.fieldnames)
        columns = {sanitize_col_name(c): c for c in columns_raw}

        # Collect sample rows for type inference
        samples: dict[str, list[str]] = {col: [] for col in columns}
        for i, row in enumerate(reader):
            if i >= SAMPLE_SIZE:
                break
            for sanitized, original in columns.items():
                val = row.get(original, "")
                samples[sanitized].append(val)

    # Infer types
    col_types = {}
    for col in columns:
        pg_type = infer_column_type(samples[col], col)
        col_types[col] = pg_type

    return table_name, col_types, columns_raw


def main():
    parser = argparse.ArgumentParser(description="Generate PostgreSQL schema from CSVs")
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output SQL file path",
    )
    parser.add_argument(
        "--csv-dir", "-d",
        type=Path,
        default=CSV_DIR,
        help="Directory containing CSV files",
    )
    parser.add_argument(
        "--tables", "-t",
        nargs="*",
        help="Specific tables to process (without .csv extension). Default: all.",
    )
    args = parser.parse_args()

    csv_dir: Path = args.csv_dir
    if not csv_dir.is_dir():
        print(f"Error: CSV directory not found: {csv_dir}", file=sys.stderr)
        sys.exit(1)

    # Collect CSV files
    if args.tables:
        csv_files = [csv_dir / f"{t}.csv" for t in args.tables]
        missing = [f for f in csv_files if not f.exists()]
        if missing:
            print(f"Error: CSV files not found: {missing}", file=sys.stderr)
            sys.exit(1)
    else:
        csv_files = sorted(csv_dir.glob("*.csv"))

    if not csv_files:
        print(f"No CSV files found in {csv_dir}", file=sys.stderr)
        sys.exit(1)

    # Process each CSV
    output_lines: list[str] = [
        "-- =============================================================================",
        "-- Auto-generated PostgreSQL schema from CSV files",
        f"-- Source: {csv_dir}",
        "-- Generated by: scripts/generate_schema.py",
        "-- =============================================================================",
        "",
    ]

    for csv_file in csv_files:
        table_name, col_types, raw_cols = process_csv(csv_file)

        # Guess primary key: if 'id' column exists, use it
        pk = "id" if "id" in col_types else None

        create_sql = generate_create_table(table_name, col_types, pk)
        upsert_sql = generate_upsert(table_name, list(col_types.keys()), pk)

        output_lines.append(f"-- ── {csv_file.name} ──")
        output_lines.append(create_sql)
        output_lines.append("")
        output_lines.append(f"-- UPSERT template for {table_name}:")
        output_lines.append(f"-- {upsert_sql}")
        output_lines.append("")

    # Write output
    output: Path = args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(output_lines), encoding="utf-8")

    print(f"✓ Schema written to {output}")
    print(f"  Tables: {len(csv_files)}")
    for csv_file in csv_files:
        table_name, col_types, _ = process_csv(csv_file)
        pk = "id" if "id" in col_types else "none"
        print(f"    {table_name} ({len(col_types)} cols, pk: {pk})")


if __name__ == "__main__":
    main()
