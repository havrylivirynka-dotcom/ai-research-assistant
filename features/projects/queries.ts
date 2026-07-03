import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateProjectInput, UpdateProjectInput } from "@/schemas/project";

type Client = SupabaseClient<Database>;

export async function listProjects(supabase: Client) {
  return supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
}

export async function getProject(supabase: Client, id: string) {
  return supabase.from("projects").select("*").eq("id", id).single();
}

export async function createProject(
  supabase: Client,
  userId: string,
  input: CreateProjectInput,
) {
  return supabase
    .from("projects")
    .insert({
      user_id: userId,
      title: input.title,
      topic: input.topic || null,
      science_field: input.scienceField || null,
      description: input.description || null,
    })
    .select("*")
    .single();
}

export async function updateProject(
  supabase: Client,
  id: string,
  input: UpdateProjectInput,
) {
  return supabase
    .from("projects")
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.topic !== undefined && { topic: input.topic }),
      ...(input.scienceField !== undefined && {
        science_field: input.scienceField,
      }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.status !== undefined && { status: input.status }),
    })
    .eq("id", id)
    .select("*")
    .single();
}

export async function deleteProject(supabase: Client, id: string) {
  // RLS silently filters out rows the caller doesn't own, so a delete that
  // matches nothing returns success with an empty result rather than an
  // error. Selecting the deleted row back lets callers detect that case.
  return supabase.from("projects").delete().eq("id", id).select("id").single();
}
