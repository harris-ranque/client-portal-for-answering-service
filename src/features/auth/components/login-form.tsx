"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { loginAction, type LoginActionState } from "@/features/auth/actions/login";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const initialState: LoginActionState = {};

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [state, setState] = useState<LoginActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const supabaseReady = isSupabaseConfigured();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await loginAction(state, formData);
      setState(result);

      if (result.redirectTo) {
        router.replace(result.redirectTo);
        return;
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your client portal account.</CardDescription>
      </CardHeader>
      <CardContent>
        {!supabaseReady ? (
          <p className="text-sm text-muted-foreground">
            Supabase is not configured. Add valid credentials to `.env` or start a local Supabase
            stack before signing in.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

            <FieldGroup>
              <Field data-invalid={Boolean(state.fieldErrors?.email?.length)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  aria-invalid={Boolean(state.fieldErrors?.email?.length)}
                />
                <FieldError errors={state.fieldErrors?.email?.map((message) => ({ message }))} />
              </Field>

              <Field data-invalid={Boolean(state.fieldErrors?.password?.length)}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(state.fieldErrors?.password?.length)}
                />
                <FieldError
                  errors={state.fieldErrors?.password?.map((message) => ({ message }))}
                />
              </Field>
            </FieldGroup>

            {state.error ? (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
