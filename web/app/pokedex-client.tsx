"use client";

import { useState, useMemo } from "react";
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

  const typesMap = useMemo(
    () => new Map(types.map((t) => [t.id, t])),
    [types]
  );

  const filtered = useMemo(() => {
    let list = pokemon;

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.ndex).includes(q)
      );
    }

    if (selectedType) {
      const matchType = types.find((t) => t.name === selectedType);
      if (matchType) {
        list = list.filter(
          (p) => p.type1_id === matchType.id || p.type2_id === matchType.id
        );
      }
    }

    return list;
  }, [pokemon, types, search, selectedType]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pokedex
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {filtered.length} Pokemon{selectedType ? ` of type ${selectedType}` : ""}
        </p>
      </div>

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        types={types}
      />

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No Pokemon found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <PokemonCard key={p.id} pokemon={p} types={typesMap} />
          ))}
        </div>
      )}
    </div>
  );
}
