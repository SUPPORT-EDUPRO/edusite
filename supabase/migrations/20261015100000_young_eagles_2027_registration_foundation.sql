-- Young Eagles 2027 registration foundation.
--
-- This migration is intentionally schema-only. It does not seed or activate any
-- 2027 commercial values, dates, campaigns, promotions, or registration cycle.
-- A later migration/backfill must populate cycle-owned fee, terms, campaign, and
-- request snapshots after the unresolved 2027 inputs have been approved.
-- Application writes must use the authenticated server boundary; these tables do
-- not provide an anonymous browser write path.

BEGIN;

-- The legacy request table has a globally unique id, but tenant-paired foreign
-- keys require an explicit matching unique key. Existing rows are unchanged.
-- academic_year already exists on the live table as varchar(10) (migration 20261014120000), so it is
-- not redefined here; every column is IF NOT EXISTS so this file is safe on any database.
ALTER TABLE public.registration_requests
  ADD COLUMN IF NOT EXISTS academic_year character varying(10),
  ADD COLUMN IF NOT EXISTS registration_cycle_id uuid,
  ADD COLUMN IF NOT EXISTS registration_fee_version_id uuid,
  ADD COLUMN IF NOT EXISTS registration_terms_version_id uuid,
  ADD COLUMN IF NOT EXISTS registration_campaign_snapshot_id uuid,
  ADD COLUMN IF NOT EXISTS registration_fee_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS registration_terms_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS registration_campaign_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS application_status text,
  ADD COLUMN IF NOT EXISTS application_state_version integer NOT NULL DEFAULT 0
    CHECK (application_state_version >= 0),
  ADD COLUMN IF NOT EXISTS selected_document_delivery_preference text,
  ADD COLUMN IF NOT EXISTS applicant_capability_token_hash text,
  ADD COLUMN IF NOT EXISTS submission_idempotency_key text;

DO $constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.registration_requests'::regclass
      AND conname = 'registration_requests_application_status_check'
  ) THEN
    ALTER TABLE public.registration_requests
    ADD CONSTRAINT registration_requests_application_status_check CHECK (
    application_status IS NULL
    OR application_status IN (
      'draft',
      'submitted',
      'awaiting_documents',
      'ready_for_review',
      'under_review',
      'changes_requested',
      'approved',
      'declined',
      'withdrawn'
    )
    );
  END IF;
END
$constraint$;

DO $constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.registration_requests'::regclass
      AND conname = 'registration_requests_document_delivery_preference_check'
  ) THEN
    ALTER TABLE public.registration_requests
    ADD CONSTRAINT registration_requests_document_delivery_preference_check CHECK (
    selected_document_delivery_preference IS NULL
    OR selected_document_delivery_preference IN ('upload_now', 'upload_later')
    );
  END IF;
END
$constraint$;

DO $constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.registration_requests'::regclass
      AND conname = 'registration_requests_organization_id_id_key'
  ) THEN
    ALTER TABLE public.registration_requests
    ADD CONSTRAINT registration_requests_organization_id_id_key UNIQUE (organization_id, id);
  END IF;
END
$constraint$;

CREATE TABLE IF NOT EXISTS public.registration_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  academic_year integer NOT NULL CHECK (academic_year BETWEEN 2000 AND 9999),
  public_registration_key text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  opens_at timestamptz,
  closes_at timestamptz,
  attendance_start_at timestamptz,
  age_cutoff date,
  placement_rules jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (public_registration_key IS NULL OR length(trim(public_registration_key)) >= 8),
  CHECK (closes_at IS NULL OR opens_at IS NULL OR closes_at >= opens_at),
  CHECK (status <> 'open' OR public_registration_key IS NOT NULL),
  UNIQUE (organization_id, academic_year),
  UNIQUE (organization_id, public_registration_key),
  UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS public.registration_fee_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_cycle_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  currency text,
  base_amount numeric(12, 2),
  discount_amount numeric(12, 2),
  final_amount numeric(12, 2),
  effective_from timestamptz,
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, registration_cycle_id, version),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, registration_cycle_id)
    REFERENCES public.registration_cycles (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_terms_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_cycle_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  terms_key text NOT NULL,
  content jsonb,
  content_hash text,
  effective_from timestamptz,
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, registration_cycle_id, version),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, registration_cycle_id)
    REFERENCES public.registration_cycles (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_campaign_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_cycle_id uuid NOT NULL,
  source_campaign_id uuid,
  campaign_key text,
  snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, registration_cycle_id)
    REFERENCES public.registration_cycles (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_campaign_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  registration_campaign_snapshot_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'redeemed', 'released', 'expired')),
  idempotency_key text NOT NULL,
  reserved_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, registration_request_id),
  UNIQUE (organization_id, idempotency_key),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE,
  FOREIGN KEY (organization_id, registration_campaign_snapshot_id)
    REFERENCES public.registration_campaign_snapshots (organization_id, id)
    ON DELETE RESTRICT
);

DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.registration_requests'::regclass AND conname = 'registration_requests_cycle_fk') THEN
    ALTER TABLE public.registration_requests ADD CONSTRAINT registration_requests_cycle_fk
      FOREIGN KEY (organization_id, registration_cycle_id)
      REFERENCES public.registration_cycles (organization_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.registration_requests'::regclass AND conname = 'registration_requests_fee_version_fk') THEN
    ALTER TABLE public.registration_requests ADD CONSTRAINT registration_requests_fee_version_fk
      FOREIGN KEY (organization_id, registration_fee_version_id)
      REFERENCES public.registration_fee_versions (organization_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.registration_requests'::regclass AND conname = 'registration_requests_terms_version_fk') THEN
    ALTER TABLE public.registration_requests ADD CONSTRAINT registration_requests_terms_version_fk
      FOREIGN KEY (organization_id, registration_terms_version_id)
      REFERENCES public.registration_terms_versions (organization_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.registration_requests'::regclass AND conname = 'registration_requests_campaign_snapshot_fk') THEN
    ALTER TABLE public.registration_requests ADD CONSTRAINT registration_requests_campaign_snapshot_fk
      FOREIGN KEY (organization_id, registration_campaign_snapshot_id)
      REFERENCES public.registration_campaign_snapshots (organization_id, id);
  END IF;
END
$constraints$;

CREATE TABLE IF NOT EXISTS public.registration_terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  registration_terms_version_id uuid NOT NULL,
  consent_kind text NOT NULL
    CHECK (consent_kind IN ('enrolment_terms', 'privacy_acknowledgement', 'medical_authorization')),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  accepted_by_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  registration_session_id text,
  accepted_ip inet,
  accepted_user_agent text,
  rendered_document_checksum text NOT NULL,
  acceptance_metadata jsonb,
  CHECK (accepted_by_user_id IS NOT NULL OR registration_session_id IS NOT NULL),
  UNIQUE (organization_id, registration_request_id, registration_terms_version_id, consent_kind),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE,
  FOREIGN KEY (organization_id, registration_terms_version_id)
    REFERENCES public.registration_terms_versions (organization_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.registration_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL DEFAULT 'not_issued'
    CHECK (status IN ('not_issued', 'issued', 'accepted', 'declined', 'superseded')),
  content jsonb,
  content_hash text,
  issued_at timestamptz,
  accepted_at timestamptz,
  accepted_by_user_id uuid,
  decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, registration_request_id, version),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  payment_reference text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment', 'proof_submitted', 'under_review', 'verified', 'rejected', 'refunded')),
  amount numeric(12, 2),
  currency text,
  provider text,
  provider_payment_id text,
  proof_storage_key text,
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'unassigned'
    CHECK (status IN ('unassigned', 'proposed', 'confirmed', 'waitlisted', 'declined')),
  placement_snapshot jsonb,
  proposed_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, registration_request_id),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  document_kind text NOT NULL,
  status text NOT NULL DEFAULT 'not_requested'
    CHECK (status IN ('not_requested', 'required', 'partial', 'complete', 'verified', 'rejected')),
  storage_key text,
  metadata jsonb,
  uploaded_at timestamptz,
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (storage_key IS NULL OR storage_key !~* '(^https?://|://)'),
  CHECK (metadata IS NULL OR metadata::text !~* 'https?://'),
  UNIQUE (organization_id, registration_request_id, document_kind),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  relationship text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'revoked')),
  claim_id uuid,
  linked_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (organization_id, registration_request_id, user_id),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_cycle_id uuid NOT NULL,
  registration_request_id uuid,
  claim_kind text NOT NULL
    CHECK (claim_kind IN ('guardian_application', 'principal_registration')),
  token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'claim_issued'
    CHECK (status IN ('claim_issued', 'claimed', 'expired', 'revoked')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  consumed_by_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  revoked_at timestamptz,
  CHECK (length(token_hash) >= 32),
  CHECK (expires_at > issued_at),
  CHECK (
    (claim_kind = 'guardian_application' AND registration_request_id IS NOT NULL)
    OR (claim_kind = 'principal_registration' AND registration_request_id IS NULL)
  ),
  UNIQUE (organization_id, token_hash),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, registration_cycle_id)
    REFERENCES public.registration_cycles (organization_id, id)
    ON DELETE CASCADE,
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

DO $constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.registration_guardians'::regclass
      AND conname = 'registration_guardians_claim_fk'
  ) THEN
    ALTER TABLE public.registration_guardians
    ADD CONSTRAINT registration_guardians_claim_fk
      FOREIGN KEY (organization_id, claim_id)
      REFERENCES public.registration_claims (organization_id, id)
      ON DELETE RESTRICT;
  END IF;
END
$constraint$;

CREATE TABLE IF NOT EXISTS public.registration_document_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_cycle_id uuid NOT NULL,
  document_kind text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  deferred_upload_allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, registration_cycle_id, document_kind),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, registration_cycle_id)
    REFERENCES public.registration_cycles (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_document_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  registration_document_requirement_id uuid NOT NULL,
  slot_key text NOT NULL CHECK (slot_key !~ '/'),
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'uploaded', 'scanning', 'accepted', 'rejected', 'superseded')),
  storage_bucket text,
  storage_object_key text,
  mime_type text,
  byte_size bigint CHECK (byte_size IS NULL OR byte_size >= 0),
  checksum text,
  uploaded_at timestamptz,
  scanned_at timestamptz,
  accepted_at timestamptz,
  retention_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, registration_request_id, slot_key),
  UNIQUE (organization_id, id),
  CHECK (storage_bucket IS NULL OR storage_bucket = 'private-registration-documents'),
  CHECK (storage_object_key IS NULL OR storage_object_key !~* '(^https?://|://)'),
  CHECK (
    storage_object_key IS NULL
    OR storage_object_key LIKE organization_id::text || '/' || registration_request_id::text || '/' || slot_key || '/%'
  ),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE,
  FOREIGN KEY (organization_id, registration_document_requirement_id)
    REFERENCES public.registration_document_requirements (organization_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.registration_media_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  decision text NOT NULL CHECK (decision IN ('granted', 'refused', 'revoked')),
  decided_at timestamptz NOT NULL DEFAULT now(),
  decided_by_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  registration_session_id text,
  accepted_ip inet,
  accepted_user_agent text,
  rendered_document_checksum text,
  CHECK (decided_by_user_id IS NOT NULL OR registration_session_id IS NOT NULL),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid,
  event_type text NOT NULL CHECK (length(trim(event_type)) > 0),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  correlation_key text,
  idempotency_key text NOT NULL,
  event_metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.registration_transition_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid NOT NULL,
  state_machine text NOT NULL CHECK (state_machine IN ('application', 'payment', 'placement', 'contract', 'document')),
  previous_state text,
  new_state text NOT NULL,
  actor_user_id uuid,
  reason text,
  correlation_key text,
  idempotency_key text NOT NULL,
  expected_version integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.integration_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.preschools(id) ON DELETE CASCADE,
  registration_request_id uuid,
  event_type text NOT NULL,
  event_version integer NOT NULL DEFAULT 1 CHECK (event_version > 0),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'dead_letter')),
  idempotency_key text NOT NULL,
  available_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  UNIQUE (organization_id, idempotency_key),
  FOREIGN KEY (organization_id, registration_request_id)
    REFERENCES public.registration_requests (organization_id, id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS registration_cycles_public_lookup_idx
  ON public.registration_cycles (organization_id, public_registration_key)
  WHERE public_registration_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS registration_fee_versions_cycle_idx
  ON public.registration_fee_versions (organization_id, registration_cycle_id, effective_from);
CREATE INDEX IF NOT EXISTS registration_terms_versions_cycle_idx
  ON public.registration_terms_versions (organization_id, registration_cycle_id, effective_from);
CREATE INDEX IF NOT EXISTS registration_campaign_snapshots_cycle_idx
  ON public.registration_campaign_snapshots (organization_id, registration_cycle_id);
CREATE INDEX IF NOT EXISTS registration_campaign_redemptions_snapshot_idx
  ON public.registration_campaign_redemptions (
    organization_id,
    registration_campaign_snapshot_id,
    status
  );
CREATE INDEX IF NOT EXISTS registration_terms_acceptances_request_idx
  ON public.registration_terms_acceptances (organization_id, registration_request_id, accepted_at DESC);
CREATE INDEX IF NOT EXISTS registration_contracts_request_idx
  ON public.registration_contracts (organization_id, registration_request_id, version DESC);
CREATE INDEX IF NOT EXISTS registration_payments_request_idx
  ON public.registration_payments (organization_id, registration_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS registration_placements_request_idx
  ON public.registration_placements (organization_id, registration_request_id);
CREATE INDEX IF NOT EXISTS registration_documents_request_idx
  ON public.registration_documents (organization_id, registration_request_id, status);
CREATE INDEX IF NOT EXISTS registration_guardians_request_idx
  ON public.registration_guardians (organization_id, registration_request_id, status);
CREATE INDEX IF NOT EXISTS registration_claims_resolution_idx
  ON public.registration_claims (organization_id, registration_cycle_id, status, expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS registration_claims_active_request_idx
  ON public.registration_claims (organization_id, registration_request_id)
  WHERE claim_kind = 'guardian_application' AND status = 'claim_issued';
CREATE INDEX IF NOT EXISTS registration_document_requirements_cycle_idx
  ON public.registration_document_requirements (organization_id, registration_cycle_id, required);
CREATE INDEX IF NOT EXISTS registration_document_slots_request_idx
  ON public.registration_document_slots (organization_id, registration_request_id, status);
CREATE INDEX IF NOT EXISTS registration_media_consents_request_idx
  ON public.registration_media_consents (organization_id, registration_request_id, decided_at DESC);
CREATE INDEX IF NOT EXISTS registration_audit_events_request_idx
  ON public.registration_audit_events (organization_id, registration_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS registration_transition_events_request_idx
  ON public.registration_transition_events (organization_id, registration_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS integration_outbox_pending_idx
  ON public.integration_outbox (organization_id, available_at, created_at)
  WHERE status IN ('pending', 'processing', 'failed');
CREATE INDEX IF NOT EXISTS registration_requests_cycle_idx
  ON public.registration_requests (organization_id, registration_cycle_id);
CREATE INDEX IF NOT EXISTS registration_requests_application_status_idx
  ON public.registration_requests (
    organization_id,
    registration_cycle_id,
    application_status
  );
CREATE UNIQUE INDEX IF NOT EXISTS registration_requests_applicant_capability_token_hash_key
  ON public.registration_requests (applicant_capability_token_hash)
  WHERE applicant_capability_token_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS registration_requests_submission_idempotency_key
  ON public.registration_requests (organization_id, submission_idempotency_key)
  WHERE submission_idempotency_key IS NOT NULL;

-- New sensitive tables have no direct browser access. Authenticated staff views
-- must use a server route that resolves the active organization membership and
-- role capability, then returns a field-limited DTO. Service-role code remains
-- server-only; no public or authenticated table policy is created here.
DO $access$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'registration_cycles',
    'registration_fee_versions',
    'registration_terms_versions',
    'registration_campaign_snapshots',
    'registration_campaign_redemptions',
    'registration_terms_acceptances',
    'registration_guardians',
    'registration_claims',
    'registration_document_requirements',
    'registration_document_slots',
    'registration_media_consents',
    'registration_audit_events',
    'registration_contracts',
    'registration_payments',
    'registration_placements',
    'registration_documents',
    'registration_transition_events',
    'integration_outbox'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_name);
  END LOOP;
END
$access$;

COMMENT ON TABLE public.registration_cycles IS
  'Versioned registration-cycle foundation; a later migration/backfill must populate approved cycle values before activation.';
COMMENT ON TABLE public.registration_fee_versions IS
  'Cycle-owned fee versions; no 2027 amount or currency is seeded here.';
COMMENT ON TABLE public.registration_terms_versions IS
  'Cycle-owned terms versions retained for acceptance and immutable snapshots.';
COMMENT ON TABLE public.registration_contracts IS
  'Tenant-scoped immutable contract versions and contract state-machine records.';
COMMENT ON TABLE public.registration_campaign_snapshots IS
  'Cycle-owned campaign snapshot foundation; commercial campaigns remain unresolved until a later approved migration.';
COMMENT ON TABLE public.registration_campaign_redemptions IS
  'Campaign reservation and redemption audit foundation; a later server-side transactional path must enforce campaign caps.';
COMMENT ON TABLE public.integration_outbox IS
  'Allowlisted, versioned integration events; application workers must publish through the server boundary.';
COMMENT ON TABLE public.registration_guardians IS
  'Guardian-to-application links only; this table is intentionally separate from staff memberships and never grants staff access.';
COMMENT ON TABLE public.registration_claims IS
  'Opaque one-time claim hashes only; raw tokens, PII, roles, and tenant authority are never stored in this table.';
COMMENT ON TABLE public.registration_document_requirements IS
  'Cycle-owned document requirements; legal owners must approve which requirements are required and deferrable.';
COMMENT ON TABLE public.registration_document_slots IS
  'Private application document slots with explicit object metadata; storage_object_key is not a public URL.';
COMMENT ON TABLE public.registration_media_consents IS
  'Separate optional media-consent evidence; refusal must not block registration.';
COMMENT ON TABLE public.registration_audit_events IS
  'Tenant-paired registration audit evidence; server paths must write only allowlisted, minimum-necessary metadata.';
COMMENT ON COLUMN public.registration_requests.registration_fee_snapshot IS
  'Immutable cycle-owned fee snapshot; populated by a later server-side backfill/write path.';
COMMENT ON COLUMN public.registration_requests.registration_terms_snapshot IS
  'Immutable cycle-owned terms snapshot; populated by a later server-side backfill/write path.';
COMMENT ON COLUMN public.registration_requests.registration_campaign_snapshot IS
  'Immutable cycle-owned campaign snapshot; populated by a later server-side backfill/write path.';
COMMENT ON COLUMN public.registration_requests.application_status IS
  '2027 application state separate from the legacy status column; new server routes must set and transition it.';
COMMENT ON COLUMN public.registration_requests.applicant_capability_token_hash IS
  'Hash of the opaque applicant status capability; payment references are not authentication credentials.';

-- Compatibility gap: the accepted specification names has_org_permission(auth.uid(),
-- organization_id, permission), but this repository has no established helper
-- signature. The migration deliberately does not guess role/permission semantics
-- or grant direct authenticated access. A later security migration and server
-- boundary must use the canonical helper once its signature is established.
-- The repository also contains legacy memberships/user_organizations objects with
-- different tenant roots and role/state contracts; neither is proven to authorize
-- the canonical preschools tenant. No preschool staff-membership table is created
-- here, and no claim or guardian row grants staff access. Server-side enforcement
-- of active staff membership, guardian linkage, claim consumption, signed document
-- access, and state transitions remains intentionally unresolved.
-- Legacy registration_requests policies are intentionally not changed here: their
-- anonymous insert and legacy role predicates require a separate reviewed security
-- migration rather than being silently broadened or removed in this foundation.

COMMIT;
