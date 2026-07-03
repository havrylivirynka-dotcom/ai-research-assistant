import { z } from "zod";
import type { useTranslations } from "next-intl";

type Translator = ReturnType<typeof useTranslations<"authValidation">>;

export function loginSchema(t: Translator) {
  return z.object({
    email: z.string().trim().email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")),
  });
}

export function registerSchema(t: Translator) {
  return z
    .object({
      fullName: z.string().trim().min(2, t("fullNameRequired")),
      email: z.string().trim().email(t("emailInvalid")),
      password: z
        .string()
        .min(8, t("passwordMinLength"))
        .regex(/[a-z]/, t("passwordLowercase"))
        .regex(/[A-Z]/, t("passwordUppercase"))
        .regex(/[0-9]/, t("passwordNumber")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
}

export function requestPasswordResetSchema(t: Translator) {
  return z.object({
    email: z.string().trim().email(t("emailInvalid")),
  });
}

export function updatePasswordSchema(t: Translator) {
  return z
    .object({
      password: z
        .string()
        .min(8, t("passwordMinLength"))
        .regex(/[a-z]/, t("passwordLowercase"))
        .regex(/[A-Z]/, t("passwordUppercase"))
        .regex(/[0-9]/, t("passwordNumber")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
}
