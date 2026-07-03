import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { SaveArticleInput } from "@/schemas/article";

type Client = SupabaseClient<Database>;

export async function listSavedArticles(supabase: Client, projectId?: string) {
  let query = supabase
    .from("saved_articles")
    .select("*, projects(id, title)")
    .order("created_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  return query;
}

export async function getSavedArticle(supabase: Client, id: string) {
  return supabase
    .from("saved_articles")
    .select("*, projects(id, title)")
    .eq("id", id)
    .single();
}

export async function saveArticle(supabase: Client, input: SaveArticleInput) {
  return supabase
    .from("saved_articles")
    .insert({
      project_id: input.projectId,
      title: input.title,
      authors: input.authors,
      abstract: input.abstract ?? null,
      doi: input.doi ?? null,
      journal: input.journal ?? null,
      publisher: input.publisher ?? null,
      publication_year: input.publicationYear ?? null,
      citations: input.citations,
      url: input.url ?? null,
    })
    .select("*")
    .single();
}

export async function deleteSavedArticle(supabase: Client, id: string) {
  return supabase
    .from("saved_articles")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
}
