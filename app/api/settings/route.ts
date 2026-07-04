import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { updateSettingsSchema } from "@/schemas/settings";
import { LOCALE_COOKIE, isLocale } from "@/i18n/locale";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
  ]);

  return apiSuccess({ profile, settings });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "You must be signed in.");
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid settings.",
      parsed.error.flatten().fieldErrors,
    );
  }

  if (parsed.data.fullName !== undefined || parsed.data.avatarUrl !== undefined) {
    const { error } = await supabase
      .from("users")
      .update({
        ...(parsed.data.fullName !== undefined && {
          full_name: parsed.data.fullName,
        }),
        ...(parsed.data.avatarUrl !== undefined && {
          avatar_url: parsed.data.avatarUrl,
        }),
      })
      .eq("id", user.id);
    if (error) return apiError("INTERNAL_ERROR", "Could not update profile.");
  }

  if (parsed.data.theme !== undefined || parsed.data.language !== undefined) {
    const { error } = await supabase
      .from("user_settings")
      .update({
        ...(parsed.data.theme !== undefined && { theme: parsed.data.theme }),
        ...(parsed.data.language !== undefined && {
          language: parsed.data.language,
        }),
      })
      .eq("user_id", user.id);
    if (error) return apiError("INTERNAL_ERROR", "Could not update settings.");

    if (isLocale(parsed.data.language)) {
      const cookieStore = await cookies();
      cookieStore.set(LOCALE_COOKIE, parsed.data.language, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
  }

  return apiSuccess({ updated: true });
}
