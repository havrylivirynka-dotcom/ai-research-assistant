import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const RECENT_LIMIT = 5;

export async function getRecentProjects(supabase: Client) {
  return supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(RECENT_LIMIT);
}

export async function getRecentSavedArticles(supabase: Client) {
  return supabase
    .from("saved_articles")
    .select("id, title, journal, ai_score, created_at, projects(id, title)")
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT);
}

export async function getRecentSearches(supabase: Client) {
  return supabase
    .from("search_history")
    .select("id, query, created_at")
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT);
}

export async function getRecentUploads(supabase: Client) {
  return supabase
    .from("uploads")
    .select("id, file_name, status, uploaded_at, projects(id, title)")
    .order("uploaded_at", { ascending: false })
    .limit(RECENT_LIMIT);
}

export async function getUsageSummary(supabase: Client) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("api_usage")
    .select("tokens, cost")
    .gte("created_at", startOfMonth.toISOString());

  if (error || !data) {
    return { requests: 0, tokens: 0, cost: 0 };
  }

  return {
    requests: data.length,
    tokens: data.reduce((sum, row) => sum + row.tokens, 0),
    cost: data.reduce((sum, row) => sum + Number(row.cost), 0),
  };
}
