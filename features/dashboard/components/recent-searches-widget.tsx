import Link from "next/link";
import { WidgetCard, WidgetEmptyState } from "./widget-card";

type SearchHistoryRow = { id: string; query: string };

export function RecentSearchesWidget({
  searches,
}: {
  searches: SearchHistoryRow[];
}) {
  return (
    <WidgetCard title="Recent searches" viewAllHref="/search">
      {searches.length === 0 ? (
        <WidgetEmptyState message="Your scientific search queries will show up here." />
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
