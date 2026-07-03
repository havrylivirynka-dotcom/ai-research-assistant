import "server-only";
import type { NormalizedArticle } from "@/types/search";
import { normalizeTitle } from "./normalize";

function mergeTwo(
  a: NormalizedArticle,
  b: NormalizedArticle,
): NormalizedArticle {
  return {
    ...a,
    title: a.title.length >= b.title.length ? a.title : b.title,
    authors: a.authors.length >= b.authors.length ? a.authors : b.authors,
    abstract: a.abstract ?? b.abstract,
    doi: a.doi ?? b.doi,
    journal: a.journal ?? b.journal,
    publisher: a.publisher ?? b.publisher,
    publicationYear: a.publicationYear ?? b.publicationYear,
    citations: Math.max(a.citations, b.citations),
    url: a.url ?? b.url,
    openAccessUrl: a.openAccessUrl ?? b.openAccessUrl,
    isOpenAccess: a.isOpenAccess || b.isOpenAccess,
    language: a.language ?? b.language,
    articleType: a.articleType ?? b.articleType,
    sourceProviders: Array.from(
      new Set([...a.sourceProviders, ...b.sourceProviders]),
    ),
  };
}

/** Deduplicates by DOI first, then by normalized title + publication year. */
export function mergeDuplicates(
  articles: NormalizedArticle[],
): NormalizedArticle[] {
  const byDoi = new Map<string, NormalizedArticle>();
  const byTitleYear = new Map<string, NormalizedArticle>();
  const result: NormalizedArticle[] = [];

  for (const article of articles) {
    if (article.doi) {
      const existing = byDoi.get(article.doi);
      if (existing) {
        const merged = mergeTwo(existing, article);
        byDoi.set(article.doi, merged);
        const index = result.indexOf(existing);
        result[index] = merged;
        continue;
      }
      byDoi.set(article.doi, article);
      result.push(article);
      continue;
    }

    const titleKey = `${normalizeTitle(article.title)}|${article.publicationYear ?? ""}`;
    const existing = byTitleYear.get(titleKey);
    if (existing) {
      const merged = mergeTwo(existing, article);
      byTitleYear.set(titleKey, merged);
      const index = result.indexOf(existing);
      result[index] = merged;
      continue;
    }
    byTitleYear.set(titleKey, article);
    result.push(article);
  }

  return result;
}
