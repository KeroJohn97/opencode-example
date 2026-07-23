CREATE OR REPLACE FUNCTION match_pokemon(
  query_embedding vector(3072),
  match_count INT DEFAULT 20,
  match_threshold DOUBLE PRECISION DEFAULT 0.3
)
RETURNS TABLE (
  pokemon_id BIGINT,
  similarity DOUBLE PRECISION
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT pe.pokemon_id,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM pokemon_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) >= match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION match_pokemon(vector(3072), INT, DOUBLE PRECISION) TO anon;
