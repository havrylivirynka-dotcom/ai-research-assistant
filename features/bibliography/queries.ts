import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function listBibliography(supabase: Client, projectId: string) {
  return supabase
    .from("bibliography")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
}

export async function insertReferences(
  supabase: Client,
  projectId: string,
  referenceTexts: string[],
) {
  return supabase
    .from("bibliography")
    .insert(
      referenceTexts.map((referenceText) => ({
        project_id: projectId,
        reference_text: referenceText,
      })),
    )
    .select("*");
}

export async function deleteReference(supabase: Client, id: string) {
  return supabase
    .from("bibliography")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
}
