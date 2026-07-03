import "server-only";
import { AI_MODEL, getOpenAiClient } from "./client";
import { sourceEvaluationSchema, sourceEvaluationJsonSchema } from "./schemas";
import {
  SOURCE_EVALUATOR_SYSTEM_PROMPT,
  buildSourceEvaluatorUserPrompt,
} from "@/prompts/source-evaluator";
import type { SourceEvaluation } from "./schemas";

export type EvaluateSourceInput = {
  title: string;
  abstract?: string | null;
  journal?: string | null;
  publisher?: string | null;
  year?: number | null;
  doi?: string | null;
  citations?: number | null;
};

export async function evaluateSource(input: EvaluateSourceInput): Promise<{
  evaluation: SourceEvaluation;
  inputTokens: number;
  outputTokens: number;
}> {
  const client = getOpenAiClient();

  const response = await client.responses.create({
    model: AI_MODEL,
    input: [
      { role: "system", content: SOURCE_EVALUATOR_SYSTEM_PROMPT },
      { role: "user", content: buildSourceEvaluatorUserPrompt(input) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "source_evaluation",
        schema: sourceEvaluationJsonSchema,
        strict: true,
      },
    },
  });

  const parsed = sourceEvaluationSchema.parse(JSON.parse(response.output_text));

  return {
    evaluation: parsed,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
