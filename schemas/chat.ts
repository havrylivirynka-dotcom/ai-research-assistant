import { z } from "zod";

export const CHAT_MODES = ["research_assistant", "man_expert"] as const;

export const sendMessageSchema = z.object({
  projectId: z.string().uuid(),
  chatId: z.string().uuid().nullable().optional(),
  mode: z.enum(CHAT_MODES).default("research_assistant"),
  message: z.string().trim().min(1).max(4000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
