import { insforge } from "@/lib/insforge";
import { Pokemon, PokemonType } from "@/lib/types";
import { PokedexClient } from "./pokedex-client";

export const revalidate = 3600;

export default async function Home() {
  const [pokemonRes, typesRes] = await Promise.all([
    insforge.database
      .from("pokemon")
      .select(
        "id, name, form, unique_name, ndex, type1_id, type2_id, hp, atk, def, spa, spd, spe"
      )
      .order("id", { ascending: true })
      .limit(1500),
    insforge.database
      .from("types")
      .select("id, name")
      .order("id", { ascending: true }),
  ]);

  const pokemon = (pokemonRes.data ?? []) as Pokemon[];
  const types = (typesRes.data ?? []) as PokemonType[];

  return <PokedexClient pokemon={pokemon} types={types} />;
}
