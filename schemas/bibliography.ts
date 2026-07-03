import { z } from "zod";

export const analyzeBibliographyFormSchema = z.object({
  projectId: z.string().uuid(),
});

export const addReferenceSchema = z.object({
  projectId: z.string().uuid(),
  referenceText: z.string().trim().min(10),
});

export const reanalyzeBibliographySchema = z.object({
  projectId: z.string().uuid(),
});

export const MAX_BIBLIOGRAPHY_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_BIBLIOGRAPHY_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
