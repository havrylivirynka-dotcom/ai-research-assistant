import "server-only";
import { AI_MODEL, getOpenAiClient } from "./client";
import { pdfAnalysisSchema, pdfAnalysisJsonSchema } from "./schemas";
import {
  getPdfAnalyzerSystemPrompt,
  buildPdfAnalyzerUserPrompt,
} from "@/prompts/pdf-analyzer";
import type { PdfAnalysis } from "./schemas";
import type { Locale } from "@/i18n/locale";

export async function analyzePdfText(
  extractedText: string,
  locale: Locale,
): Promise<{
  analysis: PdfAnalysis;
  inputTokens: number;
  outputTokens: number;
}> {
  const client = getOpenAiClient();

  const response = await client.responses.create({
    model: AI_MODEL,
    input: [
      { role: "system", content: getPdfAnalyzerSystemPrompt(locale) },
      { role: "user", content: buildPdfAnalyzerUserPrompt(extractedText) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "pdf_analysis",
        schema: pdfAnalysisJsonSchema,
        strict: true,
      },
    },
  });

  const parsed = pdfAnalysisSchema.parse(JSON.parse(response.output_text));

  return {
    analysis: parsed,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
