import { getTranslations } from "next-intl/server";
import { WidgetCard } from "./widget-card";

export async function AiUsageWidget({
  usage,
}: {
  usage: { requests: number; tokens: number; cost: number };
}) {
  const t = await getTranslations("aiUsageWidget");

  return (
    <WidgetCard title={t("title")} viewAllHref="/usage">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-semibold tabular-nums">
            {usage.requests}
          </p>
          <p className="text-xs text-muted-foreground">{t("requests")}</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">
            {usage.tokens.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{t("tokens")}</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">
            ${usage.cost.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">{t("estCost")}</p>
        </div>
      </div>
    </WidgetCard>
  );
}
