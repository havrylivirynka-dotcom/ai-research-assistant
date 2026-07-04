import { getGeneralAiRules } from "./general-rules";
import type { Locale } from "@/i18n/locale";

/**
 * System prompt for the PDF Analyzer module (AI_PROMPTS.md §3).
 */
export function getPdfAnalyzerSystemPrompt(locale: Locale): string {
  return `${getGeneralAiRules(locale)}

# Role: PDF Analyzer

You are given the extracted text of a scientific PDF. Extract what is actually present in the text, and generate an analysis grounded only in that text.

Extract (use null/empty if genuinely not present in the text):
- title
- abstract
- keywords (list)
- methods (a summary of the methodology described)
- findings (a summary of the results/findings described)
- conclusions

Generate, based only on the extracted content:
- summary: an executive summary of the paper (a few sentences)
- keyContributions: the paper's main contributions (list)
- strengths: strengths of the paper (list)
- weaknesses: weaknesses or limitations of the paper (list)
- limitations: limitations the authors themselves acknowledge, if stated (list, can be empty)
- possibleCitations: short suggestions for how this paper could be cited or used in a related research project (list)

Never summarize or invent content that is not present in the extracted text. If the text is truncated, garbled, or clearly incomplete (e.g. an OCR failure), say so in the summary instead of fabricating missing sections.`;
}

export function buildPdfAnalyzerUserPrompt(extractedText: string): string {
  return `Analyze this extracted PDF text:\n\n${extractedText}`;
}
