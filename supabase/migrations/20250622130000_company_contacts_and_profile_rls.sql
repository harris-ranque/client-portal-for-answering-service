-- Milestone 11: company contacts and profile update permissions

-- ---------------------------------------------------------------------------
-- company_contacts
-- ---------------------------------------------------------------------------
CREATE TABLE public.company_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  title TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT company_contacts_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX company_contacts_company_id_idx ON public.company_contacts (company_id);
CREATE INDEX company_contacts_is_primary_idx ON public.company_contacts (company_id, is_primary);

CREATE TRIGGER company_contacts_set_updated_at
BEFORE UPDATE ON public.company_contacts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_update_member ON public.companies
FOR UPDATE
USING (public.user_has_company_access(id))
WITH CHECK (public.user_has_company_access(id));

CREATE POLICY company_contacts_select_scoped ON public.company_contacts
FOR SELECT
USING (public.user_has_company_access(company_id));

CREATE POLICY company_contacts_insert_scoped ON public.company_contacts
FOR INSERT
WITH CHECK (public.user_has_company_access(company_id));

CREATE POLICY company_contacts_update_scoped ON public.company_contacts
FOR UPDATE
USING (public.user_has_company_access(company_id))
WITH CHECK (public.user_has_company_access(company_id));

CREATE POLICY company_contacts_delete_scoped ON public.company_contacts
FOR DELETE
USING (public.user_has_company_access(company_id));

CREATE POLICY company_contacts_write_admin ON public.company_contacts
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
