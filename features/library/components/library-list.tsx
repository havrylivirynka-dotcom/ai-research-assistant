"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type LibraryArticle = {
  id: string;
  title: string;
  journal: string | null;
  authors: unknown;
  publication_year: number | null;
  ai_score: number | null;
  projects: { id: string; title: string } | null;
};

export function LibraryList({ articles }: { articles: LibraryArticle[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((article) => {
      const authors = Array.isArray(article.authors)
        ? (article.authors as string[]).join(" ")
        : "";
      return (
        article.title.toLowerCase().includes(q) ||
        (article.journal ?? "").toLowerCase().includes(q) ||
        authors.toLowerCase().includes(q)
      );
    });
  }, [articles, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your library..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No saved articles match your search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Link
              key={article.id}
              href={
                article.projects
                  ? `/projects/${article.projects.id}/articles/${article.id}`
                  : "/library"
              }
            >
              <Card className="h-full border-border/60 hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {article.journal}
                    {article.publication_year ? ` · ${article.publication_year}` : ""}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground">
                    {article.projects?.title ?? "Unknown project"}
                    {article.ai_score !== null &&
                      ` · Score ${article.ai_score.toFixed(1)}/10`}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
