"use client";

import { PokemonType } from "@/lib/types";
import { TYPE_COLORS } from "@/lib/pokemon-colors";

export function SearchBar({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  types,
}: {
  search: string;
  onSearchChange: (s: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  types: PokemonType[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Search by name or #number..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onTypeChange("")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            selectedType === ""
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
          }`}
        >
          All
        </button>
        {types.map((t) => {
          const c = TYPE_COLORS[t.name];
          const active = selectedType === t.name;
          return (
            <button
              key={t.id}
              onClick={() => onTypeChange(active ? "" : t.name)}
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-opacity"
              style={{
                backgroundColor: c?.bg ?? "#777",
                color: c?.text ?? "#fff",
                opacity: active ? 1 : 0.65,
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
