"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  CircleCheck,
  TriangleAlert,
  ShieldAlert,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScoreRing } from "@/features/articles/components/score-ring";
import { RecommendationBadge } from "@/features/articles/components/recommendation-badge";
import { CategoryScores } from "@/features/articles/components/category-scores";
import type { SourceEvaluation } from "@/lib/ai/schemas";
import type { NormalizedArticle } from "@/types/search";

function EvaluationList({
  title,
  icon: Icon,
  iconClassName,
  items,
}: {
  title: string;
  icon: typeof CircleCheck;
  iconClassName: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className={`size-4 ${iconClassName}`} />
        {title}
      </h3>
      <ul className="space-y-1.5 pl-1">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex gap-2 text-sm text-muted-foreground"
          >
            <span className="select-none text-muted-foreground/50">•</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyzeDialog({ article }: { article: NormalizedArticle }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<SourceEvaluation | null>(null);

  async function runEvaluation() {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/articles/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: article.title,
        abstract: article.abstract,
        journal: article.journal,
        publisher: article.publisher,
        year: article.publicationYear,
        doi: article.doi,
        citations: article.citations,
      }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error?.message ?? "Could not evaluate this source.");
      return;
    }

    setEvaluation(await response.json());
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen || evaluation || isLoading) return;
    void runEvaluation();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="size-4" />
          Analyze
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogHeader className="shrink-0 flex-row items-start justify-between gap-4 border-b px-6 py-4">
          <DialogTitle className="line-clamp-2 pt-0.5 text-base leading-snug">
            {article.title}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-2 -mt-0.5 shrink-0"
            >
              <span className="sr-only">Close</span>
              <X className="size-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Analyzing source with AI…
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={runEvaluation}>
                <RotateCcw className="size-4" />
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && evaluation && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                <ScoreRing score={evaluation.overallScore} />
                <div className="space-y-2">
                  <RecommendationBadge
                    recommendation={evaluation.recommendation}
                  />
                  <p className="text-sm leading-relaxed text-muted-foreground">
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

              {(evaluation.strengths.length > 0 ||
                evaluation.weaknesses.length > 0 ||
                evaluation.risks.length > 0) && (
                <div className="space-y-5 border-t pt-5">
                  <EvaluationList
                    title="Strengths"
                    icon={CircleCheck}
                    iconClassName="text-success"
                    items={evaluation.strengths}
                  />
                  <EvaluationList
                    title="Weaknesses"
                    icon={TriangleAlert}
                    iconClassName="text-warning"
                    items={evaluation.weaknesses}
                  />
                  <EvaluationList
                    title="Risks"
                    icon={ShieldAlert}
                    iconClassName="text-destructive"
                    items={evaluation.risks}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 mx-0 mb-0 rounded-b-xl border-t bg-muted/50 px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
