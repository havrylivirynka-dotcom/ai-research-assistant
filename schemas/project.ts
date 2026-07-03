import { z } from "zod";

export const PROJECT_STATUSES = [
  "draft",
  "in_progress",
  "review",
  "completed",
  "archived",
] as const;

export const createProjectSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(200),
  topic: z.string().trim().max(300).optional().or(z.literal("")),
  scienceField: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const updateProjectSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  topic: z.string().trim().max(300).nullable().optional(),
  scienceField: z.string().trim().max(120).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
