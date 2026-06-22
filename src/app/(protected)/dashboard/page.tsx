import type { Metadata } from "next";

import { requireAuth, getSessionUserWithCompany } from "@/features/auth";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { getDashboardData } from "@/features/dashboard/lib/dashboard.repository";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const sessionData = await getSessionUserWithCompany();
  const companyId = sessionData?.session?.companyId ?? user.companyId;

  const dashboardData =
    companyId && isSupabaseConfigured() ? await getDashboardData(companyId) : null;

  return (
    <DashboardView
      fullName={sessionData?.profile?.full_name ?? null}
      role={user.role}
      data={dashboardData}
    />
  );
}
