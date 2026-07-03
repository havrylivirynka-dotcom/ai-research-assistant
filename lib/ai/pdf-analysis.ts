import "server-only";
import { AI_MODEL, getOpenAiClient } from "./client";
import { pdfAnalysisSchema, pdfAnalysisJsonSchema } from "./schemas";
import {
  PDF_ANALYZER_SYSTEM_PROMPT,
  buildPdfAnalyzerUserPrompt,
} from "@/prompts/pdf-analyzer";
import type { PdfAnalysis } from "./schemas";

export async function analyzePdfText(extractedText: string): Promise<{
  analysis: PdfAnalysis;
  inputTokens: number;
  outputTokens: number;
}> {
  const client = getOpenAiClient();

  const response = await client.responses.create({
    model: AI_MODEL,
    input: [
      { role: "system", content: PDF_ANALYZER_SYSTEM_PROMPT },
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
