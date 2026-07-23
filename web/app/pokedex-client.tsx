"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Pokemon, PokemonType } from "@/lib/types";
import { PokemonCard } from "@/components/pokemon-card";
import { SearchBar } from "@/components/search-bar";

export function PokedexClient({
  pokemon,
  types,
}: {
  pokemon: Pokemon[];
  types: PokemonType[];
}) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [semanticIds, setSemanticIds] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const typesMap = useMemo(
    () => new Map(types.map((t) => [t.id, t])),
    [types]
  );

  useEffect(() => {
    const q = search.trim();
    if (q.length < 3) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.ids) setSemanticIds(data.ids);
      } catch {
        /* abort or network */
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  const filtered = useMemo(() => {
    let list = pokemon;

    if (semanticIds) {
      const idSet = new Set(semanticIds);
      list = list.filter((p) => idSet.has(p.id));
    } else if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || String(p.ndex).includes(q)
      );
    }

    if (!semanticIds && selectedType) {
      const matchType = types.find((t) => t.name === selectedType);
      if (matchType) {
        list = list.filter(
          (p) => p.type1_id === matchType.id || p.type2_id === matchType.id
        );
      }
    }

    if (semanticIds) {
      const order = new Map(semanticIds.map((id, i) => [id, i]));
      list = [...list].sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
      );
    }

    return list;
  }, [pokemon, types, search, selectedType, semanticIds]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pokedex
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {filtered.length} Pokemon
          {semanticIds && !loading ? " (semantic search)" : ""}
          {selectedType ? ` of type ${selectedType}` : ""}
        </p>
      </div>

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        semanticActive={search.trim().length >= 3}
        loading={loading}
        types={types}
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-violet-500" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            AI is searching...
          </span>
        </div>
      )}

      {!loading && filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="text-6xl">?</div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No Pokemon found
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Try a different search or clear filters
          </p>
        </div>
      ) : !loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <PokemonCard key={p.id} pokemon={p} types={typesMap} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
