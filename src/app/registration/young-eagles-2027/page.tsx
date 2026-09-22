import type { Metadata } from 'next';

import { YoungEagles2027RegistrationPreview } from '@/components/registration/YoungEagles2027RegistrationPreview';
import { loadActiveRegistrationCampaign } from '@/lib/load-registration-campaign';
import { supabase } from '@/lib/supabase';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

export const metadata: Metadata = {
  title: 'Young Eagles 2027 registration | EduSitePro',
  description: 'Register your child for the 2027 academic year at Young Eagles Preschool.',
};

export default async function YoungEagles2027RegistrationPage() {
  const activeCampaign = await loadActiveRegistrationCampaign(
    supabase,
    YOUNG_EAGLES_ORGANIZATION_ID,
  );

  return <YoungEagles2027RegistrationPreview activeCampaign={activeCampaign} />;
}
