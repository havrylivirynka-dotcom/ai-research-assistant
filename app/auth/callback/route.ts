import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  syncLocaleFromSettings,
  persistCurrentLocaleForNewUser,
} from "@/i18n/actions";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data.user) {
        const isNewUser =
          new Date(data.user.created_at).getTime() >
          Date.now() - 60_000;
        if (isNewUser) {
          await persistCurrentLocaleForNewUser(supabase, data.user.id);
        } else {
          await syncLocaleFromSettings(supabase, data.user.id);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
