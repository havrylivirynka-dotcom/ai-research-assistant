import "server-only";
import type { NormalizedArticle, SearchFilters } from "@/types/search";
import { fetchJson } from "./fetch-json";
import { normalizeDoi } from "./normalize";

type EsearchResponse = {
  esearchresult?: { idlist?: string[] };
};

type EsummaryDocument = {
  uid: string;
  title?: string;
  authors?: { name?: string }[];
  fulljournalname?: string;
  pubdate?: string;
  articleids?: { idtype?: string; value?: string }[];
  pubtype?: string[];
};

type EsummaryResponse = {
  result?: Record<string, EsummaryDocument | string[]>;
};

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function apiKeyParam(): Record<string, string> {
  return process.env.PUBMED_API_KEY
    ? { api_key: process.env.PUBMED_API_KEY }
    : {};
}

export async function searchPubmed(
  filters: SearchFilters,
): Promise<NormalizedArticle[]> {
  const pageSize = filters.pageSize ?? 20;

  let term = filters.query;
  if (filters.yearFrom || filters.yearTo) {
    const from = filters.yearFrom ?? 1900;
    const to = filters.yearTo ?? new Date().getFullYear();
    term += ` AND ${from}:${to}[dp]`;
  }

  const searchParams = new URLSearchParams({
    db: "pubmed",
    term,
    retmax: String(pageSize),
    retstart: String(((filters.page ?? 1) - 1) * pageSize),
    retmode: "json",
    sort: "relevance",
    ...apiKeyParam(),
  });

  const searchData = await fetchJson<EsearchResponse>(
    `${EUTILS_BASE}/esearch.fcgi?${searchParams.toString()}`,
  );
  const ids = searchData.esearchresult?.idlist ?? [];

  if (ids.length === 0) return [];

  const summaryParams = new URLSearchParams({
    db: "pubmed",
    id: ids.join(","),
    retmode: "json",
    ...apiKeyParam(),
  });

  const summaryData = await fetchJson<EsummaryResponse>(
    `${EUTILS_BASE}/esummary.fcgi?${summaryParams.toString()}`,
  );

  return ids
    .map((id) => summaryData.result?.[id])
    .filter(
      (doc): doc is EsummaryDocument =>
        Boolean(doc) && typeof doc === "object" && !Array.isArray(doc),
    )
    .map((doc) => {
      const doi = normalizeDoi(
        doc.articleids?.find((a) => a.idtype === "doi")?.value,
      );
      const year = doc.pubdate ? parseInt(doc.pubdate, 10) : null;

      return {
        id: doi ?? `pubmed:${doc.uid}`,
        title: doc.title?.replace(/<[^>]+>/g, "") ?? "Untitled",
        authors: (doc.authors ?? [])
          .map((a) => a.name)
          .filter((name): name is string => Boolean(name)),
        abstract: null,
        doi,
        journal: doc.fulljournalname ?? null,
        publisher: null,
        publicationYear: Number.isNaN(year) ? null : year,
        citations: 0,
        url: `https://pubmed.ncbi.nlm.nih.gov/${doc.uid}/`,
        openAccessUrl: null,
        isOpenAccess: false,
        language: null,
        articleType: doc.pubtype?.[0] ?? null,
        sourceProviders: ["pubmed"],
        relevanceRank: 0,
      };
    });
}
