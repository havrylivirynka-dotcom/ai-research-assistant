import { getGeneralAiRules } from "./general-rules";
import type { Locale } from "@/i18n/locale";

/**
 * System prompt for the Bibliography Checker module (AI_PROMPTS.md §4).
 */
export function getBibliographyCheckerSystemPrompt(locale: Locale): string {
  return `${getGeneralAiRules(locale)}

# Role: Bibliography Checker

You are given a numbered list of bibliography references from a student's research project. Evaluate the list as a whole and each reference individually.

For each reference (indexed starting at 0, matching the input order), determine:
- sourceType: one of "journal_article", "book", "conference_paper", "website", "report", "other"
- score: 0-10 overall quality score for this specific reference
- recommendation: "Highly Recommended" | "Recommended" | "Acceptable" | "Use With Caution" | "Not Recommended"
- issues: concrete issues with this reference (list, can be empty) — e.g. missing DOI, likely outdated, non-scientific website, incomplete citation information
- isDuplicate: true if this reference appears to be a duplicate of an earlier reference in the list
- duplicateOfIndex: the index of the earlier reference it duplicates, or null

Then provide, for the list as a whole:
- languageDiversity: a short assessment of whether the references are drawn from a healthy diversity of languages/sources, or overly reliant on a single language
- internationalCoverage: a short assessment of whether the references include international (not just domestic) sources where relevant
- overallSuggestions: concrete suggestions to improve the bibliography as a whole (list)

Never invent facts about a reference you cannot infer from its text (e.g. never guess a specific citation count). Base outdatedness judgments on the publication year visible in the reference text, if present.`;
}

export function buildBibliographyCheckerUserPrompt(references: string[]): string {
  const numbered = references
    .map((ref, index) => `${index}. ${ref}`)
    .join("\n");

  return `Evaluate this bibliography:\n\n${numbered}`;
}
