import type { Metadata } from "next";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Usage</h1>
        <p className="text-muted-foreground">
          Token usage, requests and estimated cost across every AI feature.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total requests
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
              Total tokens
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
              Estimated cost
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
          <CardTitle className="text-base">Usage by feature</CardTitle>
        </CardHeader>
        <CardContent>
          <EndpointBreakdown breakdown={endpointBreakdown} />
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
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
                    {row.tokens.toLocaleString()} tokens · $
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
