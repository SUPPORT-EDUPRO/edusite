'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface TenantDashboardLayoutProps {
  children: ReactNode;
  session: any;
  profile: any;
  organization: any;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  description?: string;
}

const navigation: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Overview and stats',
  },
  {
    href: '/dashboard/registrations',
    label: 'Registrations',
    icon: '👥',
    description: 'Student applications',
  },
  {
    href: '/dashboard/campaigns',
    label: 'Campaigns',
    icon: '🎯',
    description: 'Marketing campaigns',
  },
  {
    href: '/dashboard/content',
    label: 'Website Content',
    icon: '✏️',
    description: 'Edit your website',
  },
  {
    href: '/dashboard/pages',
    label: 'Pages',
    icon: '📄',
    description: 'Manage pages',
  },
  {
    href: '/dashboard/media',
    label: 'Media Library',
    icon: '📸',
    description: 'Images and files',
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: '⚙️',
    description: 'Organization settings',
  },
];

export default function TenantDashboardLayout({ 
  children, 
  session, 
  profile, 
  organization 
}: TenantDashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
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
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform lg:static lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-stone-200 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
              <span className="text-lg font-bold">{organization?.name?.[0] || 'Y'}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900 truncate max-w-[140px]">
                {organization?.name || 'Dashboard'}
              </div>
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
              onClick={() => setMobileMenuOpen(false)}
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
            href={organization?.custom_domain ? `https://${organization.custom_domain}` : '/'}
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <span className="text-lg">🌐</span>
            <span>View Website</span>
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
        <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-stone-900 lg:text-lg">
              {navigation.find((item) => isActive(item.href))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-stone-900 truncate max-w-[120px] lg:max-w-none">{profile?.full_name || 'Admin'}</div>
                <div className="text-xs text-stone-500 truncate max-w-[120px] lg:max-w-none">{session?.user?.email}</div>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-300"
                title="Account settings"
              >
                {profile?.full_name?.[0]?.toUpperCase() || 'A'}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
