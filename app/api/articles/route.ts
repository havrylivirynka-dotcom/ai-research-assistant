import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { saveArticleSchema } from "@/schemas/article";
import { listSavedArticles, saveArticle } from "@/features/articles/queries";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
  const { data, error } = await listSavedArticles(supabase, projectId);

  if (error) {
    return apiError("INTERNAL_ERROR", "Could not load saved articles.");
  }

  return apiSuccess({ articles: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const body = await request.json().catch(() => null);
  const parsed = saveArticleSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid article data.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { data, error } = await saveArticle(supabase, parsed.data);

  if (error) {
    return apiError(
      "INTERNAL_ERROR",
      "Could not save article. Make sure the project exists and belongs to you.",
    );
  }

  return apiSuccess({ article: data }, 201);
}
