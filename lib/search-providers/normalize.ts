import "server-only";

/** Strips protocol/host so DOIs from different providers compare equal. */
export function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;

  const cleaned = doi
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .toLowerCase();

  return cleaned.length > 0 ? cleaned : null;
}

/** Collapses whitespace/punctuation so titles from different providers can be fuzzy-matched. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
