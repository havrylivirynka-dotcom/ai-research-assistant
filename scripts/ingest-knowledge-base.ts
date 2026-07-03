/**
 * One-off ops script: ingests an official МАН regulation PDF into the RAG
 * knowledge base (chunk + embed + store). Run with the service-role key,
 * outside the Next.js server boundary, so it does not import any
 * "server-only"-guarded modules.
 *
 * Usage:
 *   npm run ingest-knowledge-base -- \
 *     --file "/path/to/document.pdf" \
 *     --title "Title of the regulation" \
 *     --orderNumber "147" \
 *     --issuingAuthority "Міністерство освіти і науки України" \
 *     --effectiveDate "2021-02-08"
 */
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { extractText, getDocumentProxy } from "unpdf";
import { chunkDocumentText } from "../lib/ai/chunk-text";
import type { Database } from "../types/database";

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    result[key] = args[i + 1];
  }
  return result;
}

const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
const EMBEDDING_DIMENSIONS = 1536;
const EMBEDDING_BATCH_SIZE = 20;

async function main() {
  const args = parseArgs();

  if (!args.file || !args.title) {
    console.error(
      "Usage: npm run ingest-knowledge-base -- --file <path> --title <title> [--orderNumber <n>] [--issuingAuthority <name>] [--effectiveDate <YYYY-MM-DD>]",
    );
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.",
    );
    process.exit(1);
  }
  if (!openaiApiKey) {
    console.error("OPENAI_API_KEY must be set.");
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const openai = new OpenAI({ apiKey: openaiApiKey });

  console.log(`Extracting text from ${args.file}...`);
  const bytes = new Uint8Array(await readFile(args.file));
  const document = await getDocumentProxy(bytes);
  // mergePages: true collapses the whole document into a single line with no
  // structure at all, which breaks section-heading detection below.
  // Extracting per page (which preserves real line breaks) and joining
  // ourselves keeps that structure intact.
  const { text: pages } = await extractText(document, { mergePages: false });
  const text = pages.join("\n");
  console.log(`Extracted ${text.length} characters.`);

  const chunks = chunkDocumentText(text);
  console.log(`Split into ${chunks.length} chunks.`);

  console.log("Creating knowledge_documents row...");
  const { data: doc, error: docError } = await supabase
    .from("knowledge_documents")
    .insert({
      title: args.title,
      order_number: args.orderNumber ?? null,
      issuing_authority: args.issuingAuthority ?? null,
      effective_date: args.effectiveDate ?? null,
      status: "active",
      source: args.file,
    })
    .select("id")
    .single();

  if (docError || !doc) {
    console.error("Failed to create knowledge_documents row:", docError);
    process.exit(1);
  }

  console.log(`Document id: ${doc.id}`);
  console.log("Embedding and storing chunks...");

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch.map((chunk) => chunk.content),
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const rows = batch.map((chunk, index) => ({
      document_id: doc.id,
      content: chunk.content,
      section_ref: chunk.sectionRef,
      chunk_index: chunk.chunkIndex,
      embedding: JSON.stringify(response.data[index].embedding),
    }));

    const { error: insertError } = await supabase
      .from("knowledge_chunks")
      .insert(rows);

    if (insertError) {
      console.error("Failed to insert chunk batch:", insertError);
      process.exit(1);
    }

    console.log(
      `  Embedded and stored chunks ${i + 1}-${Math.min(i + batch.length, chunks.length)} of ${chunks.length}`,
    );
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
