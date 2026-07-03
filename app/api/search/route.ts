import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { rateLimit } from "@/lib/rate-limit";
import { searchRequestSchema } from "@/schemas/search";
import { searchAllProviders } from "@/lib/search-providers";

const PAGE_SIZE = 20;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const identifier =
    user?.id ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await rateLimit("search", identifier, 30, "1 m");

  if (!success) {
    return apiError(
      "RATE_LIMITED",
      "Too many searches. Please wait a moment and try again.",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = searchRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid search request.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const filters = { ...parsed.data, pageSize: PAGE_SIZE };
  const { articles, providerOutcomes } = await searchAllProviders(filters);

  if (user) {
    await supabase.from("search_history").insert({
      user_id: user.id,
      query: filters.query,
      filters: {
        yearFrom: filters.yearFrom ?? null,
        yearTo: filters.yearTo ?? null,
        openAccess: filters.openAccess ?? null,
        language: filters.language ?? null,
        minCitations: filters.minCitations ?? null,
      },
    });
  }

  return apiSuccess({
    results: articles,
    total: articles.length,
    page: filters.page,
    pageSize: PAGE_SIZE,
    providers: providerOutcomes,
  });
}
