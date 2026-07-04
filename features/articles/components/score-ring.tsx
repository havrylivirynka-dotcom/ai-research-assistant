"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColorClass(score: number): string {
  if (score >= 8) return "stroke-success";
  if (score >= 6) return "stroke-primary";
  if (score >= 4) return "stroke-warning";
  return "stroke-destructive";
}

export function ScoreRing({ score }: { score: number }) {
  const t = useTranslations("articles.scoreRing");
  const clamped = Math.max(0, Math.min(10, score));
  const offset = CIRCUMFERENCE - (clamped / 10) * CIRCUMFERENCE;

  return (
    <div
      className="relative"
      style={{ width: SIZE, height: SIZE }}
      role="img"
      aria-label={t("ariaLabel", { score: clamped.toFixed(1) })}
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          className="fill-none stroke-muted"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("fill-none transition-all", scoreColorClass(clamped))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold tabular-nums">
          {clamped.toFixed(1)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {t("outOf10")}
        </span>
      </div>
    </div>
  );
}
