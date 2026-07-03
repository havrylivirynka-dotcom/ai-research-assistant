import "server-only";
import type { NormalizedArticle, SearchFilters } from "@/types/search";
import { fetchJson } from "./fetch-json";
import { normalizeDoi } from "./normalize";

type SemanticScholarPaper = {
  paperId: string;
  title?: string;
  abstract?: string | null;
  authors?: { name?: string }[];
  year?: number | null;
  venue?: string | null;
  citationCount?: number;
  externalIds?: { DOI?: string };
  openAccessPdf?: { url?: string } | null;
  url?: string;
  publicationTypes?: string[] | null;
};

type SemanticScholarResponse = {
  total: number;
  data: SemanticScholarPaper[];
};

export async function searchSemanticScholar(
  filters: SearchFilters,
): Promise<NormalizedArticle[]> {
  const pageSize = filters.pageSize ?? 20;
  const params = new URLSearchParams({
    query: filters.query,
    limit: String(pageSize),
    offset: String(((filters.page ?? 1) - 1) * pageSize),
    fields:
      "title,abstract,authors,year,venue,citationCount,externalIds,openAccessPdf,url,publicationTypes",
  });

  if (filters.yearFrom || filters.yearTo) {
    params.set("year", `${filters.yearFrom ?? ""}-${filters.yearTo ?? ""}`);
  }
  if (filters.openAccess) {
    params.set("openAccessPdf", "");
  }

  const data = await fetchJson<SemanticScholarResponse>(
    `https://api.semanticscholar.org/graph/v1/paper/search?${params.toString()}`,
    {
      headers: process.env.SEMANTIC_SCHOLAR_API_KEY
        ? { "x-api-key": process.env.SEMANTIC_SCHOLAR_API_KEY }
        : undefined,
    },
  );

  return (data.data ?? []).map((paper) => {
    const doi = normalizeDoi(paper.externalIds?.DOI);

    return {
      id: doi ?? paper.paperId,
      title: paper.title ?? "Untitled",
      authors: (paper.authors ?? [])
        .map((a) => a.name)
        .filter((name): name is string => Boolean(name)),
      abstract: paper.abstract ?? null,
      doi,
      journal: paper.venue || null,
      publisher: null,
      publicationYear: paper.year ?? null,
      citations: paper.citationCount ?? 0,
      url: paper.url ?? null,
      openAccessUrl: paper.openAccessPdf?.url ?? null,
      isOpenAccess: Boolean(paper.openAccessPdf?.url),
      language: null,
      articleType: paper.publicationTypes?.[0] ?? null,
      sourceProviders: ["semantic_scholar"],
      relevanceRank: 0,
    };
  });
}
