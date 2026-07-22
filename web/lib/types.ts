export interface Pokemon {
  id: number
  name: string
  form: string | null
  unique_name: string
  ndex: number
  type1_id: number
  type2_id: number | null
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
  egg_group1_id: number | null
  egg_group2_id: number | null
  ability1_id: number | null
  ability2_id: number | null
  hidden_ability_id: number | null
  egg_cycles: number | null
}

export interface PokemonType {
  id: number
  name: string
}

export interface Ability {
  id: number
  name: string
  flavor_text: string | null
}
