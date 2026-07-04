import { getTranslations } from "next-intl/server";

export async function EndpointBreakdown({
  breakdown,
}: {
  breakdown: { endpoint: string; requests: number; tokens: number; cost: number }[];
}) {
  const t = await getTranslations("usage");
  const maxTokens = Math.max(...breakdown.map((b) => b.tokens), 1);

  const endpointLabels: Record<string, string> = {
    "/api/articles/evaluate": t("endpointSourceEvaluation"),
    "/api/uploads/pdf": t("endpointPdfAnalyzer"),
    "/api/bibliography/analyze": t("endpointBibliographyChecker"),
    "/api/bibliography/reanalyze": t("endpointBibliographyChecker"),
    "/api/chat": t("endpointAiAssistant"),
    "/api/research/structure": t("endpointStructureGenerator"),
  };

  if (breakdown.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("noUsage")}</p>
    );
  }

  return (
    <div className="space-y-4">
      {breakdown.map((item) => (
        <div key={item.endpoint} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{endpointLabels[item.endpoint] ?? item.endpoint}</span>
            <span className="text-muted-foreground">
              {t("requestCount", { count: item.requests })} ·{" "}
              {item.tokens.toLocaleString()} {t("tokensSuffix")} · $
              {item.cost.toFixed(3)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(item.tokens / maxTokens) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
