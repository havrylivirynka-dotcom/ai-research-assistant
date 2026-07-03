import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { listUsage, summarizeUsage } from "@/features/usage/queries";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const { data, error } = await listUsage(supabase);

  if (error) {
    return apiError("INTERNAL_ERROR", "Could not load usage.");
  }

  const summary = summarizeUsage(data ?? []);

  return apiSuccess({ ...summary, history: data });
}
