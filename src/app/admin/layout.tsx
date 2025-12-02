import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const headersList = headers();
  
  // Get tenant ID from middleware header
  const tenantId = headersList.get('x-tenant-id');
  const tenantSlug = headersList.get('x-organization-slug');

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If not logged in, redirect to login page
  if (!session) {
    redirect('/login');
  }

  // Get user's profile to check if they have admin access
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, preschool_id, organization_id')
    .eq('id', session.user.id)
    .single();

  // Check if user has admin/principal role
  const adminRoles = ['superadmin', 'principal', 'principal_admin', 'admin'];
  const hasAdminAccess = profile && adminRoles.includes(profile.role);

  // If user doesn't have admin role, show error
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have admin access. Only principals and administrators can access this area.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Your role: <strong>{profile?.role || 'none'}</strong></p>
            <a
              href="/"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Determine if this is platform admin or tenant admin
  const isPlatformAdmin = profile.role === 'superadmin';
  
  // If tenant admin without tenantId in URL, redirect to their org's admin panel
  if (!isPlatformAdmin && !tenantId && profile.organization_id) {
    // Get organization slug and redirect
    const { data: org } = await supabase
      .from('organizations')
      .select('slug')
      .eq('id', profile.organization_id)
      .single();
    
    if (org?.slug) {
      redirect(`https://${org.slug}.edusitepro.edudashpro.org.za/admin`);
    }
  }
  
  // Check if user has access to this specific tenant
  const isTenantAdmin = tenantId ? profile.organization_id === tenantId : false;

  // If accessing a tenant admin panel and don't have access, show error
  if (tenantId && !isPlatformAdmin && !isTenantAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have access to this organization's admin panel.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Your role: <strong>{profile?.role || 'none'}</strong></p>
            <p className="text-sm text-gray-500">Your org: <strong>{profile?.organization_id || 'none'}</strong></p>
            <p className="text-sm text-gray-500">Required org: <strong>{tenantId}</strong></p>
          </div>
          <a
            href="/"
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Get organization name for tenant admins
  let organizationName = 'EduSitePro Admin';
  if (isTenantAdmin) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', tenantId)
      .single();
    organizationName = org?.name || 'Admin';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation 
        session={session} 
        profile={profile} 
        isPlatformAdmin={isPlatformAdmin}
        organizationName={organizationName}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}

function AdminNavigation({ session, profile, isPlatformAdmin, organizationName }: any) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Left: Logo and Desktop Nav */}
          <div className="flex items-center gap-4 sm:gap-8 flex-1">
            <a href="/admin" className="text-lg sm:text-xl font-bold text-amber-600 whitespace-nowrap">
              {organizationName}
            </a>
            
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              <a href="/admin" className="text-sm text-gray-700 hover:text-amber-600 transition-colors">
                Dashboard
              </a>
              <a href="/admin/registrations" className="text-sm text-gray-700 hover:text-amber-600 transition-colors">
                Registrations
              </a>
              {isPlatformAdmin && (
                <>
                  <a href="/admin/centres" className="text-sm text-gray-700 hover:text-amber-600 transition-colors">
                    Centres
                  </a>
                  <a href="/admin/pages" className="text-sm text-gray-700 hover:text-amber-600 transition-colors">
                    Pages
                  </a>
                </>
              )}
              {!isPlatformAdmin && (
                <a href="/admin/content" className="text-sm text-gray-700 hover:text-amber-600 transition-colors">
                  Content
                </a>
              )}
              <a href="/admin/settings" className="text-sm text-gray-700 hover:text-amber-600 transition-colors">
                Settings
              </a>
            </div>
          </div>

          {/* Right: User info and sign out */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                {session.user.email}
              </p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="lg:hidden border-t border-gray-200 py-3 overflow-x-auto">
          <div className="flex items-center gap-4 min-w-max">
            <a href="/admin" className="text-sm text-gray-700 hover:text-amber-600 whitespace-nowrap">
              Dashboard
            </a>
            <a href="/admin/registrations" className="text-sm text-gray-700 hover:text-amber-600 whitespace-nowrap">
              Registrations
            </a>
            {isPlatformAdmin && (
              <>
                <a href="/admin/centres" className="text-sm text-gray-700 hover:text-amber-600 whitespace-nowrap">
                  Centres
                </a>
                <a href="/admin/pages" className="text-sm text-gray-700 hover:text-amber-600 whitespace-nowrap">
                  Pages
                </a>
              </>
            )}
            {!isPlatformAdmin && (
              <a href="/admin/content" className="text-sm text-gray-700 hover:text-amber-600 whitespace-nowrap">
                Content
              </a>
            )}
            <a href="/admin/settings" className="text-sm text-gray-700 hover:text-amber-600 whitespace-nowrap">
              Settings
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
