import { after, type NextRequest } from "next/server";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/api/response";
import { rateLimit } from "@/lib/rate-limit";
import {
  uploadPdfFormSchema,
  MAX_PDF_SIZE_BYTES,
  ALLOWED_PDF_MIME_TYPES,
} from "@/schemas/upload";
import { createUpload } from "@/features/uploads/queries";
import { extractPdfText } from "@/lib/pdf/extract-text";
import { isPdfMagicBytes } from "@/lib/pdf/validate";
import { analyzePdfText } from "@/lib/ai/pdf-analysis";
import { logAiUsage } from "@/lib/ai/usage";
import { AI_MODEL } from "@/lib/ai/client";
import type { Locale } from "@/i18n/locale";

async function processUpload(params: {
  uploadId: string;
  userId: string;
  bytes: Uint8Array;
  locale: Locale;
}) {
  const admin = createAdminClient();

  try {
    const extractedText = await extractPdfText(params.bytes);
    const { analysis, inputTokens, outputTokens } =
      await analyzePdfText(extractedText, params.locale);

    await logAiUsage(admin, {
      userId: params.userId,
      endpoint: "/api/uploads/pdf",
      model: AI_MODEL,
      inputTokens,
      outputTokens,
    });

    await admin
      .from("uploads")
      .update({
        extracted_text: extractedText,
        ai_analysis: analysis,
        status: "completed",
      })
      .eq("id", params.uploadId);
  } catch (err) {
    console.error("PDF analysis failed for upload", params.uploadId, err);
    await admin
      .from("uploads")
      .update({ status: "failed" })
      .eq("id", params.uploadId);
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { success } = await rateLimit("upload-pdf", user.id, 10, "1 m");
  if (!success) {
    return apiError(
      "RATE_LIMITED",
      "Too many uploads. Please wait a moment and try again.",
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return apiError("VALIDATION_ERROR", "Expected multipart/form-data.");
  }

  const parsed = uploadPdfFormSchema.safeParse({
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
  if (!(file instanceof File)) {
    return apiError("VALIDATION_ERROR", "No file was provided.");
  }
  if (!ALLOWED_PDF_MIME_TYPES.includes(file.type)) {
    return apiError("VALIDATION_ERROR", "Only PDF files are supported.");
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    return apiError("VALIDATION_ERROR", "File exceeds the 50MB size limit.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!isPdfMagicBytes(bytes)) {
    return apiError("VALIDATION_ERROR", "The file is not a valid PDF.");
  }

  const filePath = `${user.id}/${crypto.randomUUID()}.pdf`;

  const { error: storageError } = await supabase.storage
    .from("pdf")
    .upload(filePath, bytes, { contentType: file.type });

  if (storageError) {
    return apiError("INTERNAL_ERROR", "Could not upload the file.");
  }

  const { data: upload, error: dbError } = await createUpload(supabase, {
    projectId: parsed.data.projectId,
    fileName: file.name,
    filePath,
    mimeType: file.type,
    size: file.size,
  });

  if (dbError || !upload) {
    return apiError(
      "INTERNAL_ERROR",
      "Could not save the upload. Make sure the project exists and belongs to you.",
    );
  }

  const locale = await getLocale();
  after(() =>
    processUpload({ uploadId: upload.id, userId: user.id, bytes, locale }),
  );

  return apiSuccess({ uploadId: upload.id, status: upload.status }, 201);
}
