import "server-only";
import { AI_MODEL, getOpenAiClient } from "./client";
import {
  researchStructureSchema,
  researchStructureJsonSchema,
} from "./schemas";
import {
  STRUCTURE_GENERATOR_SYSTEM_PROMPT,
  buildStructureGeneratorUserPrompt,
} from "@/prompts/structure-generator";
import type { ResearchStructure } from "./schemas";

export async function generateResearchStructure(topic: string): Promise<{
  structure: ResearchStructure;
  inputTokens: number;
  outputTokens: number;
}> {
  const client = getOpenAiClient();

  const response = await client.responses.create({
    model: AI_MODEL,
    input: [
      { role: "system", content: STRUCTURE_GENERATOR_SYSTEM_PROMPT },
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
