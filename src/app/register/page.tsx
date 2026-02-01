import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

import { PromoBanner } from '@/components/PromoBanner';
import { PublicRegistrationForm } from '@/components/registration/PublicRegistrationForm';

export const dynamic = 'force-dynamic';

function srClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const keyToUse = serviceKey || anonKey!;
  return createClient(url, keyToUse, { auth: { persistSession: false } });
}

export default async function RegistrationPage() {
  // Get tenant ID from middleware (or env fallback in dev)
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  let tenantId = headersList.get('x-tenant-id');
  if (!tenantId && (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1'))) {
    tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID || tenantId;
  }

  if (!tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            Unable to identify organization. Please access this page via your school&apos;s domain.
          </p>
        </div>
      </div>
    );
  }

  // Get Supabase client with service role for RLS bypass
  const supabase = srClient();

  // Fetch organization details
  let { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select(
      `id, name, slug, school_code, organization_type, logo_url, primary_color, secondary_color,
       website_url, registration_open, registration_message, min_age, max_age, grade_levels,
       contact_email, contact_phone, address, form_config`
    )
    .eq('id', tenantId)
    .single();

  // Dev fallback: if lookup by header failed, try env ID once more
  if ((orgError || !organization) && (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1'))) {
    const devId = process.env.NEXT_PUBLIC_DEV_TENANT_ID;
    if (devId && devId !== tenantId) {
      const retry = await supabase
        .from('organizations')
        .select(
          `id, name, slug, school_code, organization_type, logo_url, primary_color, secondary_color,
           website_url, registration_open, registration_message, min_age, max_age, grade_levels,
           contact_email, contact_phone, address, form_config`
        )
        .eq('id', devId)
        .single();
      organization = retry.data as any;
      orgError = retry.error as any;
    }
  }

  if (orgError || !organization) {
    console.error('[Registration] Organization not found:', { tenantId, error: orgError });
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800 max-w-lg">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Not Found</h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            We couldn’t load the registration form for this request.
            Please use your school’s link (e.g. yourschool.co.za/register) or visit the school
            site and click Enroll.
          </p>
          <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
            <div>Request ID: {tenantId || 'none'}</div>
            <div>Hint: Ensure middleware maps this domain to a valid organization.</div>
          </div>
        </div>
      </div>
    );
  }

  // Check if registration is open
  if (!organization.registration_open) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Closed</h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {organization.registration_message || 
             'Registration is currently closed. Please check back later or contact us for more information.'}
          </p>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Contact: {organization.contact_email}</p>
            <p>Phone: {organization.contact_phone}</p>
          </div>
        </div>
      </div>
    );
  }

  const nowIso = new Date().toISOString();

  const { data: registrationFeeRow } = await supabase
    .from('organization_fee_structures')
    .select('amount')
    .eq('organization_id', organization.id)
    .eq('fee_type', 'registration_fee')
    .eq('active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: activeCampaign } = await supabase
    .from('marketing_campaigns')
    .select(
      'id, name, description, discount_type, discount_value, promo_code, max_redemptions, current_redemptions, start_date, end_date, active, featured'
    )
    .eq('organization_id', organization.id)
    .eq('active', true)
    .not('promo_code', 'is', null)
    .lte('start_date', nowIso)
    .gte('end_date', nowIso)
    .order('featured', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const formProps = {
    organizationId: organization.id,
    schoolCode: organization.school_code,
    schoolName: organization.name,
    initialBranding: organization,
    registrationFee: registrationFeeRow?.amount ?? 200,
    activeCampaign: activeCampaign || null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Promotional Banner */}
      {activeCampaign?.promo_code && (
        <PromoBanner 
          code={activeCampaign.promo_code} 
          discountValue={activeCampaign.discount_value || 0}
          discountType={activeCampaign.discount_type}
          endDate={activeCampaign.end_date}
        />
      )}
      
      {/* Registration Form */}
      <div className="py-12">
        <PublicRegistrationForm {...formProps} />
      </div>
    </div>
  );
}
