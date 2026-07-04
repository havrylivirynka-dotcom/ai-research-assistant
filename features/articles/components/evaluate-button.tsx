"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type EvaluateButtonProps = {
  articleId: string;
  title: string;
  abstract: string | null;
  journal: string | null;
  publisher: string | null;
  year: number | null;
  doi: string | null;
  citations: number;
  hasEvaluation: boolean;
};

export function EvaluateButton({
  articleId,
  title,
  abstract,
  journal,
  publisher,
  year,
  doi,
  citations,
  hasEvaluation,
}: EvaluateButtonProps) {
  const router = useRouter();
  const t = useTranslations("articles.evaluateButton");
  const [isEvaluating, setIsEvaluating] = useState(false);

  async function handleEvaluate() {
    setIsEvaluating(true);

    const response = await fetch("/api/articles/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId,
        title,
        abstract,
        journal,
        publisher,
        year,
        doi,
        citations,
      }),
    });

    setIsEvaluating(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? t("genericError"));
      return;
    }

    router.refresh();
  }

  return (
    <Button onClick={handleEvaluate} disabled={isEvaluating} variant={hasEvaluation ? "outline" : "default"}>
      {isEvaluating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      {isEvaluating
        ? t("evaluating")
        : hasEvaluation
          ? t("reEvaluate")
          : t("evaluate")}
    </Button>
  );
}
