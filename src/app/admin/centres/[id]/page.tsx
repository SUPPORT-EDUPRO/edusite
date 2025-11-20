import { notFound, redirect } from 'next/navigation';

import AdminLayout from '@/components/admin/AdminLayout';
import { getServiceRoleClient } from '@/lib/supabase';

import { EditCentreForm } from './EditCentreForm';

export const metadata = {
  title: 'Edit Centre | EduSitePro Admin',
};

async function updateCentre(
  centreId: string,
  prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  'use server';

  const slug = formData.get('slug') as string;
  const name = formData.get('name') as string;
  const primaryDomain = (formData.get('primary_domain') as string) || null;
  const contactEmail = (formData.get('contact_email') as string) || null;
  const contactPhone = (formData.get('contact_phone') as string) || null;
  const planTier = (formData.get('plan_tier') as string) || null;
  const status = (formData.get('status') as string) || 'active';

  // Validation
  if (!slug || !name) {
    return { error: 'Slug and name are required' };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'Slug must only contain lowercase letters, numbers, and hyphens' };
  }

  const supabase = getServiceRoleClient();

  // Update centre
  const { error } = await supabase
    .from('centres')
    .update({
      slug,
      name,
      primary_domain: primaryDomain,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      plan_tier: planTier,
      status,
      default_subdomain: `${slug}.sites.edusitepro.co.za`,
    })
    .eq('id', centreId);

  if (error) {
    console.error('Error updating centre:', error);
    return { error: error.message };
  }

  redirect('/admin/centres');
}

async function deleteCentre(centreId: string) {
  'use server';

  const supabase = getServiceRoleClient();

  const { error } = await supabase.from('centres').delete().eq('id', centreId);

  if (error) {
    console.error('Error deleting centre:', error);
    throw new Error(error.message);
  }

  redirect('/admin/centres');
}

export default async function EditCentrePage({ params }: { params: { id: string } }) {
  const supabase = getServiceRoleClient();

  // Fetch centre data
  const { data: centre, error } = await supabase
    .from('centres')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !centre) {
    notFound();
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Edit Centre</h1>
          <p className="text-sm text-stone-600">Update centre information or delete</p>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <EditCentreForm
            centre={centre}
            updateCentre={updateCentre.bind(null, params.id)}
            deleteCentre={deleteCentre.bind(null, params.id)}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
