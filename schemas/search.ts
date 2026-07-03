import { z } from "zod";

export const searchRequestSchema = z.object({
  query: z.string().trim().min(2, "Enter at least 2 characters"),
  yearFrom: z.coerce.number().int().min(1900).max(2100).optional(),
  yearTo: z.coerce.number().int().min(1900).max(2100).optional(),
  openAccess: z.coerce.boolean().optional(),
  language: z.string().trim().min(2).max(10).optional(),
  minCitations: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).max(20).default(1),
});

export type SearchRequestInput = z.infer<typeof searchRequestSchema>;
