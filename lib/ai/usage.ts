import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Approximate USD cost per 1M tokens. Used only to give users a rough sense
 * of spend on the usage dashboard — not a substitute for the provider's
 * actual billing. Update alongside OPENAI_MODEL / OPENAI_EMBEDDING_MODEL.
 */
const PRICE_PER_MILLION_TOKENS: Record<string, { input: number; output: number }> = {
  "gpt-5.1": { input: 2.5, output: 10 },
  "text-embedding-3-large": { input: 0.13, output: 0 },
};

const DEFAULT_PRICE = { input: 2.5, output: 10 };

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const price = PRICE_PER_MILLION_TOKENS[model] ?? DEFAULT_PRICE;
  return (
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  );
}

export async function logAiUsage(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    endpoint: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
  },
) {
  const cost = estimateCost(
    params.model,
    params.inputTokens,
    params.outputTokens,
  );

  await supabase.from("api_usage").insert({
    user_id: params.userId,
    endpoint: params.endpoint,
    tokens: params.inputTokens + params.outputTokens,
    cost,
  });
}
