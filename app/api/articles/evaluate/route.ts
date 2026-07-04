import type { NextRequest } from "next/server";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { rateLimit } from "@/lib/rate-limit";
import { evaluateArticleSchema } from "@/schemas/evaluate";
import { evaluateSource } from "@/lib/ai/source-evaluation";
import { logAiUsage } from "@/lib/ai/usage";
import { AI_MODEL, AiNotConfiguredError } from "@/lib/ai/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { success } = await rateLimit("ai-evaluate", user.id, 15, "1 m");
  if (!success) {
    return apiError(
      "RATE_LIMITED",
      "Too many evaluation requests. Please wait a moment and try again.",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = evaluateArticleSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid article data.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const locale = await getLocale();
    const { evaluation, inputTokens, outputTokens } = await evaluateSource(
      parsed.data,
      locale,
    );

    await logAiUsage(supabase, {
      userId: user.id,
      endpoint: "/api/articles/evaluate",
      model: AI_MODEL,
      inputTokens,
      outputTokens,
    });

    if (parsed.data.articleId) {
      await supabase
        .from("saved_articles")
        .update({
          ai_score: evaluation.overallScore,
          ai_summary: evaluation.explanation,
          ai_evaluation: evaluation,
        })
        .eq("id", parsed.data.articleId);
    }

    return apiSuccess(evaluation);
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiError("INTERNAL_ERROR", error.message);
    }
    return apiError(
      "INTERNAL_ERROR",
      "Could not evaluate this source. Please try again.",
    );
  }
}
