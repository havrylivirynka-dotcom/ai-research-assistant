import "server-only";
import OpenAI from "openai";

let client: OpenAI | null = null;

export class AiNotConfiguredError extends Error {
  constructor() {
    super(
      "OPENAI_API_KEY is not configured. Add it to your environment to use AI features.",
    );
    this.name = "AiNotConfiguredError";
  }
}

export function getOpenAiClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new AiNotConfiguredError();
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-5.1";
export const AI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
