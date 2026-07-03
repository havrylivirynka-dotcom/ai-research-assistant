import "server-only";
import type { NormalizedArticle, SearchFilters } from "@/types/search";
import { searchOpenAlex } from "./openalex";
import { searchCrossref } from "./crossref";
import { searchSemanticScholar } from "./semantic-scholar";
import { searchArxiv } from "./arxiv";
import { searchPubmed } from "./pubmed";
import { searchDoaj } from "./doaj";
import { mergeDuplicates } from "./merge";
import { rankArticles } from "./rank";

const PROVIDERS = [
  { name: "openalex", run: searchOpenAlex },
  { name: "crossref", run: searchCrossref },
  { name: "semantic_scholar", run: searchSemanticScholar },
  { name: "arxiv", run: searchArxiv },
  { name: "pubmed", run: searchPubmed },
  { name: "doaj", run: searchDoaj },
] as const;

export type ProviderOutcome = {
  provider: string;
  ok: boolean;
  count: number;
  error?: string;
};

export async function searchAllProviders(filters: SearchFilters): Promise<{
  articles: NormalizedArticle[];
  providerOutcomes: ProviderOutcome[];
}> {
  const settled = await Promise.allSettled(
    PROVIDERS.map((provider) => provider.run(filters)),
  );

  const providerOutcomes: ProviderOutcome[] = [];
  const results: NormalizedArticle[] = [];

  settled.forEach((outcome, index) => {
    const provider = PROVIDERS[index];
    if (outcome.status === "fulfilled") {
      results.push(...outcome.value);
      providerOutcomes.push({
        provider: provider.name,
        ok: true,
        count: outcome.value.length,
      });
    } else {
      providerOutcomes.push({
        provider: provider.name,
        ok: false,
        count: 0,
        error:
          outcome.reason instanceof Error
            ? outcome.reason.message
            : "Unknown error",
      });
    }
  });

  if (filters.minCitations !== undefined) {
    const minCitations = filters.minCitations;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].citations < minCitations) results.splice(i, 1);
    }
  }
  if (filters.language) {
    const language = filters.language.toLowerCase();
    for (let i = results.length - 1; i >= 0; i--) {
      const articleLanguage = results[i].language?.toLowerCase();
      if (articleLanguage && articleLanguage !== language) results.splice(i, 1);
    }
  }

  const deduplicated = mergeDuplicates(results);
  const ranked = rankArticles(deduplicated, filters.query);

  return { articles: ranked, providerOutcomes };
}
