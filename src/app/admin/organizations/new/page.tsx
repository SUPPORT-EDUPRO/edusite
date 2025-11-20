import { redirect } from 'next/navigation';

import AdminLayout from '@/components/admin/AdminLayout';
import { getServiceRoleClient } from '@/lib/supabase';

import { OrganizationForm } from './OrganizationForm';

export const metadata = {
  title: 'New Organization | EduSitePro Admin',
};

async function createOrganization(
  prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  'use server';

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const planTier = formData.get('plan_tier') as string;
  const primaryContactName = (formData.get('primary_contact_name') as string) || null;
  const primaryContactEmail = (formData.get('primary_contact_email') as string) || null;
  const primaryContactPhone = (formData.get('primary_contact_phone') as string) || null;
  const billingEmail = (formData.get('billing_email') as string) || null;
  const status = (formData.get('status') as string) || 'active';

  // Validation
  if (!name || !slug || !planTier) {
    return { error: 'Name, slug, and plan tier are required' };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'Slug must only contain lowercase letters, numbers, and hyphens' };
  }

  // Calculate max_centres based on plan
  let maxCentres = 1;
  if (planTier === 'group_5') maxCentres = 5;
  else if (planTier === 'group_10') maxCentres = 10;
  else if (planTier === 'enterprise') maxCentres = 0; // unlimited

  const supabase = getServiceRoleClient();

  // Create organization
  const { error } = await supabase.from('organizations').insert({
    name,
    slug,
    plan_tier: planTier,
    max_centres: maxCentres,
    primary_contact_name: primaryContactName,
    primary_contact_email: primaryContactEmail,
    primary_contact_phone: primaryContactPhone,
    billing_email: billingEmail,
    status,
    subscription_status: 'trialing', // Start with trial
  });

  if (error) {
    console.error('Error creating organization:', error);
    return { error: error.message };
  }

  redirect('/admin/organizations');
}

export default function NewOrganizationPage() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Create New Organization</h1>
          <p className="text-sm text-stone-600">Add a new multi-centre organization</p>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <OrganizationForm createOrganization={createOrganization} />
        </div>
      </div>
    </AdminLayout>
  );
}
