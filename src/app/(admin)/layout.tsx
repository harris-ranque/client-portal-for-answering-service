import { requireAdmin } from "@/features/auth";
import { PortalLayout } from "@/components/layout/portal-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return <PortalLayout>{children}</PortalLayout>;
}
