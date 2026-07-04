import { z } from "zod";

// Messages here are short internal keys (translated in features/auth/actions.ts
// via the "authValidation" namespace), not user-facing text.
export const loginSchema = z.object({
  email: z.string().trim().email("emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "fullNameRequired"),
    email: z.string().trim().email("emailInvalid"),
    password: z
      .string()
      .min(8, "passwordMinLength")
      .regex(/[a-z]/, "passwordLowercase")
      .regex(/[A-Z]/, "passwordUppercase")
      .regex(/[0-9]/, "passwordNumber"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  });

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("emailInvalid"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "passwordMinLength")
      .regex(/[a-z]/, "passwordLowercase")
      .regex(/[A-Z]/, "passwordUppercase")
      .regex(/[0-9]/, "passwordNumber"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  });
