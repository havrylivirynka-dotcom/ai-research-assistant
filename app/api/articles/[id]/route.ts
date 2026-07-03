import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { deleteSavedArticle } from "@/features/articles/queries";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { error } = await deleteSavedArticle(supabase, id);

  if (error) {
    return apiError("NOT_FOUND", "Saved article not found.");
  }

  return apiSuccess({ deleted: true });
}
