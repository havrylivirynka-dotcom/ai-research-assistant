import "server-only";
import { XMLParser } from "fast-xml-parser";
import type { NormalizedArticle, SearchFilters } from "@/types/search";
import { fetchText } from "./fetch-json";
import { normalizeDoi } from "./normalize";

type ArxivEntry = {
  id: string;
  title: string;
  summary?: string;
  published?: string;
  author?: { name: string } | { name: string }[];
  link?:
    | { "@_href"?: string; "@_title"?: string; "@_rel"?: string }
    | { "@_href"?: string; "@_title"?: string; "@_rel"?: string }[];
  "arxiv:doi"?: string;
};

type ArxivFeed = {
  feed?: { entry?: ArxivEntry | ArxivEntry[] };
};

const parser = new XMLParser({ ignoreAttributes: false });

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function searchArxiv(
  filters: SearchFilters,
): Promise<NormalizedArticle[]> {
  const pageSize = filters.pageSize ?? 20;

  let searchQuery = `all:${filters.query}`;
  if (filters.yearFrom || filters.yearTo) {
    const from = filters.yearFrom ? `${filters.yearFrom}0101000000` : "*";
    const to = filters.yearTo ? `${filters.yearTo}1231235959` : "*";
    searchQuery += ` AND submittedDate:[${from} TO ${to}]`;
  }

  const params = new URLSearchParams({
    search_query: searchQuery,
    start: String(((filters.page ?? 1) - 1) * pageSize),
    max_results: String(pageSize),
    sortBy: "relevance",
    sortOrder: "descending",
  });

  const xml = await fetchText(
    `https://export.arxiv.org/api/query?${params.toString()}`,
  );
  const parsed = parser.parse(xml) as ArxivFeed;
  const entries = toArray(parsed.feed?.entry);

  return entries.map((entry) => {
    const links = toArray(entry.link);
    const pdfLink = links.find((l) => l["@_title"] === "pdf")?.["@_href"];
    const htmlLink =
      links.find((l) => l["@_rel"] === "alternate")?.["@_href"] ?? entry.id;
    const authors = toArray(entry.author).map((a) => a.name);
    const year = entry.published
      ? new Date(entry.published).getFullYear()
      : null;

    return {
      id: normalizeDoi(entry["arxiv:doi"]) ?? entry.id,
      title: entry.title?.replace(/\s+/g, " ").trim() ?? "Untitled",
      authors,
      abstract: entry.summary?.replace(/\s+/g, " ").trim() ?? null,
      doi: normalizeDoi(entry["arxiv:doi"]),
      journal: "arXiv preprint",
      publisher: "arXiv",
      publicationYear: year,
      citations: 0,
      url: htmlLink ?? null,
      openAccessUrl: pdfLink ?? htmlLink ?? null,
      isOpenAccess: true,
      language: null,
      articleType: "preprint",
      sourceProviders: ["arxiv"],
      relevanceRank: 0,
    };
  });
}
