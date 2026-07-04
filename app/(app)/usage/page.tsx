import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listUsage, summarizeUsage } from "@/features/usage/queries";
import { EndpointBreakdown } from "@/features/usage/components/endpoint-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Usage" };

export default async function UsagePage() {
  const supabase = await createClient();
  const { data } = await listUsage(supabase);
  const rows = data ?? [];
  const { totalRequests, totalTokens, totalCost, endpointBreakdown } =
    summarizeUsage(rows);
  const t = await getTranslations("usage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalRequests")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {totalRequests.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalTokens")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {totalTokens.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("estimatedCost")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              ${totalCost.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">{t("usageByFeature")}</CardTitle>
        </CardHeader>
        <CardContent>
          <EndpointBreakdown breakdown={endpointBreakdown} />
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {rows.slice(0, 20).map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between px-6 py-3 text-sm"
                >
                  <span>{row.endpoint}</span>
                  <span className="text-muted-foreground">
                    {row.tokens.toLocaleString()} {t("tokensSuffix")} · $
                    {Number(row.cost).toFixed(4)} ·{" "}
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
