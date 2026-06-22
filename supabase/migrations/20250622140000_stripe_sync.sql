-- Stripe sync jobs and webhook event idempotency
CREATE TABLE public.stripe_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  sync_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sync_status public.sync_status NOT NULL DEFAULT 'pending',
  records_processed INTEGER NOT NULL DEFAULT 0 CHECK (records_processed >= 0),
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT stripe_sync_type_not_empty CHECK (LENGTH(TRIM(sync_type)) > 0)
);

CREATE INDEX stripe_sync_company_id_idx ON public.stripe_sync (company_id);
CREATE INDEX stripe_sync_sync_status_idx ON public.stripe_sync (sync_status);
CREATE INDEX stripe_sync_sync_type_idx ON public.stripe_sync (sync_type);
CREATE INDEX stripe_sync_created_at_idx ON public.stripe_sync (created_at DESC);

CREATE TRIGGER stripe_sync_set_updated_at
BEFORE UPDATE ON public.stripe_sync
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.stripe_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY stripe_sync_admin ON public.stripe_sync
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
