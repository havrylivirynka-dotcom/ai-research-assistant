/**
 * Splits raw bibliography text into individual reference entries. References
 * are assumed to be one per line (the common case for pasted or exported
 * reference lists); leading numbering like "1.", "[1]", "-" is stripped.
 */
export function parseReferenceLines(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^\[\d+\]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .replace(/^[-•]\s*/, "")
        .trim(),
    )
    .filter((line) => line.length > 10);
}
