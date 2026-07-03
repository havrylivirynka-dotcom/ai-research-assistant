import "server-only";
import type { NormalizedArticle, SearchFilters } from "@/types/search";
import { fetchJson } from "./fetch-json";
import { normalizeDoi } from "./normalize";

type CrossrefItem = {
  DOI?: string;
  title?: string[];
  author?: { given?: string; family?: string; name?: string }[];
  "container-title"?: string[];
  publisher?: string;
  published?: { "date-parts"?: number[][] };
  "is-referenced-by-count"?: number;
  URL?: string;
  abstract?: string;
  type?: string;
  language?: string;
};

type CrossrefResponse = {
  message: { items: CrossrefItem[]; "total-results": number };
};

function stripJatsTags(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

export async function searchCrossref(
  filters: SearchFilters,
): Promise<NormalizedArticle[]> {
  const params = new URLSearchParams({
    query: filters.query,
    rows: String(filters.pageSize ?? 20),
    offset: String(((filters.page ?? 1) - 1) * (filters.pageSize ?? 20)),
  });

  const filterParts: string[] = [];
  if (filters.yearFrom) {
    filterParts.push(`from-pub-date:${filters.yearFrom}-01-01`);
  }
  if (filters.yearTo) {
    filterParts.push(`until-pub-date:${filters.yearTo}-12-31`);
  }
  if (filters.openAccess) {
    filterParts.push("has-license:1");
  }
  if (filterParts.length > 0) {
    params.set("filter", filterParts.join(","));
  }
  if (process.env.CONTACT_EMAIL) {
    params.set("mailto", process.env.CONTACT_EMAIL);
  }

  const data = await fetchJson<CrossrefResponse>(
    `https://api.crossref.org/works?${params.toString()}`,
  );

  return data.message.items.map((item) => {
    const doi = normalizeDoi(item.DOI);
    const year = item.published?.["date-parts"]?.[0]?.[0] ?? null;

    return {
      id: doi ?? item.URL ?? crypto.randomUUID(),
      title: item.title?.[0] ?? "Untitled",
      authors: (item.author ?? []).map((a) =>
        a.name || [a.given, a.family].filter(Boolean).join(" "),
      ),
      abstract: item.abstract ? stripJatsTags(item.abstract) : null,
      doi,
      journal: item["container-title"]?.[0] ?? null,
      publisher: item.publisher ?? null,
      publicationYear: year,
      citations: item["is-referenced-by-count"] ?? 0,
      url: item.URL ?? null,
      openAccessUrl: null,
      isOpenAccess: false,
      language: item.language ?? null,
      articleType: item.type ?? null,
      sourceProviders: ["crossref"],
      relevanceRank: 0,
    };
  });
}
