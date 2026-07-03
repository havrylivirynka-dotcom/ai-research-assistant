import { z } from "zod";

export const generateStructureSchema = z.object({
  topic: z.string().trim().min(3).max(300),
});

export type GenerateStructureInput = z.infer<typeof generateStructureSchema>;
