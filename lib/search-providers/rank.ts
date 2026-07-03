import "server-only";
import type { NormalizedArticle } from "@/types/search";
import { normalizeTitle } from "./normalize";

/**
 * Weighted relevance score combining citation impact, recency, how many
 * providers agreed on the result, and simple query-term overlap in the
 * title. Each factor is normalized to roughly [0, 1] before weighting so no
 * single signal (e.g. a highly-cited but decades-old paper) dominates.
 */
export function rankArticles(
  articles: NormalizedArticle[],
  query: string,
): NormalizedArticle[] {
  const currentYear = new Date().getFullYear();
  const queryTerms = normalizeTitle(query).split(" ").filter(Boolean);

  const scored = articles.map((article) => {
    const citationScore = Math.log10(article.citations + 1) / 4; // ~1.0 at 10k citations
    const recencyScore = article.publicationYear
      ? Math.max(0, 1 - (currentYear - article.publicationYear) / 30)
      : 0.2;
    const consensusScore = Math.min(article.sourceProviders.length / 3, 1);

    const titleWords = normalizeTitle(article.title).split(" ");
    const matchedTerms = queryTerms.filter((term) =>
      titleWords.includes(term),
    ).length;
    const textRelevanceScore =
      queryTerms.length > 0 ? matchedTerms / queryTerms.length : 0;

    const relevanceRank =
      textRelevanceScore * 0.4 +
      citationScore * 0.25 +
      recencyScore * 0.2 +
      consensusScore * 0.15;

    return { ...article, relevanceRank };
  });

  return scored.sort((a, b) => b.relevanceRank - a.relevanceRank);
}
