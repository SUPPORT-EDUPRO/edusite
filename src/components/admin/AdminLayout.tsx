'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  description?: string;
}

const navigation: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: '📊',
    description: 'Overview and stats',
  },
  {
    href: '/admin/registrations',
    label: 'Registrations',
    icon: '📝',
    description: 'Student applications',
  },
  {
    href: '/admin/organization-requests',
    label: 'Organization Requests',
    icon: '🏫',
    description: 'School registration requests',
  },
  {
    href: '/admin/campaigns',
    label: 'Campaigns',
    icon: '🎟️',
    description: 'Promo codes & discounts',
  },
  {
    href: '/admin/organizations',
    label: 'Organizations',
    icon: '🏢',
    description: 'Multi-centre groups',
  },
  {
    href: '/admin/centres',
    label: 'Centres',
    icon: '🏫',
    description: 'Manage ECD centres',
  },
  {
    href: '/admin/builder',
    label: 'Page Builder',
    icon: '🎨',
    description: 'Build and edit pages',
  },
  {
    href: '/admin/navigation',
    label: 'Navigation',
    icon: '🧭',
    description: 'Customize menu',
  },
  {
    href: '/admin/themes',
    label: 'Themes',
    icon: '🎨',
    description: 'Colors and styles',
  },
  {
    href: '/admin/media',
    label: 'Media Library',
    icon: '📸',
    description: 'Images and files',
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: '⚙️',
    description: 'Site configuration',
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-stone-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-stone-200 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
              <span className="text-lg font-bold">E</span>
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900">EduSitePro</div>
              <div className="text-xs text-stone-500">Admin</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-amber-50 text-amber-900'
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div
                    className={`text-xs ${
                      isActive(item.href) ? 'text-amber-700' : 'text-stone-500'
                    }`}
                  >
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="space-y-2 border-t border-stone-200 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <span className="text-lg">↗️</span>
            <span>View Site</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
          >
            <span className="text-lg">🚪</span>
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-stone-900">
              {navigation.find((item) => isActive(item.href))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Site Button */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Site
            </Link>

            {/* User Menu */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-300"
              title="Account settings"
            >
              A
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
