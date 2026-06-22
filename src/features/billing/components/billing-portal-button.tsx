"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";

import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface BillingPortalButtonProps {
  portalAvailable: boolean;
}

export function BillingPortalButton({ portalAvailable }: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post<{ url: string }>(API_ROUTES.billingPortal, {
        returnUrl: `${window.location.origin}/billing`,
      });

      window.location.assign(response.url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to open the billing portal. Please try again.";
      setError(message);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={!portalAvailable || isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : <CreditCard />}
        Manage billing
      </Button>
      {!portalAvailable ? (
        <p className="text-xs text-muted-foreground">
          Stripe Customer Portal is unavailable until billing is configured for your account.
        </p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
