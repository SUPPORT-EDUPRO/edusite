import { headers } from 'next/headers';
import Link from 'next/link';

import { createClient } from '@/lib/auth';
import { getServiceRoleClient } from '@/lib/supabase';

export const metadata = { title: 'Dashboard | Young Eagles' };

export default async function TenantDashboard() {
  const supabase = getServiceRoleClient();
  const authSupabase = createClient();
  const headersList = headers();
  
  // Get tenant context from middleware
  const tenantId = headersList.get('x-tenant-id');
  
  if (!tenantId) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-gray-600 mt-2">No organization context found.</p>
      </div>
    );
  }

  // Get organization info
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', tenantId)
    .single();

  // Get centre info
  const { data: centre } = await supabase
    .from('centres')
    .select('id, name, domain, plan')
    .eq('organization_id', tenantId)
    .single();

  // Get registration stats
  const { data: registrations } = await supabase
    .from('registration_requests')
    .select('id, status')
    .eq('organization_id', tenantId);

  const pendingCount = registrations?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = registrations?.filter(r => r.status === 'approved').length || 0;
  const totalCount = registrations?.length || 0;

  // Get pages count
  const { count: pagesCount } = await supabase
    .from('pages')
    .select('id', { count: 'exact', head: true })
    .eq('centre_id', centre?.id);

  const stats = [
    { 
      label: 'Pending Registrations', 
      value: String(pendingCount), 
      change: 'Awaiting review', 
      icon: '⏳',
      href: '/dashboard/registrations?status=pending',
      color: 'bg-yellow-50 text-yellow-700'
    },
    { 
      label: 'Approved Students', 
      value: String(approvedCount), 
      change: 'Active registrations', 
      icon: '✅',
      href: '/dashboard/registrations?status=approved',
      color: 'bg-green-50 text-green-700'
    },
    {
      label: 'Total Applications',
      value: String(totalCount),
      change: 'All time',
      icon: '📋',
      href: '/dashboard/registrations',
      color: 'bg-blue-50 text-blue-700'
    },
    { 
      label: 'Website Pages', 
      value: String(pagesCount || 0), 
      change: 'Published pages', 
      icon: '📄',
      href: '/dashboard/pages',
      color: 'bg-purple-50 text-purple-700'
    },
  ];

  const quickActions = [
    {
      href: '/dashboard/registrations',
      title: 'Manage Registrations',
      desc: 'Review and approve new student applications',
      icon: '👥',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      href: '/dashboard/content',
      title: 'Edit Website',
      desc: 'Update your website content and pages',
      icon: '✏️',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      href: centre?.domain || organization?.custom_domain || '/',
      title: 'View Live Website',
      desc: 'See your public website',
      icon: '🌐',
      color: 'bg-green-50 text-green-700',
      external: true,
    },
    {
      href: '/dashboard/settings',
      title: 'Settings',
      desc: 'Configure your organization',
      icon: '⚙️',
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 p-6 sm:p-8 text-white">
        <h2 className="mb-2 text-xl sm:text-2xl font-bold">Welcome back!</h2>
        <p className="text-sm sm:text-base text-amber-100">
          Manage your school's website, review student registrations, and track your online presence.
        </p>
        {organization?.name && (
          <p className="mt-3 text-sm font-semibold">{organization.name}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-xl sm:text-2xl px-2 py-1 rounded ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900">{stat.value}</div>
            <div className="text-xs sm:text-sm text-stone-600">{stat.label}</div>
            <div className="text-xs text-stone-500 mt-1">{stat.change}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-stone-900">Quick Actions</h3>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              className="group flex items-start gap-3 sm:gap-4 rounded-lg bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg ${action.color}`}
              >
                <span className="text-xl sm:text-2xl">{action.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-amber-600 truncate flex items-center gap-2">
                  {action.title}
                  {action.external && <span className="text-xs">↗</span>}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 line-clamp-2">{action.desc}</p>
              </div>
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-stone-400 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div>
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-stone-900">Recent Activity</h3>
        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
          <p className="text-sm text-stone-500">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}
