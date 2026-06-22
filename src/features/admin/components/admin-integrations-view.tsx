import { isJustCallConfigured } from "@/lib/justcall";
import { isHubSpotConfigured } from "@/lib/hubspot";
import { isStripeConfigured, isStripeWebhookConfigured } from "@/lib/stripe";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import { JustCallIntegrationPanel } from "@/features/justcall/components/justcall-integration-panel";
import { HubSpotIntegrationPanel } from "@/features/hubspot/components/hubspot-integration-panel";
import { StripeIntegrationPanel } from "@/features/stripe/components/stripe-integration-panel";
import { PageContainer, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminIntegrationsViewProps {
  companies: Array<{
    id: string;
    name: string;
    justcall_account_id: string | null;
    hubspot_company_id: string | null;
    stripe_customer_id: string | null;
    is_active: boolean;
  }>;
  justCallHistory: Awaited<
    ReturnType<typeof import("@/features/justcall/lib/sync.repository").getJustCallSyncHistory>
  >;
  hubSpotHistory: Awaited<
    ReturnType<typeof import("@/features/hubspot/lib/sync.repository").getHubSpotSyncHistory>
  >;
  stripeHistory: Awaited<
    ReturnType<typeof import("@/features/stripe/lib/sync.repository").getStripeSyncHistory>
  >;
}

export function AdminIntegrationsView({
  companies,
  justCallHistory,
  hubSpotHistory,
  stripeHistory,
}: AdminIntegrationsViewProps) {
  const supabaseReady = isSupabaseConfigured();
  const stripeReady = isStripeConfigured();
  const stripeWebhookReady = isStripeWebhookConfigured();
  const justcallReady = isJustCallConfigured();
  const hubspotReady = isHubSpotConfigured();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connection status and sync controls for external services."
      />

      <StripeIntegrationPanel
        configured={stripeReady}
        webhookReady={stripeWebhookReady}
        adminReady={isSupabaseAdminConfigured()}
        companies={companies}
        history={stripeHistory}
      />

      <JustCallIntegrationPanel
        configured={justcallReady}
        adminReady={isSupabaseAdminConfigured()}
        companies={companies}
        history={justCallHistory}
      />

      <HubSpotIntegrationPanel
        configured={hubspotReady}
        adminReady={isSupabaseAdminConfigured()}
        companies={companies}
        history={hubSpotHistory}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Supabase</CardTitle>
            <Badge variant={supabaseReady ? "default" : "secondary"}>
              {supabaseReady ? "Connected" : "Not configured"}
            </Badge>
          </div>
          <CardDescription>Database, authentication, and row-level security.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Project URL and anon key are required for all authenticated features.
        </CardContent>
      </Card>
    </PageContainer>
  );
}
