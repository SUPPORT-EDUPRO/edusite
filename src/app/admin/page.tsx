import Link from 'next/link';

import AdminLayout from '@/components/admin/AdminLayout';
import { BLOCKS } from '@/lib/blocks';
import { getServiceRoleClient } from '@/lib/supabase';

export const metadata = { title: 'Admin | EduSitePro' };

export default async function AdminHome() {
  // Use service role client to bypass RLS for admin operations
  const supabase = getServiceRoleClient();

  // Fetch real stats from database
  const [centresResult, pagesResult] = await Promise.all([
    supabase.from('centres').select('id', { count: 'exact', head: true }),
    supabase.from('pages').select('id', { count: 'exact', head: true }),
  ]);

  const centresCount = centresResult.count || 0;
  const pagesCount = pagesResult.count || 0;
  const blocksCount = Object.keys(BLOCKS).length;

  const stats = [
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

  const quickActions = [
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 p-8 text-white">
          <h2 className="mb-2 text-2xl font-bold">Welcome to EduSitePro Admin</h2>
          <p className="text-amber-100">
            Manage ECD centre websites, create content, and deploy updates from one central
            dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-xs text-stone-500">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-stone-900">{stat.value}</div>
              <div className="text-sm text-stone-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-stone-900">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-start gap-4 rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.color}`}
                >
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-900 group-hover:text-amber-600">
                    {action.title}
                  </h4>
                  <p className="text-sm text-stone-600">{action.desc}</p>
                </div>
                <svg
                  className="h-5 w-5 text-stone-400 transition-transform group-hover:translate-x-1"
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
          <h3 className="mb-4 text-lg font-semibold text-stone-900">Recent Activity</h3>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
