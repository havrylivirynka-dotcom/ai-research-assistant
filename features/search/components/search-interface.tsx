"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search as SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultCard } from "./result-card";
import { SearchFiltersPopover } from "./search-filters";
import type { NormalizedArticle, SearchFilters } from "@/types/search";

type FiltersValue = Omit<SearchFilters, "query" | "page" | "pageSize">;

export function SearchInterface({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("search");

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FiltersValue>({});
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<NormalizedArticle[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery.trim().length >= 2) {
      runSearch(initialQuery, 1);
    }
    // Only ever run once, for the query that arrived via the URL on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(searchQuery: string, targetPage: number) {
    if (searchQuery.trim().length < 2) return;

    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchQuery,
        ...filters,
        page: targetPage,
      }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error?.message ?? t("searchFailed"));
      return;
    }

    const body = await response.json();
    setResults(body.results);
    setPage(targetPage);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) params.set("q", query);
    router.replace(`/search?${params.toString()}`, { scroll: false });
    runSearch(query, 1);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="pl-9"
          />
        </div>
        <SearchFiltersPopover value={filters} onChange={setFilters} />
        <Button type="submit" disabled={isLoading}>
          {t("searchButton")}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && results !== null && (
        <>
          {results.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {t("noResults")}
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((article) => (
                <ResultCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => runSearch(query, page - 1)}
            >
              <ChevronLeft className="size-4" />
              {t("previous")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("page", { page })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={results.length === 0 || isLoading}
              onClick={() => runSearch(query, page + 1)}
            >
              {t("next")}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </>
      )}

      {!isLoading && results === null && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t("emptyState")}
        </p>
      )}
    </div>
  );
}
