export type SearchProvider =
  | "openalex"
  | "crossref"
  | "semantic_scholar"
  | "arxiv"
  | "pubmed"
  | "doaj"
  | "europe_pmc"
  | "core"
  | "base"
  | "openaire"
  | "datacite"
  | "biorxiv"
  | "medrxiv";

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
  /** ISO-ish country name/code of the publisher or journal, when the provider exposes it. */
  country?: string | null;
  /** Subject/topic labels the provider attaches to the work, if any. */
  subjectAreas?: string[];
  sourceProviders: SearchProvider[];
  relevanceRank: number;
};

export type SearchSortBy =
  | "relevance"
  | "citations"
  | "date"
  | "quality";

export type SearchFilters = {
  query: string;
  yearFrom?: number;
  yearTo?: number;
  openAccess?: boolean;
  peerReviewedOnly?: boolean;
  language?: string;
  country?: string;
  journal?: string;
  documentType?: string;
  subjectArea?: string;
  minCitations?: number;
  sortBy?: SearchSortBy;
  page?: number;
  pageSize?: number;
};
