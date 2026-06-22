import { NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/features/auth/lib/routes";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants";
import { getRequestOrigin } from "@/lib/env/app-url";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"), DEFAULT_AUTH_REDIRECT);
  const origin = getRequestOrigin(request);

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
