export const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Normal:   { bg: "#A8A77A", text: "#fff" },
  Fire:     { bg: "#EE8130", text: "#fff" },
  Water:    { bg: "#6390F0", text: "#fff" },
  Electric: { bg: "#F7D02C", text: "#1a1a1a" },
  Grass:    { bg: "#7AC74C", text: "#fff" },
  Ice:      { bg: "#96D9D6", text: "#1a1a1a" },
  Fighting: { bg: "#C22E28", text: "#fff" },
  Poison:   { bg: "#A33EA1", text: "#fff" },
  Ground:   { bg: "#E2BF65", text: "#1a1a1a" },
  Flying:   { bg: "#A98FF3", text: "#fff" },
  Psychic:  { bg: "#F95587", text: "#fff" },
  Bug:      { bg: "#A6B91A", text: "#fff" },
  Rock:     { bg: "#B6A136", text: "#fff" },
  Ghost:    { bg: "#735797", text: "#fff" },
  Dragon:   { bg: "#6F35FC", text: "#fff" },
  Dark:     { bg: "#705746", text: "#fff" },
  Steel:    { bg: "#B7B7CE", text: "#1a1a1a" },
  Fairy:    { bg: "#D685AD", text: "#fff" },
};

export function pokemonSpriteUrl(ndex: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ndex}.png`;
}

export function formatDexNumber(ndex: number): string {
  return `#${String(ndex).padStart(3, "0")}`;
}
