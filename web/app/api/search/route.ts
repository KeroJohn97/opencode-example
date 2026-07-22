import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

function envMissing(name: string): never {
  throw new Error(
    `Missing env var ${name}. Add it to .env.local at the project root.`
  );
}

if (!INSFORGE_URL) envMissing("NEXT_PUBLIC_INSFORGE_URL");
if (!ANON_KEY) envMissing("NEXT_PUBLIC_INSFORGE_ANON_KEY");
if (!GOOGLE_API_KEY) envMissing("GOOGLE_API_KEY");

const genai = new GoogleGenerativeAI(GOOGLE_API_KEY);

interface MatchResult {
  pokemon_id: number;
  similarity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.query !== "string") {
      return NextResponse.json(
        { error: "Invalid request: send { query: string }" },
        { status: 400 }
      );
    }

    const query = body.query.trim();
    if (query.length < 3) {
      return NextResponse.json({ ids: [] });
    }

    const model = genai.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(query);
    const embedding = result.embedding.values;

    const rpcUrl = `${INSFORGE_URL}/rest/v1/rpc/match_pokemon`;
    const rpcRes = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY!,
        Authorization: `Bearer ${ANON_KEY!}`,
      },
      body: JSON.stringify({
        query_embedding: `[${embedding.join(",")}]`,
        match_count: 30,
        match_threshold: 0.3,
      }),
    });

    if (!rpcRes.ok) {
      const text = await rpcRes.text();
      console.error(`[search] match_pokemon RPC failed: ${rpcRes.status} ${text}`);
      return NextResponse.json(
        { error: `Embedding search failed: ${rpcRes.status}` },
        { status: 502 }
      );
    }

    const { data, error } = await rpcRes.json();

    if (error) {
      console.error(`[search] match_pokemon error:`, error);
      return NextResponse.json(
        { error: error.message ?? "RPC returned an error" },
        { status: 500 }
      );
    }

    const ids = (data as MatchResult[]).map((r) => r.pokemon_id);
    return NextResponse.json({ ids });
  } catch (err) {
    console.error("[search] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
