import "server-only";
import mammoth from "mammoth";

export async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const { value } = await mammoth.extractRawText({
    buffer: Buffer.from(bytes),
  });
  return value.trim();
}
