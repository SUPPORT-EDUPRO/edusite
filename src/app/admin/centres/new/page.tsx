import AdminLayout from '@/components/admin/AdminLayout';
import { getServiceRoleClient } from '@/lib/supabase';

import CentreWizard from './CentreWizard';

export const metadata = {
  title: 'New Centre | EduSitePro Admin',
};

export default async function NewCentrePage() {
  // Fetch organizations with usage counts for selection
  const supabase = getServiceRoleClient();
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug, plan_tier, max_centres, status, centres(count)')
    .order('created_at', { ascending: false });

  const organizations = (orgs || []).map((o: any) => ({
    id: o.id as string,
    name: o.name as string,
    slug: o.slug as string,
    plan_tier: o.plan_tier as 'solo' | 'group_5' | 'group_10' | 'enterprise',
    max_centres: (o.max_centres as number) ?? 1,
    status: (o.status as string) ?? 'active',
    centre_count: o.centres?.[0]?.count ?? 0,
  }));

  async function provisionCentre(input: {
    name: string;
    slug: string;
    plan_tier: 'solo' | 'group_5' | 'group_10' | 'enterprise';
    organization_id?: string | null;
    primary_domain?: string | null;
  }) {
    'use server';
    const token = process.env.INTERNAL_ADMIN_TOKEN;
    if (!token) {
      return { ok: false as const, error: 'Missing INTERNAL_ADMIN_TOKEN' };
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
      const res = await fetch(`${baseUrl}/api/admin/centres/provision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          INTERNAL_ADMIN_TOKEN: token,
        },
        body: JSON.stringify({
          name: input.name.trim(),
          slug: input.slug,
          plan_tier: input.plan_tier,
          organization_id: input.organization_id || undefined,
          primary_domain: input.primary_domain || undefined,
        }),
      });
      if (!res.ok) {
        let msg = 'Provisioning failed';
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        if (res.status === 409) msg = 'Slug already exists';
        return { ok: false as const, error: msg };
      }
      const data = await res.json();
      return { ok: true as const, preview_url: data.preview_url as string | undefined };
    } catch (e: any) {
      return { ok: false as const, error: e?.message || 'Provisioning failed' };
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Create New Centre</h1>
          <p className="text-sm text-stone-600">Provision a new ECD centre website</p>
        </div>

        {/* Wizard */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <CentreWizard provisionCentre={provisionCentre} organizations={organizations} />
        </div>
      </div>
    </AdminLayout>
  );
}
