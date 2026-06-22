import { describe, expect, it } from "vitest";

import {
  BillingInvoiceLink,
  BillingPlanCard,
} from "@/features/billing/components/billing-plan-card";
import { renderWithProviders, screen } from "@/test/test-utils";
import type { BillingSubscription } from "@/features/billing/types/billing.types";

const subscription: BillingSubscription = {
  id: "sub-local-1",
  company_id: "company-1",
  stripe_subscription_id: "sub_test_123",
  stripe_customer_id: "cus_test_123",
  plan_name: "Professional Plan",
  status: "active",
  minutes_included: 500,
  current_period_start: "2025-06-01T00:00:00.000Z",
  current_period_end: "2025-06-30T00:00:00.000Z",
  created_at: "2025-06-01T00:00:00.000Z",
  updated_at: "2025-06-01T00:00:00.000Z",
};

describe("BillingPlanCard", () => {
  it("renders subscription details", () => {
    renderWithProviders(<BillingPlanCard subscription={subscription} paymentStatus="paid" />);

    expect(screen.getByText("Current plan")).toBeInTheDocument();
    expect(screen.getByText("Professional Plan")).toBeInTheDocument();
    expect(screen.getByText(/500 minutes included/)).toBeInTheDocument();
    expect(screen.getAllByText("active").length).toBeGreaterThan(0);
    expect(screen.getByText("paid")).toBeInTheDocument();
  });

  it("renders empty state without a subscription", () => {
    renderWithProviders(<BillingPlanCard subscription={null} paymentStatus={null} />);

    expect(screen.getByText("No active subscription on file.")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});

describe("BillingInvoiceLink", () => {
  it("renders a link when an invoice url exists", () => {
    renderWithProviders(<BillingInvoiceLink invoiceUrl="https://invoice.stripe.com/test" />);

    const link = screen.getByRole("link", { name: /view invoice/i });
    expect(link).toHaveAttribute("href", "https://invoice.stripe.com/test");
  });

  it("renders a placeholder when no invoice url exists", () => {
    renderWithProviders(<BillingInvoiceLink invoiceUrl={null} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
