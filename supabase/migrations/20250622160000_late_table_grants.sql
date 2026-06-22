-- Tables created after the initial schema GRANT need explicit API role privileges.
-- Without these, PostgREST returns "permission denied for table ..." before RLS runs.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_contacts TO authenticated;
GRANT SELECT ON public.company_contacts TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stripe_sync TO authenticated;
GRANT SELECT ON public.stripe_sync TO anon;
