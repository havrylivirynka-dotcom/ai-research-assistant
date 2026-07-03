import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { rateLimit } from "@/lib/rate-limit";
import { sendMessageSchema } from "@/schemas/chat";
import {
  createChat,
  createMessage,
  getChat,
  listChats,
  listMessages,
} from "@/features/chat/queries";
import { retrieveRelevantChunks, formatRetrievedContext } from "@/lib/ai/rag";
import { RESEARCH_ASSISTANT_SYSTEM_PROMPT } from "@/prompts/research-assistant";
import { MAN_EXPERT_SYSTEM_PROMPT, buildRagUserPrompt } from "@/prompts/man-expert";
import { AI_MODEL, AiNotConfiguredError, getOpenAiClient } from "@/lib/ai/client";
import { logAiUsage } from "@/lib/ai/usage";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const projectId = request.nextUrl.searchParams.get("projectId");
  const chatId = request.nextUrl.searchParams.get("chatId");

  if (chatId) {
    const { data: messages, error } = await listMessages(supabase, chatId);
    if (error) return apiError("NOT_FOUND", "Chat not found.");
    return apiSuccess({ messages });
  }

  if (!projectId) {
    return apiError("VALIDATION_ERROR", "projectId or chatId is required.");
  }

  const { data: chats, error } = await listChats(supabase, projectId);
  if (error) return apiError("INTERNAL_ERROR", "Could not load chats.");
  return apiSuccess({ chats });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { success } = await rateLimit("chat", user.id, 20, "1 m");
  if (!success) {
    return apiError(
      "RATE_LIMITED",
      "Too many messages. Please wait a moment and try again.",
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid message.",
      parsed.error.flatten().fieldErrors,
    );
  }

  let client;
  try {
    client = getOpenAiClient();
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiError("INTERNAL_ERROR", error.message);
    }
    throw error;
  }

  const { projectId, message } = parsed.data;
  let chatId = parsed.data.chatId;

  if (!chatId) {
    const { data: chat, error } = await createChat(
      supabase,
      projectId,
      parsed.data.mode,
      message.slice(0, 80),
    );
    if (error || !chat) {
      return apiError(
        "INTERNAL_ERROR",
        "Could not start a chat. Make sure the project exists and belongs to you.",
      );
    }
    chatId = chat.id;
  }

  const { data: chat } = await getChat(supabase, chatId);
  if (!chat) {
    return apiError("NOT_FOUND", "Chat not found.");
  }

  const { data: history } = await listMessages(supabase, chatId);
  await createMessage(supabase, { chatId, role: "user", content: message });

  const retrievedChunks = await retrieveRelevantChunks(supabase, message);
  const context = formatRetrievedContext(retrievedChunks);

  const systemPrompt =
    chat.mode === "man_expert"
      ? MAN_EXPERT_SYSTEM_PROMPT
      : RESEARCH_ASSISTANT_SYSTEM_PROMPT;

  const conversationInput = [
    { role: "system" as const, content: systemPrompt },
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    {
      role: "user" as const,
      content: buildRagUserPrompt(context, message),
    },
  ];

  const encoder = new TextEncoder();
  const citations = retrievedChunks.map((chunk) => ({
    documentTitle: chunk.documentTitle,
    sectionRef: chunk.sectionRef,
  }));

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: object) {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      }

      let fullText = "";
      let inputTokens = 0;
      let outputTokens = 0;

      try {
        const responseStream = await client.responses.create({
          model: AI_MODEL,
          input: conversationInput,
          stream: true,
        });

        for await (const event of responseStream) {
          if (event.type === "response.output_text.delta") {
            fullText += event.delta;
            send({ type: "delta", text: event.delta });
          } else if (event.type === "response.completed") {
            inputTokens = event.response.usage?.input_tokens ?? 0;
            outputTokens = event.response.usage?.output_tokens ?? 0;
          }
        }

        const { data: assistantMessage } = await createMessage(supabase, {
          chatId: chatId!,
          role: "assistant",
          content: fullText,
          citations,
          tokens: inputTokens + outputTokens,
        });

        await logAiUsage(supabase, {
          userId: user.id,
          endpoint: "/api/chat",
          model: AI_MODEL,
          inputTokens,
          outputTokens,
        });

        send({
          type: "done",
          chatId,
          messageId: assistantMessage?.id,
          citations,
        });
      } catch (error) {
        console.error("Chat streaming failed", error);
        send({ type: "error", message: "The AI response failed." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Chat-Id": chatId,
    },
  });
}
