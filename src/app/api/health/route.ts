import { NextResponse } from "next/server";

import { clientEnv } from "@/lib/env";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      app: clientEnv.NEXT_PUBLIC_APP_NAME,
      timestamp: new Date().toISOString(),
      services: {
        supabase: {
          configured: isSupabaseConfigured(),
          adminConfigured: isSupabaseAdminConfigured(),
        },
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
