CREATE TABLE IF NOT EXISTS abilities (
    id BIGINT PRIMARY KEY,
    name TEXT,
    flavor_text TEXT
);

CREATE TABLE IF NOT EXISTS aliases (
    alias TEXT,
    pokemon_id BIGINT
);

CREATE TABLE IF NOT EXISTS egg_groups (
    id BIGINT PRIMARY KEY,
    name TEXT
);

CREATE TABLE IF NOT EXISTS evolutions_raw (
    prevo_name TEXT,
    prevo_form TEXT,
    evo_name TEXT,
    evo_form TEXT,
    base_evo_name TEXT,
    base_evo_form TEXT,
    method TEXT
);

CREATE TABLE IF NOT EXISTS evolutions (
    prevo_id BIGINT,
    evo_id BIGINT,
    base_evo_id BIGINT,
    method TEXT
);

CREATE TABLE IF NOT EXISTS games (
    id BIGINT PRIMARY KEY,
    name TEXT
);

CREATE TABLE IF NOT EXISTS gender_ratios (
    id BIGINT PRIMARY KEY,
    name TEXT
);

CREATE TABLE IF NOT EXISTS learn_methods (
    id BIGINT PRIMARY KEY,
    name TEXT
);

CREATE TABLE IF NOT EXISTS learnsets_raw (
    unique_name TEXT,
    game TEXT,
    move_name TEXT,
    learn_method TEXT,
    level BIGINT
);

CREATE TABLE IF NOT EXISTS learnsets_suppl (
    unique_name TEXT,
    game TEXT,
    move_name TEXT,
    learn_method TEXT,
    level TEXT
);

CREATE TABLE IF NOT EXISTS learnsets (
    pokemon_id BOOLEAN,
    move_id BIGINT,
    game_id BOOLEAN,
    learn_method_id BIGINT,
    level BIGINT
);

CREATE TABLE IF NOT EXISTS legalities (
    pokemon_id BIGINT,
    bank_beast BOOLEAN,
    bank_dream BOOLEAN,
    bank_apri BOOLEAN,
    bank_safari BOOLEAN,
    bank_sport BOOLEAN,
    home_beast BOOLEAN,
    home_dream BOOLEAN,
    home_apri BOOLEAN,
    home_safari BOOLEAN,
    home_sport BOOLEAN
);

CREATE TABLE IF NOT EXISTS move_categories (
    id BIGINT PRIMARY KEY,
    name TEXT
);

CREATE TABLE IF NOT EXISTS moves_raw (
    name TEXT,
    type TEXT,
    category TEXT,
    flavor_text TEXT,
    base_power BIGINT,
    accuracy BIGINT,
    pp BIGINT
);

CREATE TABLE IF NOT EXISTS moves (
    id BIGINT PRIMARY KEY,
    name TEXT,
    type_id BIGINT,
    category_id BIGINT,
    flavor_text TEXT,
    base_power BIGINT,
    accuracy BIGINT,
    pp BIGINT
);

CREATE TABLE IF NOT EXISTS natures (
    pokemon_id BIGINT,
    penny TEXT,
    jemma_swsh TEXT,
    jemma_bdsp TEXT,
    jemma_g7 TEXT
);

CREATE TABLE IF NOT EXISTS pokemon_raw (
    name TEXT,
    form TEXT,
    unique_name TEXT,
    ndex BIGINT,
    galar_dex BIGINT,
    ioa_dex BIGINT,
    ct_dex BIGINT,
    paldea_dex BIGINT,
    tm_dex BIGINT,
    id_dex BIGINT,
    type1 TEXT,
    type2 TEXT,
    hp BIGINT,
    atk BIGINT,
    def BIGINT,
    spa BIGINT,
    spd BIGINT,
    spe BIGINT,
    egg_group1 TEXT,
    egg_group2 TEXT,
    gender_ratio TEXT,
    ability1 TEXT,
    ability2 TEXT,
    hidden_ability TEXT,
    egg_cycles BIGINT,
    url TEXT
);

CREATE TABLE IF NOT EXISTS pokemon (
    id BIGINT PRIMARY KEY,
    name TEXT,
    form TEXT,
    unique_name TEXT,
    ndex BIGINT,
    galar_dex BIGINT,
    ioa_dex BIGINT,
    ct_dex BIGINT,
    paldea_dex BIGINT,
    tm_dex BIGINT,
    type1_id BIGINT,
    type2_id BIGINT,
    hp BIGINT,
    atk BIGINT,
    def BIGINT,
    spa BIGINT,
    spd BIGINT,
    spe BIGINT,
    egg_group1_id BIGINT,
    egg_group2_id BIGINT,
    gr_id BIGINT,
    ability1_id BIGINT,
    ability2_id BIGINT,
    hidden_ability_id BIGINT,
    egg_cycles BIGINT
);

CREATE TABLE IF NOT EXISTS types (
    id BIGINT PRIMARY KEY,
    name TEXT
);
