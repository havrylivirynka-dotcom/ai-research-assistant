import { ExternalLink, Quote, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SaveToProjectDialog } from "./save-to-project-dialog";
import { AnalyzeDialog } from "./analyze-dialog";
import type { NormalizedArticle } from "@/types/search";

const PROVIDER_LABELS: Record<string, string> = {
  openalex: "OpenAlex",
  crossref: "CrossRef",
  semantic_scholar: "Semantic Scholar",
  arxiv: "arXiv",
  pubmed: "PubMed",
  doaj: "DOAJ",
};

export function ResultCard({ article }: { article: NormalizedArticle }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold leading-snug">
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {article.title}
              </a>
            ) : (
              article.title
            )}
          </h3>
          {article.isOpenAccess && (
            <Badge variant="secondary" className="shrink-0">
              Open Access
            </Badge>
          )}
        </div>

        {article.authors.length > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{article.authors.join(", ")}</span>
          </p>
        )}

        {article.abstract && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {article.abstract}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {article.journal && <span>{article.journal}</span>}
          {article.publicationYear && <span>{article.publicationYear}</span>}
          <span className="flex items-center gap-1">
            <Quote className="size-3.5" />
            {article.citations.toLocaleString()} citations
          </span>
          {article.doi && (
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              {article.doi}
              <ExternalLink className="size-3" />
            </a>
          )}
          <span className="flex gap-1">
            {article.sourceProviders.map((provider) => (
              <Badge key={provider} variant="outline" className="text-[10px]">
                {PROVIDER_LABELS[provider] ?? provider}
              </Badge>
            ))}
          </span>
        </div>

        <div className="flex gap-2">
          <AnalyzeDialog article={article} />
          <SaveToProjectDialog article={article} />
        </div>
      </CardContent>
    </Card>
  );
}
