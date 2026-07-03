import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { embedText } from "./embeddings";

export type RetrievedChunk = {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  sectionRef: string | null;
  similarity: number;
};

export async function retrieveRelevantChunks(
  supabase: SupabaseClient<Database>,
  query: string,
  matchCount = 6,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query);

  const { data: matches, error } = await supabase.rpc(
    "match_knowledge_chunks",
    {
      query_embedding: queryEmbedding as unknown as string,
      match_count: matchCount,
      similarity_threshold: 0.3,
    },
  );

  if (error || !matches || matches.length === 0) {
    return [];
  }

  const documentIds = Array.from(new Set(matches.map((m) => m.document_id)));
  const { data: documents } = await supabase
    .from("knowledge_documents")
    .select("id, title")
    .in("id", documentIds);

  const titleById = new Map((documents ?? []).map((d) => [d.id, d.title]));

  return matches.map((match) => ({
    id: match.id,
    documentId: match.document_id,
    documentTitle: titleById.get(match.document_id) ?? "Unknown document",
    content: match.content,
    sectionRef: match.section_ref,
    similarity: match.similarity,
  }));
}

export function formatRetrievedContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant passages were found in the official documentation for this question.";
  }

  return chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}: "${chunk.documentTitle}"${chunk.sectionRef ? `, Section ${chunk.sectionRef}` : ""}]\n${chunk.content}`,
    )
    .join("\n\n---\n\n");
}
