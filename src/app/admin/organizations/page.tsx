import Link from 'next/link';

import AdminLayout from '@/components/admin/AdminLayout';
import { getServiceRoleClient } from '@/lib/supabase';

export const metadata = {
  title: 'Organizations | EduSitePro Admin',
};

export default async function AdminOrganizationsPage() {
  const supabase = getServiceRoleClient();

  // Fetch only group organizations (not solo plans)
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('*, centres(count)')
    .neq('plan_tier', 'solo') // Solo plans managed via Centres tab
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching organizations:', error);
  }

  // Format the data to include centre count
  const orgsWithCounts = organizations?.map((org) => ({
    ...org,
    centre_count: org.centres?.[0]?.count || 0,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Organizations</h1>
            <p className="text-sm text-stone-600">
              Manage multi-centre organizations and subscriptions
            </p>
          </div>
          <Link
            href="/admin/organizations/new"
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Organization
          </Link>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> Solo plans (single centres) are managed in the{' '}
            <a href="/admin/centres" className="font-semibold underline hover:text-blue-900">
              Centres
            </a>{' '}
            tab. This page shows multi-centre organizations only.
          </p>
        </div>

        {/* Plan Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-stone-600">Group 5</div>
            <div className="mt-1 text-2xl font-bold text-stone-900">
              {orgsWithCounts?.filter((o) => o.plan_tier === 'group_5').length || 0}
            </div>
            <div className="mt-1 text-xs text-stone-500">R799/mo (5 centres)</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-stone-600">Group 10 Plans</div>
            <div className="mt-1 text-2xl font-bold text-stone-900">
              {orgsWithCounts?.filter((o) => o.plan_tier === 'group_10').length || 0}
            </div>
            <div className="mt-1 text-xs text-stone-500">R1,499/mo (10 centres)</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-stone-600">Enterprise</div>
            <div className="mt-1 text-2xl font-bold text-stone-900">
              {orgsWithCounts?.filter((o) => o.plan_tier === 'enterprise').length || 0}
            </div>
            <div className="mt-1 text-xs text-stone-500">Custom pricing</div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="rounded-lg bg-white shadow-sm">
          {!orgsWithCounts || orgsWithCounts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-stone-900">No organizations yet</h3>
              <p className="mb-4 text-sm text-stone-600">
                Create your first organization to get started
              </p>
              <Link
                href="/admin/organizations/new"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Organization
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-stone-200 bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">
                      Centres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-stone-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {orgsWithCounts.map((org: any) => (
                    <tr key={org.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">{org.name}</div>
                        <div className="text-xs text-stone-500">{org.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            org.plan_tier === 'enterprise'
                              ? 'bg-purple-100 text-purple-800'
                              : org.plan_tier === 'group_10'
                                ? 'bg-blue-100 text-blue-800'
                                : org.plan_tier === 'group_5'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {org.plan_tier === 'group_5'
                            ? 'Group 5'
                            : org.plan_tier === 'group_10'
                              ? 'Group 10'
                              : org.plan_tier.charAt(0).toUpperCase() + org.plan_tier.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-900">
                          {org.centre_count} / {org.max_centres === 0 ? '∞' : org.max_centres}
                        </div>
                        <div className="text-xs text-stone-500">
                          {org.max_centres > 0 && org.centre_count >= org.max_centres
                            ? 'Limit reached'
                            : `${org.max_centres === 0 ? 'Unlimited' : org.max_centres - org.centre_count} remaining`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            org.subscription_status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : org.subscription_status === 'trialing'
                                ? 'bg-blue-100 text-blue-800'
                                : org.subscription_status === 'past_due'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {org.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            org.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : org.status === 'suspended'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <Link
                          href={`/admin/organizations/${org.id}`}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
