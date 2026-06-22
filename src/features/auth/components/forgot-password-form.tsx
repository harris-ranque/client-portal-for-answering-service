"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { forgotPasswordAction, type PasswordActionState } from "@/features/auth/actions/password";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const initialState: PasswordActionState = {};

export function ForgotPasswordForm() {
  const [state, setState] = useState<PasswordActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const supabaseReady = isSupabaseConfigured();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await forgotPasswordAction(state, formData);
      setState(result);
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we will send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!supabaseReady ? (
          <p className="text-sm text-muted-foreground">Authentication is not configured.</p>
        ) : state.success ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <Button variant="outline" render={<Link href={APP_ROUTES.login} />}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field data-invalid={Boolean(state.fieldErrors?.email?.length)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(state.fieldErrors?.email?.length)}
                />
                <FieldError errors={state.fieldErrors?.email?.map((message) => ({ message }))} />
              </Field>
            </FieldGroup>

            {state.error ? (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending..." : "Send reset link"}
              </Button>
              <Button variant="ghost" render={<Link href={APP_ROUTES.login} />}>
                Back to sign in
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
