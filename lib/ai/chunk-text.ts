/**
 * Splits document text into overlapping chunks for embedding, tracking the
 * most recent section heading so each chunk can cite where it came from.
 * Character-based sizing (~4 chars/token) targets the ~500-800 token range
 * without adding a tokenizer dependency.
 */

const CHUNK_SIZE_CHARS = 2800; // ~700 tokens
const OVERLAP_CHARS = 400; // ~100 tokens

const SECTION_HEADING_PATTERN = /^\s*([IVXLC]+)\.\s+(.+)$/;

export type TextChunk = {
  content: string;
  sectionRef: string | null;
  chunkIndex: number;
};

export function chunkDocumentText(text: string): TextChunk[] {
  const lines = text.split("\n");
  const chunks: TextChunk[] = [];

  let currentSection: string | null = null;
  let buffer = "";
  let bufferSection: string | null = null;
  let chunkIndex = 0;

  function flush() {
    const trimmed = buffer.trim();
    if (trimmed.length > 0) {
      chunks.push({
        content: trimmed,
        sectionRef: bufferSection,
        chunkIndex: chunkIndex++,
      });
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(SECTION_HEADING_PATTERN);
    if (headingMatch) {
      currentSection = `${headingMatch[1]}. ${headingMatch[2]}`.trim();
    }

    if (buffer.length === 0) {
      bufferSection = currentSection;
    }

    buffer += (buffer ? "\n" : "") + line;

    if (buffer.length >= CHUNK_SIZE_CHARS) {
      flush();
      const overlap = buffer.slice(-OVERLAP_CHARS);
      buffer = overlap;
      bufferSection = currentSection;
    }
  }

  flush();

  return chunks;
}
