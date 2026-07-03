import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function listUploads(supabase: Client, projectId?: string) {
  let query = supabase
    .from("uploads")
    .select("*, projects(id, title)")
    .order("uploaded_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  return query;
}

export async function getUpload(supabase: Client, id: string) {
  return supabase
    .from("uploads")
    .select("*, projects(id, title)")
    .eq("id", id)
    .single();
}

export async function createUpload(
  supabase: Client,
  input: {
    projectId: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    size: number;
  },
) {
  return supabase
    .from("uploads")
    .insert({
      project_id: input.projectId,
      file_name: input.fileName,
      file_path: input.filePath,
      mime_type: input.mimeType,
      size: input.size,
      status: "processing",
    })
    .select("*")
    .single();
}
