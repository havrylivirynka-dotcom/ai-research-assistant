import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUpload } from "@/features/uploads/queries";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { data: upload, error } = await getUpload(supabase, id);

  if (error || !upload) {
    return apiError("NOT_FOUND", "Upload not found.");
  }

  return apiSuccess({ upload });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { data: upload } = await getUpload(supabase, id);
  if (!upload) {
    return apiError("NOT_FOUND", "Upload not found.");
  }

  await supabase.storage.from("pdf").remove([upload.file_path]);

  const { error } = await supabase
    .from("uploads")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return apiError("NOT_FOUND", "Upload not found.");
  }

  return apiSuccess({ deleted: true });
}
