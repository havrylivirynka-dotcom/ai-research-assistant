import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SearchInterface } from "@/features/search/components/search-interface";

export const metadata: Metadata = { title: "Scientific Search" };

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const t = await getTranslations("search");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Suspense>
        <SearchInterface initialQuery={q ?? ""} />
      </Suspense>
    </div>
  );
}
