import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listSavedArticles } from "@/features/articles/queries";
import { LibraryList } from "@/features/library/components/library-list";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: articles } = await listSavedArticles(supabase);
  const t = await getTranslations("library");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {articles && articles.length > 0 ? (
        <LibraryList articles={articles} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookMarked className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
          <Link
            href="/search"
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            {t("searchForSources")}
          </Link>
        </div>
      )}
    </div>
  );
}
