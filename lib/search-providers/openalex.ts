import "server-only";
import type { NormalizedArticle, SearchFilters } from "@/types/search";
import { fetchJson } from "./fetch-json";
import { normalizeDoi } from "./normalize";

type OpenAlexAuthor = { author?: { display_name?: string } };

type OpenAlexWork = {
  id: string;
  doi?: string | null;
  display_name?: string;
  title?: string;
  publication_year?: number | null;
  cited_by_count?: number;
  authorships?: OpenAlexAuthor[];
  primary_location?: {
    source?: { display_name?: string | null; publisher?: string | null };
    landing_page_url?: string | null;
    is_oa?: boolean;
  } | null;
  open_access?: { is_oa?: boolean; oa_url?: string | null };
  language?: string | null;
  type?: string | null;
  abstract_inverted_index?: Record<string, number[]> | null;
};

type OpenAlexResponse = { results: OpenAlexWork[]; meta: { count: number } };

function reconstructAbstract(
  index: Record<string, number[]> | null | undefined,
): string | null {
  if (!index) return null;

  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) {
      words[position] = word;
    }
  }

  const abstract = words.filter(Boolean).join(" ").trim();
  return abstract.length > 0 ? abstract : null;
}

export async function searchOpenAlex(
  filters: SearchFilters,
): Promise<NormalizedArticle[]> {
  const params = new URLSearchParams({
    search: filters.query,
    per_page: String(filters.pageSize ?? 20),
    page: String(filters.page ?? 1),
  });

  const filterParts: string[] = [];
  if (filters.yearFrom) {
    filterParts.push(`from_publication_date:${filters.yearFrom}-01-01`);
  }
  if (filters.yearTo) {
    filterParts.push(`to_publication_date:${filters.yearTo}-12-31`);
  }
  if (filters.openAccess) {
    filterParts.push("open_access.is_oa:true");
  }
  if (filterParts.length > 0) {
    params.set("filter", filterParts.join(","));
  }
  if (process.env.CONTACT_EMAIL) {
    params.set("mailto", process.env.CONTACT_EMAIL);
  }

  const data = await fetchJson<OpenAlexResponse>(
    `https://api.openalex.org/works?${params.toString()}`,
  );

  return data.results.map((work) => {
    const isOpenAccess = Boolean(
      work.open_access?.is_oa ?? work.primary_location?.is_oa,
    );

    return {
      id: normalizeDoi(work.doi) ?? work.id,
      title: work.title ?? work.display_name ?? "Untitled",
      authors: (work.authorships ?? [])
        .map((a) => a.author?.display_name)
        .filter((name): name is string => Boolean(name)),
      abstract: reconstructAbstract(work.abstract_inverted_index),
      doi: normalizeDoi(work.doi),
      journal: work.primary_location?.source?.display_name ?? null,
      publisher: work.primary_location?.source?.publisher ?? null,
      publicationYear: work.publication_year ?? null,
      citations: work.cited_by_count ?? 0,
      url: work.primary_location?.landing_page_url ?? work.id,
      openAccessUrl: work.open_access?.oa_url ?? null,
      isOpenAccess,
      language: work.language ?? null,
      articleType: work.type ?? null,
      sourceProviders: ["openalex"],
      relevanceRank: 0,
    };
  });
}
