"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecommendationBadge } from "@/features/articles/components/recommendation-badge";
import { SOURCE_TYPE_VALUES } from "@/lib/ai/schemas";
import type { Database } from "@/types/database";

type BibliographyRow = Database["public"]["Tables"]["bibliography"]["Row"];
type Analysis = {
  issues?: string[];
  isDuplicate?: boolean;
  duplicateOfIndex?: number | null;
} | null;

function isSourceType(
  value: string,
): value is (typeof SOURCE_TYPE_VALUES)[number] {
  return (SOURCE_TYPE_VALUES as readonly string[]).includes(value);
}

export function ReferenceRow({
  reference,
  index,
}: {
  reference: BibliographyRow;
  index: number;
}) {
  const router = useRouter();
  const t = useTranslations("referenceRow");
  const tSourceType = useTranslations("sourceType");
  const [isDeleting, setIsDeleting] = useState(false);
  const analysis = reference.ai_analysis as Analysis;

  async function handleDelete() {
    setIsDeleting(true);
    const response = await fetch(`/api/bibliography/${reference.id}`, {
      method: "DELETE",
    });
    setIsDeleting(false);
    if (response.ok) router.refresh();
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-4 last:border-0">
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm">
          <span className="text-muted-foreground">{index + 1}.</span>{" "}
          {reference.reference_text}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {reference.source_type && (
            <Badge variant="outline" className="text-[10px]">
              {isSourceType(reference.source_type)
                ? tSourceType(reference.source_type)
                : reference.source_type.replace("_", " ")}
            </Badge>
          )}
          {reference.recommendation && (
            <RecommendationBadge recommendation={reference.recommendation} />
          )}
          {analysis?.isDuplicate && (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <AlertTriangle className="size-3" />
              {t("duplicateOf", { index: (analysis.duplicateOfIndex ?? 0) + 1 })}
            </Badge>
          )}
          {reference.ai_score !== null && (
            <span className="text-xs text-muted-foreground">
              {reference.ai_score.toFixed(1)}/10
            </span>
          )}
        </div>

        {analysis?.issues && analysis.issues.length > 0 && (
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
            {analysis.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={t("deleteAriaLabel")}
        className="shrink-0"
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </Button>
    </div>
  );
}
