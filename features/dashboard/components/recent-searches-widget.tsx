import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { WidgetCard, WidgetEmptyState } from "./widget-card";

type SearchHistoryRow = { id: string; query: string };

export async function RecentSearchesWidget({
  searches,
}: {
  searches: SearchHistoryRow[];
}) {
  const t = await getTranslations("recentSearchesWidget");

  return (
    <WidgetCard title={t("title")} viewAllHref="/search">
      {searches.length === 0 ? (
        <WidgetEmptyState message={t("emptyState")} />
      ) : (
        <ul className="space-y-3">
          {searches.map((search) => (
            <li key={search.id}>
              <Link
                href={`/search?q=${encodeURIComponent(search.query)}`}
                className="block truncate text-sm font-medium"
              >
                {search.query}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
