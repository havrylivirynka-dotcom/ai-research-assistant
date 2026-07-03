import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { updateProjectSchema } from "@/schemas/project";
import {
  deleteProject,
  getProject,
  updateProject,
} from "@/features/projects/queries";

type RouteParams = { params: Promise<{ id: string }> };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { data, error } = await getProject(supabase, id);

  if (error || !data) {
    return apiError("NOT_FOUND", "Project not found.");
  }

  return apiSuccess({ project: data });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid project data.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { data, error } = await updateProject(supabase, id, parsed.data);

  if (error || !data) {
    return apiError("NOT_FOUND", "Project not found.");
  }

  return apiSuccess({ project: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { error } = await deleteProject(supabase, id);

  if (error) {
    return apiError("NOT_FOUND", "Project not found.");
  }

  return apiSuccess({ deleted: true });
}
