"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const RECOMMENDATION_CLASSES: Record<string, string> = {
  "Highly Recommended": "bg-success/15 text-success",
  Recommended: "bg-success/10 text-success",
  Acceptable: "bg-primary/10 text-primary",
  "Use With Caution": "bg-warning/15 text-warning",
  "Not Recommended": "bg-destructive/15 text-destructive",
};

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: string;
}) {
  const t = useTranslations("articles");
  type RecommendationKey = "Highly Recommended" | "Recommended" | "Acceptable" | "Use With Caution" | "Not Recommended";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        RECOMMENDATION_CLASSES[recommendation] ??
          "bg-muted text-muted-foreground",
      )}
    >
      {t(`recommendation.${recommendation as RecommendationKey}`)}
    </span>
  );
}
