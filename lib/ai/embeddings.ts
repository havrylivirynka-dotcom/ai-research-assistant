import "server-only";
import { AI_EMBEDDING_MODEL, getOpenAiClient } from "./client";

export const EMBEDDING_DIMENSIONS = 1536;

export async function embedText(text: string): Promise<number[]> {
  const client = getOpenAiClient();

  const response = await client.embeddings.create({
    model: AI_EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}
