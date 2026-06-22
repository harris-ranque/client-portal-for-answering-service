import { AuthHeader } from "@/features/auth/components/auth-header";
import { LandingPage } from "@/features/marketing/components/landing-page";
import { getSessionUser } from "@/features/auth/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function Home() {
  const user = isSupabaseConfigured() ? await getSessionUser() : null;

  return (
    <div className="min-h-full flex flex-col">
      <AuthHeader />
      <main className="flex-1">
        <LandingPage user={user} />
      </main>
    </div>
  );
}
