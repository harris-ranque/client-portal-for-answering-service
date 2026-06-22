import { requireAuth } from "@/features/auth";
import { PortalLayout } from "@/components/layout/portal-layout";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return <PortalLayout>{children}</PortalLayout>;
}
