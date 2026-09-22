import { PublicRegistrationForm } from '@/components/registration/PublicRegistrationForm';
import { loadActiveRegistrationCampaign } from '@/lib/load-registration-campaign';
import { supabase } from '@/lib/supabase';
import {
  YOUNG_EAGLES_BRANDING,
  YOUNG_EAGLES_ORGANIZATION_ID,
  YOUNG_EAGLES_SCHOOL_CODE,
  YOUNG_EAGLES_SCHOOL_NAME,
  YOUNG_EAGLES_SLUG,
} from '@/lib/young-eagles-registration';

export default async function YoungEaglesRegistration() {
  const initialCampaign = await loadActiveRegistrationCampaign(
    supabase,
    YOUNG_EAGLES_ORGANIZATION_ID,
  );

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/schools/young-eagles-bg.avif)' }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40" />

      <div className="relative z-10 h-full overflow-y-auto">
        <div className="min-h-full py-8">
          <PublicRegistrationForm
            organizationId={YOUNG_EAGLES_ORGANIZATION_ID}
            schoolCode={YOUNG_EAGLES_SCHOOL_CODE}
            schoolName={YOUNG_EAGLES_SCHOOL_NAME}
            slug={YOUNG_EAGLES_SLUG}
            initialBranding={YOUNG_EAGLES_BRANDING}
            initialCampaign={initialCampaign}
          />
        </div>
      </div>
    </div>
  );
}
