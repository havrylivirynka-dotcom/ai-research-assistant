import "server-only";
import { AI_MODEL, getOpenAiClient } from "./client";
import {
  bibliographyAnalysisSchema,
  bibliographyAnalysisJsonSchema,
} from "./schemas";
import {
  BIBLIOGRAPHY_CHECKER_SYSTEM_PROMPT,
  buildBibliographyCheckerUserPrompt,
} from "@/prompts/bibliography-checker";
import type { BibliographyAnalysis } from "./schemas";

export async function analyzeBibliography(references: string[]): Promise<{
  analysis: BibliographyAnalysis;
  inputTokens: number;
  outputTokens: number;
}> {
  const client = getOpenAiClient();

  const response = await client.responses.create({
    model: AI_MODEL,
    input: [
      { role: "system", content: BIBLIOGRAPHY_CHECKER_SYSTEM_PROMPT },
      { role: "user", content: buildBibliographyCheckerUserPrompt(references) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "bibliography_analysis",
        schema: bibliographyAnalysisJsonSchema,
        strict: true,
      },
    },
  });

  const parsed = bibliographyAnalysisSchema.parse(
    JSON.parse(response.output_text),
  );

  return {
    analysis: parsed,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
