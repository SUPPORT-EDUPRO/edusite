import type { SupabaseClient } from '@supabase/supabase-js';

import {
  evaluateRegistrationCampaignCode,
  MARKETING_CAMPAIGN_PUBLIC_COLUMNS,
  type MarketingCampaignRow,
  type RegistrationCampaignView,
  selectActiveRegistrationCampaign,
  selectSiblingRegistrationCampaign,
} from '@/lib/registration-campaign';
import { YOUNG_EAGLES_REGISTRATION_FEE_RAND } from '@/lib/young-eagles-fees';

type CampaignQueryClient = Pick<SupabaseClient, 'from'>;

async function loadOrganizationCampaigns(
  client: CampaignQueryClient,
  organizationId: string,
): Promise<MarketingCampaignRow[]> {
  if (!organizationId) return [];

  const { data, error } = await client
    .from('marketing_campaigns')
    .select(MARKETING_CAMPAIGN_PUBLIC_COLUMNS)
    .eq('organization_id', organizationId)
    .eq('active', true);

  if (error || !Array.isArray(data)) return [];
  return data as MarketingCampaignRow[];
}

export async function loadActiveRegistrationCampaign(
  client: CampaignQueryClient,
  organizationId: string,
  now = new Date(),
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): Promise<RegistrationCampaignView | null> {
  const rows = await loadOrganizationCampaigns(client, organizationId);
  return selectActiveRegistrationCampaign(rows, organizationId, now, baseFeeRand);
}

export async function loadSiblingRegistrationCampaign(
  client: CampaignQueryClient,
  organizationId: string,
  now = new Date(),
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): Promise<RegistrationCampaignView | null> {
  const rows = await loadOrganizationCampaigns(client, organizationId);
  return selectSiblingRegistrationCampaign(rows, organizationId, now, baseFeeRand);
}

export async function loadRegistrationCampaignByCode(
  client: CampaignQueryClient,
  organizationId: string,
  code: string,
  now = new Date(),
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): Promise<RegistrationCampaignView | null> {
  const evaluation = await evaluateRegistrationCampaignForOrg(
    client,
    organizationId,
    code,
    now,
    baseFeeRand,
  );
  return evaluation.view;
}

export async function evaluateRegistrationCampaignForOrg(
  client: CampaignQueryClient,
  organizationId: string,
  code: string,
  now = new Date(),
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
) {
  const rows = await loadOrganizationCampaigns(client, organizationId);
  return evaluateRegistrationCampaignCode(rows, organizationId, code, now, baseFeeRand);
}
