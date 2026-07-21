 DROP TABLE IF EXISTS learnsets;

CREATE TABLE learnsets (
    pokemon_id BIGINT,
    move_id BIGINT,
    game_id BIGINT,
    learn_method_id BIGINT,
    level BIGINT
);
