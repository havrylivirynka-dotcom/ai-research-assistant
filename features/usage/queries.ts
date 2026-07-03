import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function listUsage(supabase: Client, limit = 200) {
  return supabase
    .from("api_usage")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
}

export function summarizeUsage(
  rows: { endpoint: string; tokens: number; cost: number; created_at: string }[],
) {
  const totalRequests = rows.length;
  const totalTokens = rows.reduce((sum, r) => sum + r.tokens, 0);
  const totalCost = rows.reduce((sum, r) => sum + Number(r.cost), 0);

  const byEndpoint = new Map<string, { requests: number; tokens: number; cost: number }>();
  for (const row of rows) {
    const existing = byEndpoint.get(row.endpoint) ?? {
      requests: 0,
      tokens: 0,
      cost: 0,
    };
    existing.requests += 1;
    existing.tokens += row.tokens;
    existing.cost += Number(row.cost);
    byEndpoint.set(row.endpoint, existing);
  }

  const endpointBreakdown = Array.from(byEndpoint.entries())
    .map(([endpoint, stats]) => ({ endpoint, ...stats }))
    .sort((a, b) => b.tokens - a.tokens);

  return { totalRequests, totalTokens, totalCost, endpointBreakdown };
}
