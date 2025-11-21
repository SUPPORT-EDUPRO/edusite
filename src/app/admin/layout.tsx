import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation session={session} profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function AdminNavigation({ session, profile }: any) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <a href="/admin" className="text-xl font-bold text-amber-600">
              EduSitePro Admin
            </a>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="/admin" className="text-gray-700 hover:text-amber-600">
                Dashboard
              </a>
              <a href="/admin/registrations" className="text-gray-700 hover:text-amber-600">
                Registrations
              </a>
              <a href="/admin/centres" className="text-gray-700 hover:text-amber-600">
                Centres
              </a>
              <a href="/admin/pages" className="text-gray-700 hover:text-amber-600">
                Pages
              </a>
              <a href="/admin/settings" className="text-gray-700 hover:text-amber-600">
                Settings
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile?.full_name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500">
                {session.user.email}
              </p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
