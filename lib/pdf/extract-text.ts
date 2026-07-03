import "server-only";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_CHARS = 60_000; // keeps the AI prompt within a reasonable token budget

export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const document = await getDocumentProxy(bytes);
  // mergePages: true collapses the whole document into a single line with no
  // paragraph/heading structure at all. Extracting per page (which preserves
  // real line breaks) and joining ourselves keeps that structure intact.
  const { text: pages } = await extractText(document, { mergePages: false });
  const text = pages.join("\n");

  const cleaned = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  return cleaned.length > MAX_CHARS ? cleaned.slice(0, MAX_CHARS) : cleaned;
}
