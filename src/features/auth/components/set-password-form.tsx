"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setPasswordAction, type PasswordActionState } from "@/features/auth/actions/password";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { APP_ROUTES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const initialState: PasswordActionState = {};

interface SetPasswordFormProps {
  title: string;
  description: string;
  submitLabel: string;
  redirectTo?: string;
}

export function SetPasswordForm({
  title,
  description,
  submitLabel,
  redirectTo,
}: SetPasswordFormProps) {
  const router = useRouter();
  const [state, setState] = useState<PasswordActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const supabaseReady = isSupabaseConfigured();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await setPasswordAction(state, formData);
      setState(result);

      if (result.redirectTo) {
        router.replace(result.redirectTo);
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!supabaseReady ? (
          <p className="text-sm text-muted-foreground">Authentication is not configured.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

            <FieldGroup>
              <Field data-invalid={Boolean(state.fieldErrors?.password?.length)}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(state.fieldErrors?.password?.length)}
                />
                <FieldError
                  errors={state.fieldErrors?.password?.map((message) => ({ message }))}
                />
              </Field>

              <Field data-invalid={Boolean(state.fieldErrors?.confirmPassword?.length)}>
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(state.fieldErrors?.confirmPassword?.length)}
                />
                <FieldError
                  errors={state.fieldErrors?.confirmPassword?.map((message) => ({ message }))}
                />
              </Field>
            </FieldGroup>

            {state.error ? (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Saving..." : submitLabel}
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
