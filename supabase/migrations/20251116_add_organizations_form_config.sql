-- Add form_config JSONB column to organizations for configurable public registration fields
-- This column stores per-tenant flags such as showDetailedParentInfo, showSecondaryGuardian, etc.
-- Safe to run multiple times due to IF NOT EXISTS

alter table if exists public.organizations
  add column if not exists form_config jsonb;

comment on column public.organizations.form_config is
  'JSONB configuration for public registration form visibility flags: { showDetailedParentInfo, showSecondaryGuardian, showTransport, showMealPlan, showDoctorInfo, showEmergencyContact }';
