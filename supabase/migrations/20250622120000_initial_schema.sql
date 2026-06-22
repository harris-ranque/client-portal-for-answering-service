-- Client Portal initial schema
-- Milestone 5: normalized tables, constraints, indexes, RLS, and auth integration

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('admin', 'client');

CREATE TYPE public.call_direction AS ENUM ('inbound', 'outbound');

CREATE TYPE public.call_status AS ENUM (
  'answered',
  'missed',
  'voicemail',
  'busy',
  'failed',
  'cancelled'
);

CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

CREATE TYPE public.onboarding_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'blocked'
);

CREATE TYPE public.sync_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- ---------------------------------------------------------------------------
-- Utility functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'client',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT users_email_lowercase CHECK (email = LOWER(email))
);

CREATE INDEX users_role_idx ON public.users (role);
CREATE INDEX users_is_active_idx ON public.users (is_active);

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  stripe_customer_id TEXT UNIQUE,
  hubspot_company_id TEXT UNIQUE,
  justcall_account_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT companies_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX companies_is_active_idx ON public.companies (is_active);
CREATE INDEX companies_stripe_customer_id_idx ON public.companies (stripe_customer_id);
CREATE INDEX companies_hubspot_company_id_idx ON public.companies (hubspot_company_id);

CREATE TRIGGER companies_set_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- company_members
-- ---------------------------------------------------------------------------
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT company_members_unique_membership UNIQUE (user_id, company_id)
);

CREATE INDEX company_members_user_id_idx ON public.company_members (user_id);
CREATE INDEX company_members_company_id_idx ON public.company_members (company_id);

CREATE TRIGGER company_members_set_updated_at
BEFORE UPDATE ON public.company_members
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helper functions (require users + company_members tables)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.user_company_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.company_members
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_has_company_access(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.company_members
      WHERE user_id = auth.uid()
        AND company_id = target_company_id
    );
$$;

-- ---------------------------------------------------------------------------
-- call_logs
-- ---------------------------------------------------------------------------
CREATE TABLE public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  external_id TEXT,
  call_date TIMESTAMPTZ NOT NULL,
  caller_name TEXT,
  caller_number TEXT,
  direction public.call_direction NOT NULL DEFAULT 'inbound',
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  agent_name TEXT,
  status public.call_status NOT NULL DEFAULT 'answered',
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT call_logs_external_id_unique UNIQUE (company_id, external_id)
);

CREATE INDEX call_logs_company_id_idx ON public.call_logs (company_id);
CREATE INDEX call_logs_call_date_idx ON public.call_logs (call_date DESC);
CREATE INDEX call_logs_company_call_date_idx ON public.call_logs (company_id, call_date DESC);
CREATE INDEX call_logs_status_idx ON public.call_logs (status);
CREATE INDEX call_logs_caller_number_idx ON public.call_logs (caller_number);

CREATE TRIGGER call_logs_set_updated_at
BEFORE UPDATE ON public.call_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- usage_metrics
-- ---------------------------------------------------------------------------
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  minutes_used NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (minutes_used >= 0),
  calls_answered INTEGER NOT NULL DEFAULT 0 CHECK (calls_answered >= 0),
  calls_missed INTEGER NOT NULL DEFAULT 0 CHECK (calls_missed >= 0),
  average_duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (average_duration_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT usage_metrics_period_valid CHECK (period_end >= period_start),
  CONSTRAINT usage_metrics_unique_period UNIQUE (company_id, period_start, period_end)
);

CREATE INDEX usage_metrics_company_id_idx ON public.usage_metrics (company_id);
CREATE INDEX usage_metrics_period_idx ON public.usage_metrics (period_start, period_end);

CREATE TRIGGER usage_metrics_set_updated_at
BEFORE UPDATE ON public.usage_metrics
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_name TEXT NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'active',
  minutes_included INTEGER CHECK (minutes_included IS NULL OR minutes_included >= 0),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT subscriptions_period_valid CHECK (
    current_period_end IS NULL
    OR current_period_start IS NULL
    OR current_period_end >= current_period_start
  )
);

CREATE INDEX subscriptions_company_id_idx ON public.subscriptions (company_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions (status);
CREATE INDEX subscriptions_stripe_subscription_id_idx ON public.subscriptions (stripe_subscription_id);

CREATE TRIGGER subscriptions_set_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- billing_records
-- ---------------------------------------------------------------------------
CREATE TABLE public.billing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX billing_records_company_id_idx ON public.billing_records (company_id);
CREATE INDEX billing_records_status_idx ON public.billing_records (status);
CREATE INDEX billing_records_paid_at_idx ON public.billing_records (paid_at DESC);

CREATE TRIGGER billing_records_set_updated_at
BEFORE UPDATE ON public.billing_records
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- onboarding
-- ---------------------------------------------------------------------------
CREATE TABLE public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies (id) ON DELETE CASCADE,
  status public.onboarding_status NOT NULL DEFAULT 'not_started',
  current_step TEXT,
  completed_steps JSONB NOT NULL DEFAULT '[]'::JSONB,
  hubspot_deal_id TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX onboarding_status_idx ON public.onboarding (status);

CREATE TRIGGER onboarding_set_updated_at
BEFORE UPDATE ON public.onboarding
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- hubspot_sync
-- ---------------------------------------------------------------------------
CREATE TABLE public.hubspot_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  hubspot_id TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  sync_status public.sync_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT hubspot_sync_entity_type_not_empty CHECK (LENGTH(TRIM(entity_type)) > 0),
  CONSTRAINT hubspot_sync_unique_mapping UNIQUE (entity_type, hubspot_id)
);

CREATE INDEX hubspot_sync_entity_id_idx ON public.hubspot_sync (entity_id);
CREATE INDEX hubspot_sync_sync_status_idx ON public.hubspot_sync (sync_status);

CREATE TRIGGER hubspot_sync_set_updated_at
BEFORE UPDATE ON public.hubspot_sync
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- justcall_sync
-- ---------------------------------------------------------------------------
CREATE TABLE public.justcall_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  sync_type TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sync_status public.sync_status NOT NULL DEFAULT 'pending',
  records_processed INTEGER NOT NULL DEFAULT 0 CHECK (records_processed >= 0),
  error_message TEXT,
  cursor TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT justcall_sync_type_not_empty CHECK (LENGTH(TRIM(sync_type)) > 0)
);

CREATE INDEX justcall_sync_company_id_idx ON public.justcall_sync (company_id);
CREATE INDEX justcall_sync_sync_status_idx ON public.justcall_sync (sync_status);
CREATE INDEX justcall_sync_sync_type_idx ON public.justcall_sync (sync_type);

CREATE TRIGGER justcall_sync_set_updated_at
BEFORE UPDATE ON public.justcall_sync
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT audit_logs_action_not_empty CHECK (LENGTH(TRIM(action)) > 0),
  CONSTRAINT audit_logs_entity_type_not_empty CHECK (LENGTH(TRIM(entity_type)) > 0)
);

CREATE INDEX audit_logs_actor_id_idx ON public.audit_logs (actor_id);
CREATE INDEX audit_logs_company_id_idx ON public.audit_logs (company_id);
CREATE INDEX audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

CREATE TRIGGER audit_logs_set_updated_at
BEFORE UPDATE ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth integration: create profile on signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  assigned_role := COALESCE(
    (NEW.raw_app_meta_data ->> 'role')::public.user_role,
    'client'
  );

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = TIMEZONE('utc', NOW());

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Sync role and company_id to JWT app_metadata for middleware
CREATE OR REPLACE FUNCTION public.sync_user_auth_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  primary_company_id UUID;
BEGIN
  SELECT company_id
  INTO primary_company_id
  FROM public.company_members
  WHERE user_id = NEW.id
  ORDER BY created_at ASC
  LIMIT 1;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::JSONB) || JSONB_BUILD_OBJECT(
    'role', NEW.role,
    'company_id', primary_company_id
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER users_sync_auth_metadata
AFTER INSERT OR UPDATE OF role ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_auth_metadata();

CREATE OR REPLACE FUNCTION public.sync_membership_auth_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id UUID;
  primary_company_id UUID;
  user_role_value public.user_role;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);

  SELECT role
  INTO user_role_value
  FROM public.users
  WHERE id = target_user_id;

  SELECT company_id
  INTO primary_company_id
  FROM public.company_members
  WHERE user_id = target_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::JSONB) || JSONB_BUILD_OBJECT(
    'role', user_role_value,
    'company_id', primary_company_id
  )
  WHERE id = target_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER company_members_sync_auth_metadata
AFTER INSERT OR UPDATE OR DELETE ON public.company_members
FOR EACH ROW
EXECUTE FUNCTION public.sync_membership_auth_metadata();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubspot_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justcall_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY users_select_own_or_admin ON public.users
FOR SELECT
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY users_update_own_or_admin ON public.users
FOR UPDATE
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY users_insert_admin ON public.users
FOR INSERT
WITH CHECK (public.is_admin() OR auth.uid() = id);

-- companies
CREATE POLICY companies_select_scoped ON public.companies
FOR SELECT
USING (public.is_admin() OR id IN (SELECT public.user_company_ids()));

CREATE POLICY companies_insert_admin ON public.companies
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY companies_update_admin ON public.companies
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY companies_delete_admin ON public.companies
FOR DELETE
USING (public.is_admin());

-- company_members
CREATE POLICY company_members_select_scoped ON public.company_members
FOR SELECT
USING (
  public.is_admin()
  OR user_id = auth.uid()
  OR company_id IN (SELECT public.user_company_ids())
);

CREATE POLICY company_members_insert_admin ON public.company_members
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY company_members_update_admin ON public.company_members
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY company_members_delete_admin ON public.company_members
FOR DELETE
USING (public.is_admin());

-- company-scoped tables macro pattern
CREATE POLICY call_logs_select_scoped ON public.call_logs
FOR SELECT
USING (public.user_has_company_access(company_id));

CREATE POLICY call_logs_insert_scoped ON public.call_logs
FOR INSERT
WITH CHECK (public.is_admin() OR public.user_has_company_access(company_id));

CREATE POLICY call_logs_update_scoped ON public.call_logs
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY call_logs_delete_admin ON public.call_logs
FOR DELETE
USING (public.is_admin());

CREATE POLICY usage_metrics_select_scoped ON public.usage_metrics
FOR SELECT
USING (public.user_has_company_access(company_id));

CREATE POLICY usage_metrics_write_admin ON public.usage_metrics
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY subscriptions_select_scoped ON public.subscriptions
FOR SELECT
USING (public.user_has_company_access(company_id));

CREATE POLICY subscriptions_write_admin ON public.subscriptions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY billing_records_select_scoped ON public.billing_records
FOR SELECT
USING (public.user_has_company_access(company_id));

CREATE POLICY billing_records_write_admin ON public.billing_records
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY onboarding_select_scoped ON public.onboarding
FOR SELECT
USING (public.user_has_company_access(company_id));

CREATE POLICY onboarding_write_admin ON public.onboarding
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- integration + audit tables: admin only
CREATE POLICY hubspot_sync_admin ON public.hubspot_sync
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY justcall_sync_admin ON public.justcall_sync
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY audit_logs_select_admin ON public.audit_logs
FOR SELECT
USING (public.is_admin());

CREATE POLICY audit_logs_insert_authenticated ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
