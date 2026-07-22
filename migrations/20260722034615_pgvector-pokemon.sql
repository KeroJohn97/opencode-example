CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE pokemon_embeddings (
  pokemon_id BIGINT PRIMARY KEY REFERENCES pokemon(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(3072) NOT NULL,
  embedding_model TEXT NOT NULL DEFAULT 'google/gemini-embedding-001'
);

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
AS $$
  SELECT pe.pokemon_id,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM pokemon_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) >= match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION match_pokemon(vector, INT, DOUBLE PRECISION) TO anon;
