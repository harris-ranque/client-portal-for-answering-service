import { redirect } from "next/navigation";

import { getSessionUserWithCompany } from "@/features/auth";
import { PortalShell } from "@/components/layout/portal-shell";
import { APP_ROUTES } from "@/lib/constants";

interface PortalLayoutProps {
  children: React.ReactNode;
}

export async function PortalLayout({ children }: PortalLayoutProps) {
  const sessionData = await getSessionUserWithCompany();

  if (!sessionData?.session) {
    redirect(APP_ROUTES.login);
  }

  return (
    <PortalShell
      email={sessionData.session.email}
      fullName={sessionData.profile?.full_name ?? null}
      role={sessionData.session.role}
      companyName={sessionData.company?.name ?? null}
    >
      {children}
    </PortalShell>
  );
}
