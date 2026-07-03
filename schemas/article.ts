import { z } from "zod";

export const saveArticleSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1),
  authors: z.array(z.string()).default([]),
  abstract: z.string().nullable().optional(),
  doi: z.string().nullable().optional(),
  journal: z.string().nullable().optional(),
  publisher: z.string().nullable().optional(),
  publicationYear: z.number().int().nullable().optional(),
  citations: z.number().int().min(0).default(0),
  url: z.string().nullable().optional(),
});

export type SaveArticleInput = z.infer<typeof saveArticleSchema>;
