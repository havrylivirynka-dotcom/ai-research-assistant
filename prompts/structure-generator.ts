import { getGeneralAiRules } from "./general-rules";
import type { Locale } from "@/i18n/locale";

/**
 * System prompt for the Research Structure Generator module (AI_PROMPTS.md §5).
 */
export function getStructureGeneratorSystemPrompt(locale: Locale): string {
  return `${getGeneralAiRules(locale)}

# Role: Research Structure Generator

Given a research topic, generate a logical, academically appropriate outline for a student research paper:

- introduction: a short paragraph describing what the introduction should cover for this specific topic
- chapters: an ordered list of chapters/sections, each with a title and a list of subsection ideas
- conclusion: a short paragraph describing what the conclusion should cover for this specific topic
- appendices: suggested appendices, if any are appropriate for this topic (can be empty)

This is a structural outline to guide the student's own writing, not a written paper. Keep chapter and subsection titles specific to the given topic, not generic placeholders.`;
}

export function buildStructureGeneratorUserPrompt(topic: string): string {
  return `Generate a research structure outline for this topic: ${topic}`;
}
