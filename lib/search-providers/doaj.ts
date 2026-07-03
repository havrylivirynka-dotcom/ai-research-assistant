import "server-only";
import type { NormalizedArticle, SearchFilters } from "@/types/search";
import { fetchJson } from "./fetch-json";
import { normalizeDoi } from "./normalize";

type DoajArticle = {
  bibjson?: {
    title?: string;
    author?: { name?: string }[];
    journal?: { title?: string; publisher?: string; language?: string[] };
    year?: string;
    abstract?: string;
    identifier?: { type?: string; id?: string }[];
    link?: { type?: string; url?: string }[];
  };
};

type DoajResponse = { total: number; results: DoajArticle[] };

export async function searchDoaj(
  filters: SearchFilters,
): Promise<NormalizedArticle[]> {
  const pageSize = filters.pageSize ?? 20;

  let query = filters.query;
  if (filters.yearFrom && filters.yearTo) {
    query += ` AND bibjson.year:[${filters.yearFrom} TO ${filters.yearTo}]`;
  } else if (filters.yearFrom) {
    query += ` AND bibjson.year:[${filters.yearFrom} TO ${new Date().getFullYear()}]`;
  }

  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    pageSize: String(pageSize),
  });

  const data = await fetchJson<DoajResponse>(
    `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?${params.toString()}`,
  );

  return (data.results ?? []).map((item) => {
    const bibjson = item.bibjson ?? {};
    const doi = normalizeDoi(
      bibjson.identifier?.find((i) => i.type === "doi")?.id,
    );
    const fulltextUrl = bibjson.link?.find((l) => l.type === "fulltext")?.url;
    const year = bibjson.year ? parseInt(bibjson.year, 10) : null;

    return {
      id: doi ?? fulltextUrl ?? crypto.randomUUID(),
      title: bibjson.title ?? "Untitled",
      authors: (bibjson.author ?? [])
        .map((a) => a.name)
        .filter((name): name is string => Boolean(name)),
      abstract: bibjson.abstract ?? null,
      doi,
      journal: bibjson.journal?.title ?? null,
      publisher: bibjson.journal?.publisher ?? null,
      publicationYear: Number.isNaN(year) ? null : year,
      citations: 0,
      url: fulltextUrl ?? null,
      openAccessUrl: fulltextUrl ?? null,
      isOpenAccess: true,
      language: bibjson.journal?.language?.[0] ?? null,
      articleType: null,
      sourceProviders: ["doaj"],
      relevanceRank: 0,
    };
  });
}
