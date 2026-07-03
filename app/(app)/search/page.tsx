import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchInterface } from "@/features/search/components/search-interface";

export const metadata: Metadata = { title: "Scientific Search" };

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Scientific Search
        </h1>
        <p className="text-muted-foreground">
          Search OpenAlex, CrossRef, Semantic Scholar, arXiv, PubMed and DOAJ
          in one query.
        </p>
      </div>

      <Suspense>
        <SearchInterface initialQuery={q ?? ""} />
      </Suspense>
    </div>
  );
}
