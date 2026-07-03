import { z } from "zod";

export const THEME_VALUES = ["light", "dark", "system"] as const;

export const updateSettingsSchema = z.object({
  fullName: z.string().trim().min(1).max(200).optional(),
  avatarUrl: z.string().url().optional(),
  theme: z.enum(THEME_VALUES).optional(),
  language: z.string().trim().min(2).max(10).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
