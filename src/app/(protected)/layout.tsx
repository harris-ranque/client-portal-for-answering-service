import { requireClient } from "@/features/auth";
import { PortalLayout } from "@/components/layout/portal-layout";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireClient();

  return <PortalLayout>{children}</PortalLayout>;
}
