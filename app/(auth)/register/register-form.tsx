"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { register } from "@/features/auth/actions";
import { initialActionState } from "@/features/auth/types";
import { FieldError } from "@/features/auth/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    register,
    initialActionState,
  );
  const t = useTranslations("register");

  if (state.status === "success") {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <h1 className="text-xl font-semibold">{t("checkInboxTitle")}</h1>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName">{t("fullNameLabel")}</Label>
          <Input id="fullName" name="fullName" autoComplete="name" required />
          <FieldError messages={state.fieldErrors?.fullName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError messages={state.fieldErrors?.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("passwordLabel")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldError messages={state.fieldErrors?.password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t("confirmPasswordLabel")}
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldError messages={state.fieldErrors?.confirmPassword} />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-foreground">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
