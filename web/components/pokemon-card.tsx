"use client";

import Image from "next/image";
import { useState } from "react";
import { Pokemon, PokemonType } from "@/lib/types";
import { pokemonSpriteUrl, formatDexNumber } from "@/lib/pokemon-colors";
import { TypeBadge } from "./type-badge";

const STAT_COLORS: Record<string, string> = {
  hp: "bg-red-500",
  atk: "bg-orange-500",
  def: "bg-yellow-500",
  spa: "bg-blue-500",
  spd: "bg-green-500",
  spe: "bg-pink-500",
};

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
  const [hovered, setHovered] = useState(false);
  const type1 = types.get(pokemon.type1_id);
  const type2 = pokemon.type2_id ? types.get(pokemon.type2_id) : null;
  const bst = pokemon.hp + pokemon.atk + pokemon.def + pokemon.spa + pokemon.spd + pokemon.spe;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:shadow-xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-zinc-900/50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-4 pt-5 pb-2 dark:from-zinc-800 dark:to-zinc-900">
        <span className="absolute top-2 left-3 font-mono text-xs font-bold text-zinc-300 dark:text-zinc-600">
          {formatDexNumber(pokemon.ndex)}
        </span>
        <span className="absolute top-2 right-3 text-xs font-bold text-zinc-200 dark:text-zinc-700">
          BST {bst}
        </span>
        <Image
          src={pokemonSpriteUrl(pokemon.ndex)}
          alt={pokemon.name}
          width={96}
          height={96}
          className="drop-shadow-md transition-transform duration-200 group-hover:scale-110"
          unoptimized
        />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {pokemon.name}
            </h3>
            {pokemon.form && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {pokemon.form}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {type1 && <TypeBadge type={type1.name} />}
          {type2 && <TypeBadge type={type2.name} />}
        </div>

        <div className={`grid grid-cols-3 gap-2 text-xs transition-all duration-200 ${hovered ? "opacity-100" : "opacity-70"}`}>
          {STAT_LABELS.map(([key, label]) => {
            const val = pokemon[key] as number;
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${STAT_COLORS[key]}`}
                    style={{ width: `${(val / MAX_STAT) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                    {label}
                  </span>
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {val}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
