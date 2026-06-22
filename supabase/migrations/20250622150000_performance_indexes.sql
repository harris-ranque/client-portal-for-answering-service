-- Query patterns for admin billing/usage dashboards and invoice lookups
CREATE INDEX billing_records_company_id_created_at_idx
  ON public.billing_records (company_id, created_at DESC);

CREATE INDEX subscriptions_company_id_created_at_idx
  ON public.subscriptions (company_id, created_at DESC);

CREATE INDEX usage_metrics_company_period_idx
  ON public.usage_metrics (company_id, period_start, period_end);
