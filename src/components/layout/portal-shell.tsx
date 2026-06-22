"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { PortalHeader } from "@/components/layout/portal-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserRole } from "@/types";

interface PortalShellProps {
  children: React.ReactNode;
  email: string;
  fullName: string | null;
  role: UserRole;
  companyName: string | null;
}

export function PortalShell({ children, email, fullName, role, companyName }: PortalShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar userRole={role} companyName={companyName} />
      <SidebarInset>
        <PortalHeader email={email} fullName={fullName} role={role} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
