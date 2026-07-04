import type { NextRequest } from "next/server";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { rateLimit } from "@/lib/rate-limit";
import { generateStructureSchema } from "@/schemas/structure";
import { generateResearchStructure } from "@/lib/ai/structure-generator";
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

  const { success } = await rateLimit("research-structure", user.id, 10, "1 m");
  if (!success) {
    return apiError(
      "RATE_LIMITED",
      "Too many requests. Please wait a moment and try again.",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = generateStructureSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid topic.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const locale = await getLocale();
    const { structure, inputTokens, outputTokens } =
      await generateResearchStructure(parsed.data.topic, locale);

    await logAiUsage(supabase, {
      userId: user.id,
      endpoint: "/api/research/structure",
      model: AI_MODEL,
      inputTokens,
      outputTokens,
    });

    return apiSuccess({ structure });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiError("INTERNAL_ERROR", error.message);
    }
    return apiError(
      "INTERNAL_ERROR",
      "Could not generate a structure. Please try again.",
    );
  }
}
