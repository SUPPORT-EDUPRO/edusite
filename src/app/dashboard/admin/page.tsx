import { headers } from 'next/headers';
import Link from 'next/link';

import AdminLayout from '@/components/admin/AdminLayout';
import { createClient } from '@/lib/auth';
import { BLOCKS } from '@/lib/blocks';
import { getServiceRoleClient } from '@/lib/supabase';

export const metadata = { title: 'Admin | EduSitePro' };

export default async function AdminHome() {
  const supabase = getServiceRoleClient();
  const authSupabase = createClient();
  const headersList = headers();
  
  // Get tenant context from middleware
  const tenantId = headersList.get('x-tenant-id');
  
  // Get user profile
  const { data: { session } } = await authSupabase.auth.getSession();
  const { data: profile } = await authSupabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', session?.user.id)
    .single();

  const isPlatformAdmin = profile?.role === 'superadmin' && !tenantId;

  let stats, quickActions;

  if (isPlatformAdmin) {
    // Platform admin stats - all centres and pages
    const [centresResult, pagesResult] = await Promise.all([
      supabase.from('centres').select('id', { count: 'exact', head: true }),
      supabase.from('pages').select('id', { count: 'exact', head: true }),
    ]);

    const centresCount = centresResult.count || 0;
    const pagesCount = pagesResult.count || 0;
    const blocksCount = Object.keys(BLOCKS).length;

    stats = [
      { label: 'Total Centres', value: String(centresCount), change: 'Active sites', icon: '🏫' },
      { label: 'Active Pages', value: String(pagesCount), change: 'Published content', icon: '📄' },
      {
        label: 'Total Blocks',
        value: String(blocksCount),
        change: 'Available components',
        icon: '🎨',
      },
      { label: 'Templates', value: '6', change: 'NCF-aligned', icon: '📋' },
    ];

    quickActions = [
      {
        href: '/admin/centres',
        title: 'Manage Centres',
        desc: 'Add, edit, or delete ECD centres',
        icon: '🏫',
        color: 'bg-blue-50 text-blue-700',
      },
      {
        href: '/admin/builder',
        title: 'Build Pages',
        desc: 'Create pages with drag-and-drop blocks',
        icon: '🎨',
        color: 'bg-purple-50 text-purple-700',
      },
      {
        href: '/templates',
        title: 'Browse Templates',
        desc: 'Use pre-built NCF-aligned templates',
        icon: '📋',
        color: 'bg-green-50 text-green-700',
      },
      {
        href: '/admin/settings',
        title: 'Settings',
        desc: 'Configure platform and integrations',
        icon: '⚙️',
        color: 'bg-amber-50 text-amber-700',
      },
    ];
  } else {
    // Tenant admin stats - organization specific
    const { data: centre } = await supabase
      .from('centres')
      .select('id, name, domain, plan')
      .eq('organization_id', tenantId)
      .single();

    const [pagesResult, registrationsResult] = await Promise.all([
      supabase.from('pages').select('id', { count: 'exact', head: true }).eq('centre_id', centre?.id),
      supabase.from('registrations').select('id, status', { count: 'exact' }).eq('organization_id', tenantId),
    ]);

    const pagesCount = pagesResult.count || 0;
    const pendingRegistrations = registrationsResult.data?.filter(r => r.status === 'pending').length || 0;
    const approvedRegistrations = registrationsResult.data?.filter(r => r.status === 'approved').length || 0;

    stats = [
      { 
        label: 'Pending Registrations', 
        value: String(pendingRegistrations), 
        change: 'Awaiting review', 
        icon: '📝',
        href: '/admin/registrations?status=pending'
      },
      { 
        label: 'Approved Students', 
        value: String(approvedRegistrations), 
        change: 'Active registrations', 
        icon: '✅',
        href: '/admin/registrations?status=approved'
      },
      {
        label: 'Website Pages',
        value: String(pagesCount),
        change: 'Published pages',
        icon: '📄',
        href: '/admin/content'
      },
      { 
        label: 'Plan', 
        value: centre?.plan || 'Free', 
        change: 'Current plan', 
        icon: '⭐',
        href: '/admin/settings'
      },
    ];

    quickActions = [
      {
        href: '/admin/registrations',
        title: 'Manage Registrations',
        desc: 'Review and approve new students',
        icon: '👥',
        color: 'bg-blue-50 text-blue-700',
      },
      {
        href: '/admin/content',
        title: 'Edit Website',
        desc: 'Update your website content',
        icon: '✏️',
        color: 'bg-purple-50 text-purple-700',
      },
      {
        href: centre?.domain || '/',
        title: 'View Website',
        desc: 'See your live website',
        icon: '🌐',
        color: 'bg-green-50 text-green-700',
        external: true,
      },
      {
        href: '/admin/settings',
        title: 'Settings',
        desc: 'Configure your organization',
        icon: '⚙️',
        color: 'bg-amber-50 text-amber-700',
      },
    ];
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 p-6 sm:p-8 text-white">
          <h2 className="mb-2 text-xl sm:text-2xl font-bold">Welcome to EduSitePro Admin</h2>
          <p className="text-sm sm:text-base text-amber-100">
            Manage ECD centre websites, create content, and deploy updates from one central
            dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xl sm:text-2xl">{stat.icon}</span>
                <span className="text-xs text-stone-500 hidden sm:inline">{stat.change}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900">{stat.value}</div>
              <div className="text-xs sm:text-sm text-stone-600">{stat.label}</div>
              <div className="text-xs text-stone-500 mt-1 sm:hidden">{stat.change}</div>
            </div>
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
                className="group flex items-start gap-3 sm:gap-4 rounded-lg bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              >
                <div
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg ${action.color}`}
                >
                  <span className="text-xl sm:text-2xl">{action.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-amber-600 truncate">
                    {action.title}
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
    </AdminLayout>
  );
}
