import type Stripe from "stripe";

import { mapStripeInvoice } from "@/features/stripe/lib/mappers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertInvoiceFromStripe(companyId: string, invoice: Stripe.Invoice) {
  const supabase = createAdminClient();
  const mapped = mapStripeInvoice(invoice);

  const { data: existing } = await supabase
    .from("billing_records")
    .select("id")
    .eq("stripe_invoice_id", invoice.id)
    .maybeSingle();

  const payload = {
    company_id: companyId,
    stripe_invoice_id: invoice.id,
    ...mapped,
  };

  if (existing) {
    const { error } = await supabase.from("billing_records").update(payload).eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("billing_records").insert(payload);

    if (error) {
      throw new Error(error.message);
    }
  }
}
