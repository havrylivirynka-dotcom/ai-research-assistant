import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database";

type SavedArticle = Database["public"]["Tables"]["saved_articles"]["Row"];

export function ProjectSourcesList({
  projectId,
  articles,
}: {
  projectId: string;
  articles: SavedArticle[];
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Sources</CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <BookOpen className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No sources saved yet.{" "}
              <Link href="/search" className="font-medium text-foreground">
                Search the literature
              </Link>{" "}
              to add some.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/projects/${projectId}/articles/${article.id}`}
                  className="block rounded-md p-2 -mx-2 hover:bg-accent"
                >
                  <p className="line-clamp-1 text-sm font-medium">
                    {article.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {article.journal && <span>{article.journal}</span>}
                    {article.publication_year && (
                      <span>{article.publication_year}</span>
                    )}
                    {article.ai_score !== null && (
                      <span>{article.ai_score.toFixed(1)}/10</span>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
