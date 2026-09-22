import { YoungEagles2027RegistrationPreview } from '@/components/registration/YoungEagles2027RegistrationPreview';
import {
  loadActiveRegistrationCampaign,
  loadSiblingRegistrationCampaign,
} from '@/lib/load-registration-campaign';
import { supabase } from '@/lib/supabase';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

export default async function YoungEaglesRegistration() {
  const [initialCampaign, siblingCampaign] = await Promise.all([
    loadActiveRegistrationCampaign(supabase, YOUNG_EAGLES_ORGANIZATION_ID),
    loadSiblingRegistrationCampaign(supabase, YOUNG_EAGLES_ORGANIZATION_ID),
  ]);

  return (
    <YoungEagles2027RegistrationPreview
      activeCampaign={initialCampaign}
      mode="live"
      organizationId={YOUNG_EAGLES_ORGANIZATION_ID}
      siblingCampaign={siblingCampaign}
    />
  );
}
