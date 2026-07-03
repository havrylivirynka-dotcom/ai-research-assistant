import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { addReferenceSchema } from "@/schemas/bibliography";
import { insertReferences, listBibliography } from "@/features/bibliography/queries";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return apiError("VALIDATION_ERROR", "projectId is required.");
  }

  const { data, error } = await listBibliography(supabase, projectId);

  if (error) {
    return apiError("INTERNAL_ERROR", "Could not load bibliography.");
  }

  return apiSuccess({ bibliography: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const body = await request.json().catch(() => null);
  const parsed = addReferenceSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid reference data.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { data, error } = await insertReferences(supabase, parsed.data.projectId, [
    parsed.data.referenceText,
  ]);

  if (error || !data) {
    return apiError(
      "INTERNAL_ERROR",
      "Could not add reference. Make sure the project exists and belongs to you.",
    );
  }

  return apiSuccess({ reference: data[0] }, 201);
}
