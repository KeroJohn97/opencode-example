"use client";

import { useState, useRef, useEffect } from "react";
import { PokemonType } from "@/lib/types";
import { TYPE_COLORS } from "@/lib/pokemon-colors";

export function SearchBar({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  semanticActive,
  loading,
  types,
}: {
  search: string;
  onSearchChange: (s: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  semanticActive: boolean;
  loading: boolean;
  types: PokemonType[];
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div
          className={`flex items-center gap-2 rounded-2xl border-2 bg-white px-4 py-3 transition-all dark:bg-zinc-900 ${
            focused
              ? "border-violet-500 shadow-lg shadow-violet-500/10"
              : "border-zinc-200 dark:border-zinc-700"
          }`}
        >
          <svg
            className="h-5 w-5 shrink-0 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            placeholder={
              semanticActive
                ? "AI is searching semantically..."
                : "Search by name, type, or describe a Pokemon..."
            }
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:text-zinc-50 dark:placeholder-zinc-500"
          />

          {search && (
            <button
              onClick={() => {
                onSearchChange("");
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {semanticActive && (
            <div className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 dark:bg-violet-900/30">
              {loading ? (
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-violet-500" />
              ) : (
                <svg className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              )}
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                AI
              </span>
            </div>
          )}
        </div>

        {semanticActive && !loading && (
          <p className="mt-2 text-xs text-violet-500 dark:text-violet-400">
            Try: &quot;fast electric&quot;, &quot;fire starter&quot;, &quot;pink fairy&quot;, &quot;legendary dragon&quot;
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeChange("")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            selectedType === ""
              ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
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
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                active ? "shadow-sm ring-2 ring-offset-1 ring-zinc-400 dark:ring-zinc-500" : ""
              }`}
              style={{
                backgroundColor: c?.bg ?? "#777",
                color: c?.text ?? "#fff",
                opacity: active ? 1 : 0.7,
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
