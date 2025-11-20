import Link from 'next/link';

import AdminLayout from '@/components/admin/AdminLayout';
import { TENANT_BASE_DOMAIN } from '@/lib/config';
import { getServiceRoleClient } from '@/lib/supabase';

export const metadata = {
  title: 'Centres | EduSitePro Admin',
};

interface Centre {
  id: string;
  slug: string;
  name: string;
  primary_domain: string | null;
  status: string;
  plan_tier: string | null;
  created_at: string;
}

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

function qp(v: unknown): string | undefined {
  return Array.isArray(v) ? v[0] : (v as string | undefined);
}

export default async function AdminCentresPage({ searchParams }: PageProps) {
  const supabase = getServiceRoleClient();

  // Parse filters
  const q = qp(searchParams?.q)?.trim();
  const status = qp(searchParams?.status)?.trim();
  const plan = qp(searchParams?.plan)?.trim();
  const sort = qp(searchParams?.sort) || 'created_at:desc';
  const page = Math.max(1, Number(qp(searchParams?.page) || '1'));
  const limit = Math.min(50, Math.max(5, Number(qp(searchParams?.limit) || '10')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Base query with filters
  let listQuery = supabase
    .from('centres')
    .select('id, slug, name, primary_domain, status, plan_tier, created_at', { count: 'exact' });

  if (q) {
    listQuery = listQuery.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }
  if (status) listQuery = listQuery.eq('status', status);
  if (plan) listQuery = listQuery.eq('plan_tier', plan);

  // Sorting (apply before pagination to ensure correct page window)
  const [sortColRaw, directionRaw] = sort.split(':');
  const validSort = ['created_at', 'name', 'status'] as const;
  const sortCol = (sortColRaw || 'created_at') as string;
  const col = (validSort as readonly string[]).includes(sortCol) ? sortCol : 'created_at';
  const asc = (directionRaw || 'desc').toLowerCase() === 'asc';
  listQuery = listQuery.order(col as any, { ascending: asc, nullsFirst: !asc });

  // Pagination window last
  listQuery = listQuery.range(from, to);

  const { data: centres, error, count } = await listQuery;
  if (error) console.error('Error fetching centres:', error);
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const makeUrl = (params: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    if (q) usp.set('q', q);
    if (status) usp.set('status', status);
    if (plan) usp.set('plan', plan);
    if (sort) usp.set('sort', sort);
    usp.set('page', params.page || String(page));
    usp.set('limit', String(limit));
    return `/admin/centres?${usp.toString()}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Centres</h1>
            <p className="text-sm text-stone-600">Manage ECD centre websites</p>
          </div>
          <Link
            href="/admin/centres/new"
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Centre
          </Link>
        </div>

        {/* Filters */}
        <form className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-stone-600">Search</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Name or slug"
              className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-stone-600">Status</label>
            <select
              name="status"
              defaultValue={status || ''}
              className="rounded-md border border-stone-300 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-stone-600">Plan</label>
            <select name="plan" defaultValue={plan || ''} className="rounded-md border border-stone-300 px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="solo">Solo</option>
              <option value="group_5">Group 5</option>
              <option value="group_10">Group 10</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-stone-600">Sort</label>
            <select name="sort" defaultValue={sort} className="rounded-md border border-stone-300 px-3 py-2 text-sm">
              <option value="created_at:desc">Newest</option>
              <option value="created_at:asc">Oldest</option>
              <option value="name:asc">Name A→Z</option>
              <option value="name:desc">Name Z→A</option>
              <option value="status:asc">Status</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/centres"
              className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              Clear
            </Link>
            <button
              type="submit"
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Centres List */}
        <div className="rounded-lg bg-white shadow-sm">
          {!centres || centres.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <span className="text-3xl">🏫</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-stone-900">No centres found</h3>
              <p className="mb-4 text-sm text-stone-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-stone-200 bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">Domain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-700 uppercase">Plan</th>
                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-stone-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {centres.map((centre: Centre) => (
                    <tr key={centre.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">{centre.name}</div>
                        <div className="text-xs text-stone-500">{new Date(centre.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-600">{centre.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-600">
                          {centre.primary_domain || `${centre.slug}.${TENANT_BASE_DOMAIN}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            centre.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : centre.status === 'suspended'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {centre.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-600">{centre.plan_tier || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <Link href={`/admin/centres/${centre.id}`} className="text-amber-600 hover:text-amber-700">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-stone-200 p-4 text-sm text-stone-700">
            <div>
              Showing {centres?.length || 0} of {total} centres
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={makeUrl({ page: String(Math.max(1, page - 1)) })}
                className={`rounded border px-3 py-1 ${page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-stone-50'}`}
              >
                Prev
              </Link>
              <span>
                Page {page} of {totalPages}
              </span>
              <Link
                href={makeUrl({ page: String(Math.min(totalPages, page + 1)) })}
                className={`rounded border px-3 py-1 ${page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-stone-50'}`}
              >
                Next
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
