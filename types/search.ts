export type SearchProvider =
  | "openalex"
  | "crossref"
  | "semantic_scholar"
  | "arxiv"
  | "pubmed"
  | "doaj";

export type NormalizedArticle = {
  /** Stable dedupe key: doi if present, otherwise `${provider}:${externalId}`. */
  id: string;
  title: string;
  authors: string[];
  abstract: string | null;
  doi: string | null;
  journal: string | null;
  publisher: string | null;
  publicationYear: number | null;
  citations: number;
  url: string | null;
  openAccessUrl: string | null;
  isOpenAccess: boolean;
  language: string | null;
  articleType: string | null;
  sourceProviders: SearchProvider[];
  relevanceRank: number;
};

export type SearchFilters = {
  query: string;
  yearFrom?: number;
  yearTo?: number;
  openAccess?: boolean;
  language?: string;
  minCitations?: number;
  page?: number;
  pageSize?: number;
};
