import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { WidgetCard, WidgetEmptyState } from "./widget-card";

type SavedArticleRow = {
  id: string;
  title: string;
  journal: string | null;
  ai_score: number | null;
  projects: { id: string; title: string } | null;
};

export async function SavedArticlesWidget({
  articles,
}: {
  articles: SavedArticleRow[];
}) {
  const t = await getTranslations("savedArticlesWidget");

  return (
    <WidgetCard title={t("title")} viewAllHref="/library">
      {articles.length === 0 ? (
        <WidgetEmptyState message={t("emptyState")} />
      ) : (
        <ul className="space-y-3">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={
                  article.projects
                    ? `/projects/${article.projects.id}`
                    : "/library"
                }
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate font-medium">{article.title}</span>
                {article.ai_score !== null && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {article.ai_score.toFixed(1)}/10
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
