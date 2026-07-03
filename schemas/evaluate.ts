import { z } from "zod";

export const evaluateArticleSchema = z.object({
  articleId: z.string().uuid().optional(),
  title: z.string().trim().min(1),
  abstract: z.string().trim().nullable().optional(),
  journal: z.string().trim().nullable().optional(),
  publisher: z.string().trim().nullable().optional(),
  year: z.number().int().nullable().optional(),
  doi: z.string().trim().nullable().optional(),
  citations: z.number().int().min(0).nullable().optional(),
});

export type EvaluateArticleInput = z.infer<typeof evaluateArticleSchema>;
