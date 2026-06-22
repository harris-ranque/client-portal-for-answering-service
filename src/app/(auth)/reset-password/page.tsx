import type { Metadata } from "next";

import { SetPasswordForm } from "@/features/auth/components/set-password-form";
import { PageContainer } from "@/components/layout";
import { clientEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <PageContainer className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-16">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose a new password</h1>
      </div>
      <SetPasswordForm
        title="Reset password"
        description="Enter a new password for your account."
        submitLabel="Update password"
      />
    </PageContainer>
  );
}
