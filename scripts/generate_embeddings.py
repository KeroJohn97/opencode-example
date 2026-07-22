#!/usr/bin/env python3
"""Generate Pokemon embeddings via Gemini API (raw HTTP, no SDK retries)."""

import os
import time
import json
import requests
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values

load_dotenv(".env.local")
API_KEY = os.environ["GOOGLE_API_KEY"]
EMBED_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={API_KEY}"

DB_CONN = os.environ.get("INSFORGE_DB_URL")
if not DB_CONN:
    import subprocess
    DB_CONN = subprocess.run(
        ["npx", "@insforge/cli", "db", "connection-string"],
        capture_output=True, text=True, check=True
    ).stdout.strip()

BATCH = 25
SLEEP_BETWEEN = 8


def embed_texts(texts):
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": t} for t in texts]},
        "taskType": "RETRIEVAL_DOCUMENT",
    }
    for attempt in range(10):
        r = requests.post(EMBED_URL, json=payload, timeout=60)
        if r.status_code == 200:
            return [v for v in r.json()["embedding"]["values"]]
        if r.status_code == 429:
            wait = 65
            print(f"  429, waiting {wait}s", flush=True)
            time.sleep(wait)
        else:
            raise RuntimeError(f"HTTP {r.status_code}: {r.text[:200]}")
    raise RuntimeError("Failed after 10 retries")


def embed_batch(texts):
    """Embed a batch using batchEmbedContents for multiple texts."""
    payload = {
        "requests": [
            {
                "model": "models/gemini-embedding-001",
                "content": {"parts": [{"text": t}]},
                "taskType": "RETRIEVAL_DOCUMENT",
            }
            for t in texts
        ]
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key={API_KEY}"
    for attempt in range(10):
        r = requests.post(url, json=payload, timeout=120)
        if r.status_code == 200:
            return [item["embedding"]["values"] for item in r.json()["embeddings"]]
        if r.status_code == 429:
            wait = 65
            print(f"  429, waiting {wait}s", flush=True)
            time.sleep(wait)
        else:
            raise RuntimeError(f"HTTP {r.status_code}: {r.text[:200]}")
    raise RuntimeError("Failed after 10 retries")


def fetch_pokemon(cur):
    cur.execute("""
        SELECT p.id, p.ndex, p.name, p.form,
               COALESCE(t1.name, '') AS type1,
               COALESCE(t2.name, '') AS type2,
               COALESCE(a1.name, '') AS ability1,
               COALESCE(a2.name, '') AS ability2,
               COALESCE(ah.name, '') AS hidden_ability
        FROM pokemon p
        LEFT JOIN types t1 ON t1.id = p.type1_id
        LEFT JOIN types t2 ON t2.id = p.type2_id
        LEFT JOIN abilities a1 ON a1.id = p.ability1_id
        LEFT JOIN abilities a2 ON a2.id = p.ability2_id
        LEFT JOIN abilities ah ON ah.id = p.hidden_ability_id
        ORDER BY p.ndex
    """)
    return cur.fetchall()


def build_text(row):
    pid, ndex, name, form, type1, type2, ability1, ability2, hidden_ability = row
    parts = [f"#{ndex} {name} {form}".strip()]
    types = ", ".join(t for t in [type1, type2] if t)
    if types:
        parts.append(f"Type: {types}")
    abilities = ", ".join(a for a in [ability1, ability2, hidden_ability] if a)
    if abilities:
        parts.append(f"Abilities: {abilities}")
    return " | ".join(parts)


def main():
    conn = psycopg2.connect(DB_CONN)
    cur = conn.cursor()

    rows = fetch_pokemon(cur)
    cur.execute("SELECT pokemon_id FROM pokemon_embeddings")
    done = {r[0] for r in cur.fetchall()}
    rows = [r for r in rows if r[0] not in done]
    print(f"{len(done)} done, {len(rows)} remaining", flush=True)

    if not rows:
        print("Nothing to do", flush=True)
        return

    total = len(rows)
    for i in range(0, total, BATCH):
        batch = rows[i : i + BATCH]
        ids = [r[0] for r in batch]
        texts = [build_text(r) for r in batch]
        embeddings = embed_batch(texts)

        execute_values(
            cur,
            "INSERT INTO pokemon_embeddings (pokemon_id, content, embedding) VALUES %s "
            "ON CONFLICT (pokemon_id) DO UPDATE SET content=EXCLUDED.content, embedding=EXCLUDED.embedding",
            [(pid, txt, f"[{','.join(str(v) for v in emb)}]")
             for pid, txt, emb in zip(ids, texts, embeddings)],
        )
        conn.commit()
        print(f"  [{i + len(batch):>4}/{total}] done", flush=True)
        if i + BATCH < total:
            time.sleep(SLEEP_BETWEEN)

    cur.close()
    conn.close()
    print("All done", flush=True)


if __name__ == "__main__":
    main()
