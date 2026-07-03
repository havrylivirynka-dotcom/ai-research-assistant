import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { rateLimit } from "@/lib/rate-limit";
import { reanalyzeBibliographySchema } from "@/schemas/bibliography";
import { listBibliography } from "@/features/bibliography/queries";
import { applyBibliographyAnalysis } from "@/features/bibliography/apply-analysis";
import { analyzeBibliography } from "@/lib/ai/bibliography-analysis";
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

  const { success } = await rateLimit("bibliography-analyze", user.id, 10, "1 m");
  if (!success) {
    return apiError(
      "RATE_LIMITED",
      "Too many requests. Please wait a moment and try again.",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = reanalyzeBibliographySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid request.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { data: rows, error } = await listBibliography(
    supabase,
    parsed.data.projectId,
  );

  if (error || !rows || rows.length === 0) {
    return apiError("NOT_FOUND", "No references found for this project.");
  }

  try {
    const { analysis, inputTokens, outputTokens } = await analyzeBibliography(
      rows.map((row) => row.reference_text),
    );

    await logAiUsage(supabase, {
      userId: user.id,
      endpoint: "/api/bibliography/reanalyze",
      model: AI_MODEL,
      inputTokens,
      outputTokens,
    });

    await applyBibliographyAnalysis(
      supabase,
      rows.map((row) => row.id),
      analysis,
    );

    return apiSuccess({ analysis });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiError("INTERNAL_ERROR", error.message);
    }
    return apiError("INTERNAL_ERROR", "Could not analyze the bibliography.");
  }
}
