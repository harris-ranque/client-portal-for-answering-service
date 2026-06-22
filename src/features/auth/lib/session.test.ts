import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/auth", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/database/session.repository", () => ({
  getSessionProfile: vi.fn(),
  isUserProfileInactive: vi.fn(),
  mapAuthMetadataToSessionUser: vi.fn(),
  mapProfileToSessionUser: vi.fn(),
}));

import { getAuthUser } from "@/lib/supabase/auth";
import {
  getSessionProfile,
  isUserProfileInactive,
  mapAuthMetadataToSessionUser,
  mapProfileToSessionUser,
} from "@/lib/database/session.repository";

import { getSessionUser } from "@/features/auth/lib/session";

const authUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "client@acme.example.com",
  app_metadata: { role: "client", company_id: "22222222-2222-2222-2222-222222222222" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSessionUser", () => {
  it("returns null when the user profile is inactive", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(authUser as never);
    vi.mocked(isUserProfileInactive).mockResolvedValue(true);

    const session = await getSessionUser();

    expect(session).toBeNull();
    expect(getSessionProfile).not.toHaveBeenCalled();
    expect(mapAuthMetadataToSessionUser).not.toHaveBeenCalled();
  });

  it("loads the profile when the user is active", async () => {
    const sessionUser = {
      id: authUser.id,
      email: authUser.email,
      role: "client" as const,
      companyId: "22222222-2222-2222-2222-222222222222",
    };

    vi.mocked(getAuthUser).mockResolvedValue(authUser as never);
    vi.mocked(isUserProfileInactive).mockResolvedValue(false);
    vi.mocked(getSessionProfile).mockResolvedValue({
      user: {
        id: authUser.id,
        email: authUser.email,
        role: "client",
        is_active: true,
        full_name: "Client",
        created_at: "",
        updated_at: "",
      },
      companyId: sessionUser.companyId,
      company: null,
    });
    vi.mocked(mapProfileToSessionUser).mockReturnValue(sessionUser);

    const session = await getSessionUser();

    expect(session).toEqual(sessionUser);
    expect(mapProfileToSessionUser).toHaveBeenCalled();
  });
});
