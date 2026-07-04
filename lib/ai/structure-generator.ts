import "server-only";
import { AI_MODEL, getOpenAiClient } from "./client";
import {
  researchStructureSchema,
  researchStructureJsonSchema,
} from "./schemas";
import {
  getStructureGeneratorSystemPrompt,
  buildStructureGeneratorUserPrompt,
} from "@/prompts/structure-generator";
import type { ResearchStructure } from "./schemas";
import type { Locale } from "@/i18n/locale";

export async function generateResearchStructure(
  topic: string,
  locale: Locale,
): Promise<{
  structure: ResearchStructure;
  inputTokens: number;
  outputTokens: number;
}> {
  const client = getOpenAiClient();

  const response = await client.responses.create({
    model: AI_MODEL,
    input: [
      { role: "system", content: getStructureGeneratorSystemPrompt(locale) },
      { role: "user", content: buildStructureGeneratorUserPrompt(topic) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "research_structure",
        schema: researchStructureJsonSchema,
        strict: true,
      },
    },
  });

  const parsed = researchStructureSchema.parse(
    JSON.parse(response.output_text),
  );

  return {
    structure: parsed,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
