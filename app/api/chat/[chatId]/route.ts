import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { deleteChat } from "@/features/chat/queries";

type RouteParams = { params: Promise<{ chatId: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { chatId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { error } = await deleteChat(supabase, chatId);

  if (error) {
    return apiError("NOT_FOUND", "Chat not found.");
  }

  return apiSuccess({ deleted: true });
}
