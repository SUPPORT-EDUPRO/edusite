-- Young Eagles 2027 weekend-care foundation.
--
-- Additive to `20261015100000_young_eagles_2027_registration_foundation.sql`.
-- Implements the schema described in
-- `docs/architecture/young-eagles-2027-weekend-care-sol-addendum-2026-09-17.md`.
--
-- This migration is intentionally schema-only. It does not enable weekend care
-- for any organization, seed a price, currency, operating day, or capacity, or
-- activate any payment provider. `weekend_care_configurations.is_enabled`
-- defaults to false and no row is inserted here.
--
-- Attendance remains full-day weekday care only; this migration does not add a
-- half-day or specific-day option to registration. Weekend care is a separate,
-- optional, guardian-initiated booking tied to an already-registered child
-- (`registration_requests`), never a registration field or prerequisite.
--
-- Application writes must use the authenticated server boundary; these tables
-- do not provide an anonymous or authenticated-direct browser write path.

BEGIN;

-- One configuration row per organization. `pricing_model` selects which shape
-- of `weekend_care_price_versions` row is authoritative; the server, not the
-- client, resolves the active price version and its amounts.
CREATE TABLE IF NOT EXISTS public.weekend_care_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  pricing_model text NOT NULL CHECK (pricing_model IN ('per_day', 'package')),
  is_enabled boolean NOT NULL DEFAULT false,
  operating_days_of_week smallint[],
  daily_capacity integer CHECK (daily_capacity IS NULL OR daily_capacity >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    operating_days_of_week IS NULL
    OR operating_days_of_week <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::smallint[]
  ),
  UNIQUE (organization_id),
  UNIQUE (organization_id, id)
);

-- Effective-dated, tenant-owned pricing. Exactly one of the per-day or
-- package amount columns is populated, matching the configuration's
-- `pricing_model`; the server enforces that pairing, since it spans two
-- tables. No default amount or currency exists anywhere in this migration.
CREATE TABLE IF NOT EXISTS public.weekend_care_price_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  weekend_care_configuration_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  currency text,
  per_day_amount numeric(12, 2),
  package_amount numeric(12, 2),
  package_entitlement_count integer CHECK (package_entitlement_count IS NULL OR package_entitlement_count > 0),
  effective_from timestamptz,
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (per_day_amount IS NOT NULL AND package_amount IS NULL AND package_entitlement_count IS NULL)
    OR (per_day_amount IS NULL AND package_amount IS NOT NULL AND package_entitlement_count IS NOT NULL)
  ),
  CHECK (effective_until IS NULL OR effective_from IS NULL OR effective_until >= effective_from),
  UNIQUE (organization_id, weekend_care_configuration_id, version),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, weekend_care_configuration_id)
    REFERENCES public.weekend_care_configurations (organization_id, id)
    ON DELETE CASCADE
);

-- A prepaid grant of weekend-day entitlements. A "specific set" of dates
-- (rather than a flexible credit balance) is represented by consuming all
-- granted entitlements into `weekend_care_booking_dates` rows at purchase
-- time; both shapes share this ledger so consumption stays auditable.
CREATE TABLE IF NOT EXISTS public.weekend_care_package_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  weekend_care_price_version_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'active', 'exhausted', 'expired', 'cancelled', 'refunded')),
  entitlements_granted integer NOT NULL CHECK (entitlements_granted > 0),
  entitlements_consumed integer NOT NULL DEFAULT 0 CHECK (entitlements_consumed >= 0),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (entitlements_consumed <= entitlements_granted),
  UNIQUE (organization_id, idempotency_key),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE,
  FOREIGN KEY (organization_id, weekend_care_price_version_id)
    REFERENCES public.weekend_care_price_versions (organization_id, id)
    ON DELETE RESTRICT
);

-- A booking session for one already-registered child. `weekend_care_price_version_id`
-- always records the price version in effect at creation time for audit, even
-- when a package funds the booking; `weekend_care_package_purchase_id` is set
-- only for package-funded bookings, in which case no payment attempt is
-- required. Individual dates live in `weekend_care_booking_dates`.
CREATE TABLE IF NOT EXISTS public.weekend_care_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  weekend_care_price_version_id uuid NOT NULL,
  weekend_care_package_purchase_id uuid,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'pending_payment', 'confirmed', 'attended', 'completed',
      'cancelled', 'expired', 'refund_pending', 'refunded'
    )),
  price_snapshot jsonb,
  currency text,
  amount numeric(12, 2),
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE,
  FOREIGN KEY (organization_id, weekend_care_price_version_id)
    REFERENCES public.weekend_care_price_versions (organization_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (organization_id, weekend_care_package_purchase_id)
    REFERENCES public.weekend_care_package_purchases (organization_id, id)
    ON DELETE RESTRICT
);

-- One row per specific weekend date. `registration_request_id` is denormalized
-- from the parent booking solely so a single tenant-scoped UNIQUE constraint
-- can prevent double-booking the same child on the same date across separate
-- bookings. Per-day capacity limits are a server/query responsibility, not a
-- constraint this schema-only migration can express.
CREATE TABLE IF NOT EXISTS public.weekend_care_booking_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  weekend_care_booking_id uuid NOT NULL,
  registration_request_id uuid NOT NULL,
  booked_date date NOT NULL,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'confirmed', 'attended', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, registration_request_id, booked_date),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, weekend_care_booking_id)
    REFERENCES public.weekend_care_bookings (organization_id, id)
    ON DELETE CASCADE,
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

-- Payment state is tracked independently from booking state. Only a verified
-- server/provider event may move a row to `paid`, and only that transition may
-- move the owning booking to `confirmed`; that rule is enforced server-side.
CREATE TABLE IF NOT EXISTS public.weekend_care_payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  weekend_care_booking_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'not_required'
    CHECK (status IN (
      'not_required', 'initiated', 'pending', 'paid', 'failed',
      'cancelled', 'refund_pending', 'refunded'
    )),
  amount numeric(12, 2),
  currency text,
  provider text,
  provider_payment_id text,
  verified_at timestamptz,
  verified_by uuid,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, weekend_care_booking_id)
    REFERENCES public.weekend_care_bookings (organization_id, id)
    ON DELETE CASCADE
);

-- Weekend care has its own terms series: it is a year-round add-on, not owned
-- by an admissions cycle, so it cannot reuse `registration_terms_versions`
-- (which is cycle-scoped) or `registration_terms_acceptances` (whose
-- `consent_kind` values are enrolment-specific).
CREATE TABLE IF NOT EXISTS public.weekend_care_terms_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version > 0),
  terms_key text NOT NULL,
  content jsonb,
  content_hash text,
  effective_from timestamptz,
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, version),
  UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS public.weekend_care_terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  weekend_care_terms_version_id uuid NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  accepted_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  accepted_ip inet,
  accepted_user_agent text,
  rendered_document_checksum text NOT NULL,
  UNIQUE (organization_id, registration_request_id, weekend_care_terms_version_id),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE,
  FOREIGN KEY (organization_id, weekend_care_terms_version_id)
    REFERENCES public.weekend_care_terms_versions (organization_id, id)
    ON DELETE RESTRICT
);

-- Weekend bookings reuse the existing registration audit/transition ledgers
-- rather than duplicating them: `registration_audit_events.event_type` is
-- already free text, and `registration_transition_events.state_machine` gains
-- two values here so weekend booking/payment transitions are recorded
-- alongside the enrolment ones they may cancel or refund against.
ALTER TABLE public.registration_transition_events
  DROP CONSTRAINT IF EXISTS registration_transition_events_state_machine_check;
ALTER TABLE public.registration_transition_events
  ADD CONSTRAINT registration_transition_events_state_machine_check
  CHECK (state_machine IN (
    'application', 'payment', 'placement', 'contract', 'document',
    'weekend_booking', 'weekend_payment'
  ));

CREATE INDEX IF NOT EXISTS weekend_care_price_versions_configuration_idx
  ON public.weekend_care_price_versions (organization_id, weekend_care_configuration_id, effective_from);
CREATE INDEX IF NOT EXISTS weekend_care_package_purchases_request_idx
  ON public.weekend_care_package_purchases (organization_id, registration_request_id, status);
CREATE INDEX IF NOT EXISTS weekend_care_bookings_request_idx
  ON public.weekend_care_bookings (organization_id, registration_request_id, status);
CREATE INDEX IF NOT EXISTS weekend_care_booking_dates_booking_idx
  ON public.weekend_care_booking_dates (organization_id, weekend_care_booking_id);
CREATE INDEX IF NOT EXISTS weekend_care_booking_dates_date_idx
  ON public.weekend_care_booking_dates (organization_id, booked_date, status);
CREATE INDEX IF NOT EXISTS weekend_care_payment_attempts_booking_idx
  ON public.weekend_care_payment_attempts (organization_id, weekend_care_booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS weekend_care_terms_acceptances_request_idx
  ON public.weekend_care_terms_acceptances (organization_id, registration_request_id, accepted_at DESC);

-- New sensitive tables have no direct browser access, matching the foundation
-- migration: RLS is enabled and both `anon` and `authenticated` are revoked
-- outright. A later security migration must add server-verified policies once
-- the canonical staff-membership/permission helper is established.
DO $access$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'weekend_care_configurations',
    'weekend_care_price_versions',
    'weekend_care_package_purchases',
    'weekend_care_bookings',
    'weekend_care_booking_dates',
    'weekend_care_payment_attempts',
    'weekend_care_terms_versions',
    'weekend_care_terms_acceptances'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_name);
  END LOOP;
END
$access$;

COMMENT ON TABLE public.weekend_care_configurations IS
  'One row per organization; is_enabled defaults to false and no row is seeded by this migration.';
COMMENT ON TABLE public.weekend_care_price_versions IS
  'Effective-dated, tenant-owned weekend pricing; no amount or currency is seeded here.';
COMMENT ON TABLE public.weekend_care_package_purchases IS
  'Prepaid entitlement ledger; entitlements are reserved/consumed by a later server-side transactional path, not by this schema alone.';
COMMENT ON TABLE public.weekend_care_bookings IS
  'One weekend-care booking session per already-registered child; price_snapshot is populated by the server at confirmation, never by the client.';
COMMENT ON TABLE public.weekend_care_booking_dates IS
  'Individual booked weekend dates; per-date capacity enforcement is a server responsibility.';
COMMENT ON TABLE public.weekend_care_payment_attempts IS
  'Payment state independent from booking state; only a verified server/provider event may set status to paid.';
COMMENT ON TABLE public.weekend_care_terms_versions IS
  'Organization-owned weekend-care terms, separate from cycle-owned enrolment terms.';
COMMENT ON TABLE public.weekend_care_terms_acceptances IS
  'Weekend-care terms acceptance evidence, separate from enrolment consent_kind values.';

-- Compatibility gap, unchanged from the registration foundation migration:
-- access here still depends on the canonical staff-membership/permission
-- helper, which remains unresolved. No policy is created for staff, finance,
-- or webhook access in this migration; the access matrix in the weekend-care
-- addendum document remains a specification until that helper exists and a
-- reviewed security migration adds the corresponding policies.
-- Launch additionally requires the operating days, capacity, fee amounts,
-- currency, and payment-provider approvals listed in the addendum; none of
-- them exist in this migration or anywhere in this repository.

COMMIT;
