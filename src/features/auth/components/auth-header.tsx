import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { getSessionUser } from "@/features/auth/lib/session";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function AuthHeader() {
  if (!isSupabaseConfigured()) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={APP_ROUTES.home} className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              CP
            </div>
            <span className="font-semibold tracking-tight">{clientEnv.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
          <Button size="sm" render={<Link href={APP_ROUTES.login} />}>
            Sign in
          </Button>
        </div>
      </header>
    );
  }

  const user = await getSessionUser();

  if (!user) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={APP_ROUTES.home} className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              CP
            </div>
            <span className="font-semibold tracking-tight">{clientEnv.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="#features" />}>
              Features
            </Button>
            <Button size="sm" render={<Link href={APP_ROUTES.login} />}>
              Sign in
            </Button>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={APP_ROUTES.dashboard} className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            CP
          </div>
          <span className="font-semibold tracking-tight">{clientEnv.NEXT_PUBLIC_APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-medium">{user.email}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <Button variant="outline" size="sm" render={<Link href={APP_ROUTES.dashboard} />}>
            Dashboard
          </Button>
          <LogoutButton size="sm" />
        </div>
      </div>
    </header>
  );
}
