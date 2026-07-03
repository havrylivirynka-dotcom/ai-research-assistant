"use server";

import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { LOCALE_COOKIE, isLocale, type Locale } from "./locale";

/** Sets the interface language: cookie for everyone, `user_settings.language` too when signed in. */
export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("user_settings")
      .update({ language: locale })
      .eq("user_id", user.id);
  }
}

/**
 * Right after a brand-new account is created, carries whatever language the
 * visitor was already browsing in (from the cookie) into their new
 * `user_settings` row, instead of leaving it at the table's default.
 */
export async function persistCurrentLocaleForNewUser(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (!isLocale(cookieLocale)) return;

  await supabase
    .from("user_settings")
    .update({ language: cookieLocale })
    .eq("user_id", userId);
}

/**
 * Makes the browser's active language follow the account's saved preference
 * right after sign-in, so a returning user on a new device/browser doesn't
 * see the wrong language until they visit Settings.
 */
export async function syncLocaleFromSettings(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data } = await supabase
    .from("user_settings")
    .select("language")
    .eq("user_id", userId)
    .single();

  if (isLocale(data?.language)) {
    const cookieStore = await cookies();
    cookieStore.set(LOCALE_COOKIE, data.language, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
}
