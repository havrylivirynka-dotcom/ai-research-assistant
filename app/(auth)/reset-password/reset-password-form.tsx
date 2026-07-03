"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/features/auth/actions";
import { initialActionState } from "@/features/auth/types";
import { FieldError } from "@/features/auth/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialActionState,
  );

  if (state.status === "success") {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </span>
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you a link to reset it.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError messages={state.fieldErrors?.email} />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending link..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
