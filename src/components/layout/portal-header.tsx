"use client";

import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ADMIN_NAV_ITEMS, CLIENT_NAV_ITEMS, isNavItemActive } from "@/lib/constants/navigation";
import { APP_ROUTES } from "@/lib/constants";
import type { UserRole } from "@/types";

interface PortalHeaderProps {
  email: string;
  fullName: string | null;
  role: UserRole;
}

function getPageTitle(pathname: string, role: UserRole) {
  const allItems = role === "admin" ? [...CLIENT_NAV_ITEMS, ...ADMIN_NAV_ITEMS] : CLIENT_NAV_ITEMS;
  const match = allItems
    .filter((item) => isNavItemActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return match?.title ?? "Portal";
}

export function PortalHeader({ email, fullName, role }: PortalHeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname, role);
  const isAdminArea = pathname.startsWith(APP_ROUTES.admin.root);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium">{title}</p>
        {isAdminArea ? (
          <p className="truncate text-xs text-muted-foreground">Administration</p>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu email={email} fullName={fullName} role={role} />
      </div>
    </header>
  );
}
