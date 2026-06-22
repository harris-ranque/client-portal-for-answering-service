import type { Metadata } from "next";

import { SetPasswordForm } from "@/features/auth/components/set-password-form";
import { PageContainer } from "@/components/layout";
import { APP_ROUTES } from "@/lib/constants";
import { clientEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Accept invitation",
};

export default function AcceptInvitationPage() {
  return (
    <PageContainer className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-16">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome to the portal</h1>
      </div>
      <SetPasswordForm
        title="Set your password"
        description="Create a password to activate your client portal account."
        submitLabel="Activate account"
        redirectTo={APP_ROUTES.dashboard}
      />
    </PageContainer>
  );
}
