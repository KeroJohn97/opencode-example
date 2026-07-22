"use client";

import Image from "next/image";
import { Pokemon, PokemonType } from "@/lib/types";
import { pokemonSpriteUrl, formatDexNumber } from "@/lib/pokemon-colors";
import { TypeBadge } from "./type-badge";

const STAT_LABELS: [keyof Pokemon, string][] = [
  ["hp", "HP"],
  ["atk", "Atk"],
  ["def", "Def"],
  ["spa", "SpA"],
  ["spd", "SpD"],
  ["spe", "Spe"],
];

const MAX_STAT = 255;

export function PokemonCard({
  pokemon,
  types,
}: {
  pokemon: Pokemon;
  types: Map<number, PokemonType>;
}) {
  const type1 = types.get(pokemon.type1_id);
  const type2 = pokemon.type2_id ? types.get(pokemon.type2_id) : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative flex items-center justify-center bg-gradient-to-b from-zinc-100 to-zinc-50 px-4 pt-6 pb-2 dark:from-zinc-800 dark:to-zinc-900">
        <span className="absolute top-2 left-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          {formatDexNumber(pokemon.ndex)}
        </span>
        <Image
          src={pokemonSpriteUrl(pokemon.ndex)}
          alt={pokemon.name}
          width={96}
          height={96}
          className="drop-shadow-sm transition-transform group-hover:scale-110"
          unoptimized
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {pokemon.name}
          </h3>
          {pokemon.form && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {pokemon.form}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {type1 && <TypeBadge type={type1.name} />}
          {type2 && <TypeBadge type={type2.name} />}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {STAT_LABELS.map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-7 font-medium text-zinc-500 dark:text-zinc-400">
                {label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${((pokemon[key] as number) / MAX_STAT) * 100}%`,
                  }}
                />
              </div>
              <span className="w-6 text-right font-mono text-zinc-700 dark:text-zinc-300">
                {pokemon[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
