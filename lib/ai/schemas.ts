import { z } from "zod";

export const RECOMMENDATION_VALUES = [
  "Highly Recommended",
  "Recommended",
  "Acceptable",
  "Use With Caution",
  "Not Recommended",
] as const;

export const sourceEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(10),
  credibility: z.number().min(0).max(10),
  relevance: z.number().min(0).max(10),
  freshness: z.number().min(0).max(10),
  methodologyQuality: z.number().min(0).max(10),
  recommendation: z.enum(RECOMMENDATION_VALUES),
  explanation: z.string().min(1),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  risks: z.array(z.string()),
});

export type SourceEvaluation = z.infer<typeof sourceEvaluationSchema>;

/** JSON Schema mirror of sourceEvaluationSchema, passed to the Responses API for structured output. */
export const sourceEvaluationJsonSchema = {
  type: "object",
  properties: {
    overallScore: { type: "number" },
    credibility: { type: "number" },
    relevance: { type: "number" },
    freshness: { type: "number" },
    methodologyQuality: { type: "number" },
    recommendation: { type: "string", enum: RECOMMENDATION_VALUES },
    explanation: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
  },
  required: [
    "overallScore",
    "credibility",
    "relevance",
    "freshness",
    "methodologyQuality",
    "recommendation",
    "explanation",
    "strengths",
    "weaknesses",
    "risks",
  ],
  additionalProperties: false,
} as const;

export const pdfAnalysisSchema = z.object({
  title: z.string().nullable(),
  abstract: z.string().nullable(),
  keywords: z.array(z.string()),
  methods: z.string().nullable(),
  findings: z.string().nullable(),
  conclusions: z.string().nullable(),
  summary: z.string().min(1),
  keyContributions: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  limitations: z.array(z.string()),
  possibleCitations: z.array(z.string()),
});

export type PdfAnalysis = z.infer<typeof pdfAnalysisSchema>;

/** JSON Schema mirror of pdfAnalysisSchema, passed to the Responses API for structured output. */
export const pdfAnalysisJsonSchema = {
  type: "object",
  properties: {
    title: { type: ["string", "null"] },
    abstract: { type: ["string", "null"] },
    keywords: { type: "array", items: { type: "string" } },
    methods: { type: ["string", "null"] },
    findings: { type: ["string", "null"] },
    conclusions: { type: ["string", "null"] },
    summary: { type: "string" },
    keyContributions: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    limitations: { type: "array", items: { type: "string" } },
    possibleCitations: { type: "array", items: { type: "string" } },
  },
  required: [
    "title",
    "abstract",
    "keywords",
    "methods",
    "findings",
    "conclusions",
    "summary",
    "keyContributions",
    "strengths",
    "weaknesses",
    "limitations",
    "possibleCitations",
  ],
  additionalProperties: false,
} as const;

export const SOURCE_TYPE_VALUES = [
  "journal_article",
  "book",
  "conference_paper",
  "website",
  "report",
  "other",
] as const;

export const referenceAnalysisSchema = z.object({
  index: z.number().int().min(0),
  sourceType: z.enum(SOURCE_TYPE_VALUES),
  score: z.number().min(0).max(10),
  recommendation: z.enum(RECOMMENDATION_VALUES),
  issues: z.array(z.string()),
  isDuplicate: z.boolean(),
  duplicateOfIndex: z.number().int().min(0).nullable(),
});

export const bibliographyAnalysisSchema = z.object({
  references: z.array(referenceAnalysisSchema),
  languageDiversity: z.string(),
  internationalCoverage: z.string(),
  overallSuggestions: z.array(z.string()),
});

export type ReferenceAnalysis = z.infer<typeof referenceAnalysisSchema>;
export type BibliographyAnalysis = z.infer<typeof bibliographyAnalysisSchema>;

/** JSON Schema mirror of bibliographyAnalysisSchema, passed to the Responses API for structured output. */
export const bibliographyAnalysisJsonSchema = {
  type: "object",
  properties: {
    references: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "number" },
          sourceType: { type: "string", enum: SOURCE_TYPE_VALUES },
          score: { type: "number" },
          recommendation: { type: "string", enum: RECOMMENDATION_VALUES },
          issues: { type: "array", items: { type: "string" } },
          isDuplicate: { type: "boolean" },
          duplicateOfIndex: { type: ["number", "null"] },
        },
        required: [
          "index",
          "sourceType",
          "score",
          "recommendation",
          "issues",
          "isDuplicate",
          "duplicateOfIndex",
        ],
        additionalProperties: false,
      },
    },
    languageDiversity: { type: "string" },
    internationalCoverage: { type: "string" },
    overallSuggestions: { type: "array", items: { type: "string" } },
  },
  required: [
    "references",
    "languageDiversity",
    "internationalCoverage",
    "overallSuggestions",
  ],
  additionalProperties: false,
} as const;

export const structureChapterSchema = z.object({
  title: z.string().min(1),
  subsections: z.array(z.string()),
});

export const researchStructureSchema = z.object({
  introduction: z.string().min(1),
  chapters: z.array(structureChapterSchema),
  conclusion: z.string().min(1),
  appendices: z.array(z.string()),
});

export type ResearchStructure = z.infer<typeof researchStructureSchema>;

/** JSON Schema mirror of researchStructureSchema, passed to the Responses API for structured output. */
export const researchStructureJsonSchema = {
  type: "object",
  properties: {
    introduction: { type: "string" },
    chapters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          subsections: { type: "array", items: { type: "string" } },
        },
        required: ["title", "subsections"],
        additionalProperties: false,
      },
    },
    conclusion: { type: "string" },
    appendices: { type: "array", items: { type: "string" } },
  },
  required: ["introduction", "chapters", "conclusion", "appendices"],
  additionalProperties: false,
} as const;
