-- Auth and RLS hardening for answering-service portal model

-- Drop unused per-membership role (global role lives on public.users)
ALTER TABLE public.company_members DROP COLUMN IF EXISTS role;

-- Prevent clients from escalating their own role
CREATE OR REPLACE FUNCTION public.prevent_user_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only system admins can change user roles';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_prevent_role_escalation ON public.users;
CREATE TRIGGER users_prevent_role_escalation
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_role_escalation();

-- Restrict client company updates to profile fields only
CREATE OR REPLACE FUNCTION public.restrict_client_company_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.is_active IS DISTINCT FROM OLD.is_active
    OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
    OR NEW.hubspot_company_id IS DISTINCT FROM OLD.hubspot_company_id
    OR NEW.justcall_account_id IS DISTINCT FROM OLD.justcall_account_id
  THEN
    RAISE EXCEPTION 'Clients can only update company profile fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS companies_restrict_client_updates ON public.companies;
CREATE TRIGGER companies_restrict_client_updates
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.restrict_client_company_updates();

-- Restrict audit log inserts to system admins
DROP POLICY IF EXISTS audit_logs_insert_authenticated ON public.audit_logs;
CREATE POLICY audit_logs_insert_admin ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());
