import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";

type Client = SupabaseClient<Database>;
type ChatMode = Database["public"]["Tables"]["ai_chats"]["Row"]["mode"];

export async function listChats(supabase: Client, projectId: string) {
  return supabase
    .from("ai_chats")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
}

export async function getChat(supabase: Client, chatId: string) {
  return supabase.from("ai_chats").select("*").eq("id", chatId).single();
}

export async function createChat(
  supabase: Client,
  projectId: string,
  mode: ChatMode,
  title?: string,
) {
  return supabase
    .from("ai_chats")
    .insert({ project_id: projectId, mode, title: title ?? null })
    .select("*")
    .single();
}

export async function listMessages(supabase: Client, chatId: string) {
  return supabase
    .from("ai_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
}

export async function createMessage(
  supabase: Client,
  params: {
    chatId: string;
    role: "user" | "assistant" | "system";
    content: string;
    citations?: Json;
    tokens?: number;
  },
) {
  return supabase
    .from("ai_messages")
    .insert({
      chat_id: params.chatId,
      role: params.role,
      content: params.content,
      citations: params.citations ?? null,
      tokens: params.tokens ?? 0,
    })
    .select("*")
    .single();
}

export async function deleteChat(supabase: Client, chatId: string) {
  return supabase
    .from("ai_chats")
    .delete()
    .eq("id", chatId)
    .select("id")
    .single();
}
