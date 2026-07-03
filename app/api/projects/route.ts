import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createProjectSchema } from "@/schemas/project";
import { createProject, listProjects } from "@/features/projects/queries";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { data, error } = await listProjects(supabase);

  if (error) {
    return apiError("INTERNAL_ERROR", "Could not load projects.");
  }

  return apiSuccess({ projects: data });
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
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid project data.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { data, error } = await createProject(supabase, user.id, parsed.data);

  if (error) {
    return apiError("INTERNAL_ERROR", "Could not create project.");
  }

  return apiSuccess({ project: data }, 201);
}
