import { notFound, redirect } from 'next/navigation';

import AdminLayout from '@/components/admin/AdminLayout';
import { getServiceRoleClient } from '@/lib/supabase';

import { EditOrganizationForm } from './EditOrganizationForm';

export const metadata = {
  title: 'Edit Organization | EduSitePro Admin',
};

async function updateOrganization(
  orgId: string,
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

  // Check if downgrading and validate centre count
  const { data: org } = await supabase
    .from('organizations')
    .select('id, centres(count)')
    .eq('id', orgId)
    .single();

  const centreCount = org?.centres?.[0]?.count || 0;

  if (maxCentres > 0 && centreCount > maxCentres) {
    return {
      error: `Cannot downgrade: Organization has ${centreCount} centres but ${planTier} plan allows only ${maxCentres}. Please archive centres first.`,
    };
  }

  // Update organization
  const { error } = await supabase
    .from('organizations')
    .update({
      name,
      slug,
      plan_tier: planTier,
      max_centres: maxCentres,
      primary_contact_name: primaryContactName,
      primary_contact_email: primaryContactEmail,
      primary_contact_phone: primaryContactPhone,
      billing_email: billingEmail,
      status,
    })
    .eq('id', orgId);

  if (error) {
    console.error('Error updating organization:', error);
    return { error: error.message };
  }

  redirect('/admin/organizations');
}

async function deleteOrganization(orgId: string) {
  'use server';

  const supabase = getServiceRoleClient();

  // Check if organization has centres
  const { data: org } = await supabase
    .from('organizations')
    .select('centres(count)')
    .eq('id', orgId)
    .single();

  const centreCount = org?.centres?.[0]?.count || 0;

  if (centreCount > 0) {
    throw new Error(
      `Cannot delete organization with ${centreCount} centres. Please delete or move centres first.`,
    );
  }

  const { error } = await supabase.from('organizations').delete().eq('id', orgId);

  if (error) {
    console.error('Error deleting organization:', error);
    throw new Error(error.message);
  }

  redirect('/admin/organizations');
}

export default async function EditOrganizationPage({ params }: { params: { id: string } }) {
  const supabase = getServiceRoleClient();

  // Fetch organization data with centre count
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*, centres(id, name, slug, status)')
    .eq('id', params.id)
    .single();

  if (error || !organization) {
    notFound();
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Edit Organization</h1>
          <p className="text-sm text-stone-600">Update organization details or delete</p>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <EditOrganizationForm
            organization={organization}
            updateOrganization={updateOrganization.bind(null, params.id)}
            deleteOrganization={deleteOrganization.bind(null, params.id)}
          />
        </div>

        {/* Centres List */}
        {organization.centres && organization.centres.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-stone-900">
              Centres ({organization.centres.length})
            </h3>
            <div className="space-y-2">
              {organization.centres.map((centre: any) => (
                <div
                  key={centre.id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 p-3"
                >
                  <div>
                    <div className="font-medium text-stone-900">{centre.name}</div>
                    <div className="text-xs text-stone-500">{centre.slug}</div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      centre.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {centre.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
