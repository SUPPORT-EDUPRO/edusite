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

  // Get user's organization(s)
  const { data: userOrgs } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', session.user.id);

  // If user has no organization access, show error
  if (!userOrgs || userOrgs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have access to any organization. Please contact your administrator.
          </p>
          <a
            href="/api/auth/signout"
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign Out
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation session={session} userOrgs={userOrgs} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function AdminNavigation({ session, userOrgs }: any) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <a href="/admin" className="text-xl font-bold text-blue-600">
              EduSitePro Admin
            </a>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </a>
              <a href="/admin/registrations" className="text-gray-700 hover:text-blue-600">
                Registrations
              </a>
              <a href="/admin/campaigns" className="text-gray-700 hover:text-blue-600">
                Campaigns
              </a>
              <a href="/admin/payments" className="text-gray-700 hover:text-blue-600">
                Payments
              </a>
              <a href="/admin/settings" className="text-gray-700 hover:text-blue-600">
                Settings
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.email}
            </span>
            <a
              href="/api/auth/signout"
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
