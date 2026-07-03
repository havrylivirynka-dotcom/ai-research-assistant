import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSavedArticle } from "@/features/articles/queries";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EvaluateButton } from "@/features/articles/components/evaluate-button";
import { ScoreRing } from "@/features/articles/components/score-ring";
import { RecommendationBadge } from "@/features/articles/components/recommendation-badge";
import { CategoryScores } from "@/features/articles/components/category-scores";
import type { SourceEvaluation } from "@/lib/ai/schemas";

type PageProps = { params: Promise<{ id: string; articleId: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { articleId } = await params;
  const supabase = await createClient();
  const { data: article } = await getSavedArticle(supabase, articleId);
  return { title: article?.title ?? "Article" };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id, articleId } = await params;
  const supabase = await createClient();
  const { data: article, error } = await getSavedArticle(supabase, articleId);

  if (error || !article) {
    notFound();
  }

  const evaluation = article.ai_evaluation as SourceEvaluation | null;
  const authors = (article.authors as string[] | null) ?? [];

  return (
    <div className="space-y-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {article.projects?.title ?? "Project"}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {article.title}
        </h1>
        {authors.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {authors.join(", ")}
          </p>
        )}
      </div>

      <Tabs defaultValue="evaluation">
        <TabsList>
          <TabsTrigger value="abstract">Abstract</TabsTrigger>
          <TabsTrigger value="evaluation">AI Evaluation</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="abstract" className="max-w-2xl">
          <p className="text-sm leading-relaxed text-foreground/90">
            {article.abstract || "No abstract available for this source."}
          </p>
        </TabsContent>

        <TabsContent value="evaluation" className="max-w-2xl space-y-6">
          <EvaluateButton
            articleId={article.id}
            title={article.title}
            abstract={article.abstract}
            journal={article.journal}
            publisher={article.publisher}
            year={article.publication_year}
            doi={article.doi}
            citations={article.citations}
            hasEvaluation={Boolean(evaluation)}
          />

          {evaluation ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <ScoreRing score={evaluation.overallScore} />
                <div className="space-y-2">
                  <RecommendationBadge
                    recommendation={evaluation.recommendation}
                  />
                  <p className="text-sm text-muted-foreground">
                    {evaluation.explanation}
                  </p>
                </div>
              </div>

              <CategoryScores
                scores={{
                  credibility: evaluation.credibility,
                  relevance: evaluation.relevance,
                  freshness: evaluation.freshness,
                  methodologyQuality: evaluation.methodologyQuality,
                }}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium">Strengths</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {evaluation.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Weaknesses</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {evaluation.weaknesses.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Risks</h3>
                  {evaluation.risks.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">None noted.</p>
                  ) : (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {evaluation.risks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Not evaluated yet. Run the AI evaluation to get a credibility
              score and recommendation for this source.
            </p>
          )}
        </TabsContent>

        <TabsContent value="metadata" className="max-w-2xl">
          <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
            <dt className="text-muted-foreground">Journal</dt>
            <dd>{article.journal ?? "—"}</dd>
            <dt className="text-muted-foreground">Publisher</dt>
            <dd>{article.publisher ?? "—"}</dd>
            <dt className="text-muted-foreground">Year</dt>
            <dd>{article.publication_year ?? "—"}</dd>
            <dt className="text-muted-foreground">Citations</dt>
            <dd>{article.citations}</dd>
            <dt className="text-muted-foreground">DOI</dt>
            <dd>
              {article.doi ? (
                <a
                  href={`https://doi.org/${article.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {article.doi}
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                "—"
              )}
            </dd>
            <dt className="text-muted-foreground">Saved</dt>
            <dd>{new Date(article.created_at).toLocaleDateString()}</dd>
          </dl>
        </TabsContent>
      </Tabs>
    </div>
  );
}
