import { describe, expect, it } from "vitest";

import { getNavItemsForPath } from "@/lib/constants/navigation";
import { APP_ROUTES } from "@/lib/constants";

describe("navigation helpers", () => {
  it("returns admin nav items on admin routes for system admins", () => {
    const items = getNavItemsForPath(APP_ROUTES.admin.clients, "admin");

    expect(items.some((item) => item.href === APP_ROUTES.admin.clients)).toBe(true);
    expect(items.some((item) => item.href === APP_ROUTES.dashboard)).toBe(false);
  });

  it("returns client nav items on client routes", () => {
    const items = getNavItemsForPath(APP_ROUTES.dashboard, "client");

    expect(items.some((item) => item.href === APP_ROUTES.dashboard)).toBe(true);
    expect(items.some((item) => item.href === APP_ROUTES.admin.root)).toBe(false);
  });
});
