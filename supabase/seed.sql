-- Development seed data for local Supabase
-- Run via: npm run supabase:reset

INSERT INTO public.companies (
  id,
  name,
  email,
  phone,
  address,
  is_active,
  stripe_customer_id,
  justcall_account_id,
  hubspot_company_id
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Acme Answering Clients',
    'billing@acme.example.com',
    '+1 (555) 010-1000',
    '123 Main Street, Austin, TX',
    TRUE,
    'cus_demo_acme',
    '+15550101000',
    'hs_demo_acme'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Beta Services LLC',
    'hello@beta.example.com',
    '+1 (555) 010-2000',
    '456 Oak Avenue, Denver, CO',
    TRUE,
    NULL,
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.onboarding (company_id, status, current_step, completed_steps)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'completed',
    'launch',
    '["profile","billing","numbers","routing"]'::JSONB
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'in_progress',
    'billing',
    '["profile"]'::JSONB
  )
ON CONFLICT (company_id) DO NOTHING;

INSERT INTO public.subscriptions (
  id,
  company_id,
  plan_name,
  status,
  minutes_included,
  current_period_start,
  current_period_end
)
VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    'Professional 500',
    'active',
    500,
    DATE_TRUNC('month', TIMEZONE('utc', NOW())),
    DATE_TRUNC('month', TIMEZONE('utc', NOW())) + INTERVAL '1 month' - INTERVAL '1 second'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    'Starter 200',
    'trialing',
    200,
    DATE_TRUNC('month', TIMEZONE('utc', NOW())),
    DATE_TRUNC('month', TIMEZONE('utc', NOW())) + INTERVAL '1 month' - INTERVAL '1 second'
  )
ON CONFLICT (id) DO NOTHING;

UPDATE public.subscriptions
SET
  stripe_customer_id = 'cus_demo_acme',
  stripe_subscription_id = 'sub_demo_acme'
WHERE id = '33333333-3333-3333-3333-333333333331';

INSERT INTO public.billing_records (
  id,
  company_id,
  stripe_invoice_id,
  amount_cents,
  currency,
  status,
  invoice_url,
  paid_at,
  period_start,
  period_end
)
VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    'in_demo_acme_current',
    29900,
    'usd',
    'paid',
    'https://invoice.stripe.com/i/demo_acme_current',
    TIMEZONE('utc', NOW()) - INTERVAL '5 days',
    DATE_TRUNC('month', TIMEZONE('utc', NOW())),
    DATE_TRUNC('month', TIMEZONE('utc', NOW())) + INTERVAL '1 month' - INTERVAL '1 second'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '11111111-1111-1111-1111-111111111111',
    'in_demo_acme_previous',
    29900,
    'usd',
    'paid',
    'https://invoice.stripe.com/i/demo_acme_previous',
    TIMEZONE('utc', NOW()) - INTERVAL '1 month' - INTERVAL '3 days',
    DATE_TRUNC('month', TIMEZONE('utc', NOW()) - INTERVAL '1 month'),
    DATE_TRUNC('month', TIMEZONE('utc', NOW())) - INTERVAL '1 second'
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '11111111-1111-1111-1111-111111111111',
    'in_demo_acme_older',
    29900,
    'usd',
    'paid',
    'https://invoice.stripe.com/i/demo_acme_older',
    TIMEZONE('utc', NOW()) - INTERVAL '2 months' - INTERVAL '2 days',
    DATE_TRUNC('month', TIMEZONE('utc', NOW()) - INTERVAL '2 months'),
    DATE_TRUNC('month', TIMEZONE('utc', NOW()) - INTERVAL '1 month') - INTERVAL '1 second'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.usage_metrics (
  company_id,
  period_start,
  period_end,
  minutes_used,
  calls_answered,
  calls_missed,
  average_duration_seconds
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
    182.50,
    248,
    12,
    44
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
    36.25,
    52,
    8,
    42
  )
ON CONFLICT (company_id, period_start, period_end) DO NOTHING;

INSERT INTO public.call_logs (
  company_id,
  external_id,
  call_date,
  caller_name,
  caller_number,
  direction,
  duration_seconds,
  agent_name,
  status,
  notes
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'jc-demo-001',
    TIMEZONE('utc', NOW()) - INTERVAL '2 hours',
    'Jane Prospect',
    '+1 (555) 555-0101',
    'inbound',
    186,
    'Alex Morgan',
    'answered',
    'Requested follow-up pricing email.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'jc-demo-002',
    TIMEZONE('utc', NOW()) - INTERVAL '1 day',
    'Unknown Caller',
    '+1 (555) 555-0199',
    'inbound',
    0,
    NULL,
    'missed',
    'No voicemail left.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'jc-demo-003',
    TIMEZONE('utc', NOW()) - INTERVAL '3 hours',
    'Chris Vendor',
    '+1 (555) 555-0202',
    'outbound',
    95,
    'Jamie Lee',
    'answered',
    'Confirmed onboarding call.'
  )
ON CONFLICT (company_id, external_id) DO NOTHING;

-- Create test auth users (local development only)
-- Password for both users: Password123!
-- Token columns must be '' not NULL (GoTrue scan requirement).
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  phone_change,
  phone_change_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'admin@clientportal.local',
    crypt('Password123!', gen_salt('bf')),
    TIMEZONE('utc', NOW()),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"],"role":"admin"}'::JSONB,
    '{"full_name":"Portal Admin"}'::JSONB,
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW())
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'authenticated',
    'authenticated',
    'client@acme.example.com',
    crypt('Password123!', gen_salt('bf')),
    TIMEZONE('utc', NOW()),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"],"role":"client"}'::JSONB,
    '{"full_name":"Acme Client"}'::JSONB,
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW())
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"admin@clientportal.local"}'::JSONB,
    'email',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW())
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","email":"client@acme.example.com"}'::JSONB,
    'email',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW())
  )
ON CONFLICT (id) DO NOTHING;

-- Profiles are created by handle_new_user trigger; ensure membership for client
INSERT INTO public.company_members (user_id, company_id)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (user_id, company_id) DO NOTHING;

INSERT INTO public.company_contacts (
  id,
  company_id,
  name,
  email,
  phone,
  title,
  is_primary
)
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    'Sarah Chen',
    'sarah.chen@acme.example.com',
    '+1 (555) 010-1101',
    'Operations Manager',
    TRUE
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    'David Park',
    'david.park@acme.example.com',
    '+1 (555) 010-1102',
    'Billing Contact',
    FALSE
  )
ON CONFLICT (id) DO NOTHING;
