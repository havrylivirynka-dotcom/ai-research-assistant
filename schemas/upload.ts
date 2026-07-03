import { z } from "zod";

export const uploadPdfFormSchema = z.object({
  projectId: z.string().uuid(),
});

export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;
export const ALLOWED_PDF_MIME_TYPES = ["application/pdf"];
