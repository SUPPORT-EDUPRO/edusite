-- Restore the registration_requests columns the Young Eagles 2027 form submits.
--
-- The live EduDash-Pro table was missing these columns, so every insert failed.
-- Additive and idempotent only: no existing column, row or policy is changed.
-- Public intake goes through the server route /api/registrations/submit (service
-- role, tenant fixed server-side), so no anon INSERT policy is added here.

ALTER TABLE public.registration_requests
  ADD COLUMN IF NOT EXISTS academic_year character varying(10),
  ADD COLUMN IF NOT EXISTS coupon_code character varying(50),
  ADD COLUMN IF NOT EXISTS sibling_enrolled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS priority_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_start_date date,
  ADD COLUMN IF NOT EXISTS special_requests text,
  ADD COLUMN IF NOT EXISTS secondary_guardian_relationship character varying(100),
  ADD COLUMN IF NOT EXISTS consent_photography boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_marketing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS registration_requests_org_academic_year_idx
  ON public.registration_requests (organization_id, academic_year);

CREATE UNIQUE INDEX IF NOT EXISTS registration_requests_payment_reference_key
  ON public.registration_requests (payment_reference)
  WHERE payment_reference IS NOT NULL;

-- Defence in depth: row level security already blocks anon/authenticated reads and
-- writes, but these table-level privileges are never needed by the app.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.registration_requests FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';
