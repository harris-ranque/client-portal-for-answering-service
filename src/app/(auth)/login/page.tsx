import type { Metadata } from "next";

import { redirectIfAuthenticated } from "@/features/auth/actions/login";
import { LoginForm } from "@/features/auth/components/login-form";
import { getSafeRedirectPath } from "@/features/auth/lib/routes";
import { PageContainer } from "@/components/layout";
import { clientEnv } from "@/lib/env";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign in",
};

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticated();

  const params = await searchParams;
  const redirectTo = getSafeRedirectPath(params.redirectTo, DEFAULT_AUTH_REDIRECT);

  return (
    <PageContainer className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-16">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back</h1>
      </div>

      <LoginForm redirectTo={redirectTo} />

      {params.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          Authentication failed. Please try again.
        </p>
      ) : null}
    </PageContainer>
  );
}
