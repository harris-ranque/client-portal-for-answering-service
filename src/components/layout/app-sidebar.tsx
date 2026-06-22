"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getNavItemsForPath,
  isNavItemActive,
  type NavItem,
} from "@/lib/constants/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { isSystemAdmin } from "@/lib/constants/role-labels";
import { clientEnv } from "@/lib/env";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/types";

interface AppSidebarProps {
  userRole: UserRole;
  companyName: string | null;
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.title}
                  render={<Link href={item.href} />}
                >
                  <Icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ userRole, companyName }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = isSystemAdmin(userRole);
  const isAdminArea =
    pathname === APP_ROUTES.admin.root || pathname.startsWith(`${APP_ROUTES.admin.root}/`);
  const navItems = getNavItemsForPath(pathname, userRole);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <Link href={isAdmin ? APP_ROUTES.admin.root : APP_ROUTES.dashboard} />
              }
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-semibold">CP</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{clientEnv.NEXT_PUBLIC_APP_NAME}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {companyName ?? "Answering Service"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup
          label={isAdminArea ? "System Admin" : "Client Portal"}
          items={navItems}
          pathname={pathname}
        />
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1">
          <p className="truncate text-xs text-muted-foreground">
            {isAdmin
              ? "System Admin"
              : companyName
                ? `Organization: ${companyName}`
                : "No company assigned"}
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
