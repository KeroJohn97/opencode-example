"use client";

import { TYPE_COLORS } from "@/lib/pokemon-colors";

export function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_COLORS[type] ?? { bg: "#777", text: "#fff" };

  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {type}
    </span>
  );
}
