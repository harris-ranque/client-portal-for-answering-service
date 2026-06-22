import type { Metadata } from "next";

import { redirectIfAuthenticated } from "@/features/auth/actions/login";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { PageContainer } from "@/components/layout";
import { clientEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return (
    <PageContainer className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-16">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reset your password</h1>
      </div>
      <ForgotPasswordForm />
    </PageContainer>
  );
}
