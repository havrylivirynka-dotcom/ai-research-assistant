import type { NextRequest } from "next/server";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { rateLimit } from "@/lib/rate-limit";
import {
  analyzeBibliographyFormSchema,
  MAX_BIBLIOGRAPHY_FILE_SIZE_BYTES,
  ALLOWED_BIBLIOGRAPHY_MIME_TYPES,
} from "@/schemas/bibliography";
import { parseReferenceLines } from "@/lib/bibliography/parse-references";
import { extractPdfText } from "@/lib/pdf/extract-text";
import { extractDocxText } from "@/lib/pdf/extract-docx";
import { isPdfMagicBytes, isDocxMagicBytes } from "@/lib/pdf/validate";
import { analyzeBibliography } from "@/lib/ai/bibliography-analysis";
import { insertReferences } from "@/features/bibliography/queries";
import { applyBibliographyAnalysis } from "@/features/bibliography/apply-analysis";
import { logAiUsage } from "@/lib/ai/usage";
import { AI_MODEL, AiNotConfiguredError } from "@/lib/ai/client";

class InvalidFileError extends Error {}

async function extractRawText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    if (!isPdfMagicBytes(bytes)) {
      throw new InvalidFileError("The file is not a valid PDF.");
    }
    return extractPdfText(bytes);
  }
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    if (!isDocxMagicBytes(bytes)) {
      throw new InvalidFileError("The file is not a valid DOCX document.");
    }
    return extractDocxText(bytes);
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { success } = await rateLimit("bibliography-analyze", user.id, 10, "1 m");
  if (!success) {
    return apiError(
      "RATE_LIMITED",
      "Too many requests. Please wait a moment and try again.",
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return apiError("VALIDATION_ERROR", "Expected multipart/form-data.");
  }

  const parsed = analyzeBibliographyFormSchema.safeParse({
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid form data.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const file = formData.get("file");
  const text = formData.get("text");

  let rawText: string;

  if (file instanceof File) {
    if (!ALLOWED_BIBLIOGRAPHY_MIME_TYPES.includes(file.type)) {
      return apiError(
        "VALIDATION_ERROR",
        "Only PDF, DOCX or plain text files are supported.",
      );
    }
    if (file.size > MAX_BIBLIOGRAPHY_FILE_SIZE_BYTES) {
      return apiError("VALIDATION_ERROR", "File exceeds the 20MB size limit.");
    }
    try {
      rawText = await extractRawText(file);
    } catch (error) {
      if (error instanceof InvalidFileError) {
        return apiError("VALIDATION_ERROR", error.message);
      }
      throw error;
    }
  } else if (typeof text === "string" && text.trim().length > 0) {
    rawText = text;
  } else {
    return apiError("VALIDATION_ERROR", "Provide a file or pasted text.");
  }

  const references = parseReferenceLines(rawText);
  if (references.length === 0) {
    return apiError(
      "VALIDATION_ERROR",
      "No references could be found in the provided input.",
    );
  }

  const { data: rows, error: insertError } = await insertReferences(
    supabase,
    parsed.data.projectId,
    references,
  );

  if (insertError || !rows) {
    return apiError(
      "INTERNAL_ERROR",
      "Could not save references. Make sure the project exists and belongs to you.",
    );
  }

  try {
    const locale = await getLocale();
    const { analysis, inputTokens, outputTokens } =
      await analyzeBibliography(references, locale);

    await logAiUsage(supabase, {
      userId: user.id,
      endpoint: "/api/bibliography/analyze",
      model: AI_MODEL,
      inputTokens,
      outputTokens,
    });

    await applyBibliographyAnalysis(
      supabase,
      rows.map((row) => row.id),
      analysis,
    );

    return apiSuccess({ imported: rows.length, analysis });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return apiSuccess({ imported: rows.length, analysis: null });
    }
    return apiError(
      "INTERNAL_ERROR",
      "References were imported, but AI analysis failed.",
    );
  }
}
