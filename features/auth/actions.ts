"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  syncLocaleFromSettings,
  persistCurrentLocaleForNewUser,
} from "@/i18n/actions";
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
} from "@/schemas/auth";
import type { ActionState } from "./types";

const AUTH_VALIDATION_KEYS = [
  "emailInvalid",
  "passwordRequired",
  "fullNameRequired",
  "passwordMinLength",
  "passwordLowercase",
  "passwordUppercase",
  "passwordNumber",
  "passwordsDoNotMatch",
] as const;
type AuthValidationKey = (typeof AUTH_VALIDATION_KEYS)[number];

function isAuthValidationKey(key: string): key is AuthValidationKey {
  return (AUTH_VALIDATION_KEYS as readonly string[]).includes(key);
}

/** Zod stores short keys (e.g. "emailInvalid") as messages; translate them here. */
function translateFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
  t: Awaited<ReturnType<typeof getTranslations<"authValidation">>>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value) {
      result[key] = value.map((messageKey) =>
        isAuthValidationKey(messageKey) ? t(messageKey) : messageKey,
      );
    }
  }
  return result;
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const t = await getTranslations("authValidation");
    return {
      status: "error",
      fieldErrors: translateFieldErrors(
        parsed.error.flatten().fieldErrors,
        t,
      ),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const t = await getTranslations("login");
    return { status: "error", message: t("incorrectCredentials") };
  }

  if (data.user) {
    await syncLocaleFromSettings(supabase, data.user.id);
  }

  const nextPath = formData.get("next");
  redirect(typeof nextPath === "string" && nextPath ? nextPath : "/dashboard");
}

export async function register(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const t = await getTranslations("authValidation");
    return {
      status: "error",
      fieldErrors: translateFieldErrors(
        parsed.error.flatten().fieldErrors,
        t,
      ),
    };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    console.error("signUp failed", error.code, error.status, error.message);
    const t = await getTranslations("register");
    return {
      status: "error",
      message:
        error.code === "user_already_exists"
          ? t("accountExists")
          : t("genericError"),
    };
  }

  if (data.user) {
    await persistCurrentLocaleForNewUser(supabase, data.user.id);
  }

  // When email confirmations are disabled (e.g. local dev), signUp already
  // returns an active session, so there is no inbox to check.
  if (data.session) {
    redirect("/dashboard");
  }

  const t = await getTranslations("register");
  return {
    status: "success",
    message: t("checkInboxMessage"),
  };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_failed");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const t = await getTranslations("authValidation");
    return {
      status: "error",
      fieldErrors: translateFieldErrors(
        parsed.error.flatten().fieldErrors,
        t,
      ),
    };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  const t = await getTranslations("resetPassword");
  // Always return the same message, regardless of whether the account
  // exists, so this endpoint can't be used to enumerate registered emails.
  return {
    status: "success",
    message: t("successMessage"),
  };
}

export async function updatePassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const t = await getTranslations("authValidation");
    return {
      status: "error",
      fieldErrors: translateFieldErrors(
        parsed.error.flatten().fieldErrors,
        t,
      ),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    const t = await getTranslations("updatePassword");
    return {
      status: "error",
      message: t("genericError"),
    };
  }

  redirect("/dashboard");
}
