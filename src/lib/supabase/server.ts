import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

function createSupabaseServerClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  options?: { allowCookieWrites?: boolean },
) {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        if (!options?.allowCookieWrites) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              cookieStore.set(name, value, cookieOptions);
            });
          } catch {
            // Server Components cannot always mutate cookies. Middleware handles refresh.
          }
          return;
        }

        cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
          cookieStore.set(name, value, cookieOptions);
        });
      },
    },
  });
}

export const createClient = cache(async () => {
  const cookieStore = await cookies();
  return createSupabaseServerClient(cookieStore);
});

/** Use in Server Actions that must persist auth cookies (e.g. sign-in). */
export async function createServerActionClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(cookieStore, { allowCookieWrites: true });
}

export { createClient as createServerClient };
