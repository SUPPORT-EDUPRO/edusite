import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import TenantDashboardLayout from '@/components/dashboard/TenantDashboardLayout';
import { createClient } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const headersList = headers();
  
  // Get tenant ID from middleware header
  const tenantId = headersList.get('x-tenant-id');

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If not logged in, redirect to login page
  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  // Get user's profile to check if they have admin access
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, organization_id')
    .eq('id', session.user.id)
    .single();

  // Check if user has tenant admin role
  const tenantAdminRoles = ['principal', 'principal_admin', 'admin'];
  const hasTenantAccess = profile && tenantAdminRoles.includes(profile.role);

  // If user doesn't have tenant admin role, show error
  if (!hasTenantAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have access to this dashboard. Only school administrators and principals can access this area.
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

  // Check if tenant matches user's organization
  if (!tenantId || profile.organization_id !== tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have access to this organization's dashboard.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Your organization: <strong>{profile?.organization_id || 'none'}</strong></p>
            <p className="text-sm text-gray-500">Requested organization: <strong>{tenantId || 'none'}</strong></p>
            <a
              href="/"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Get organization info
  const { data: organization } = await supabase
    .from('organizations')
    .select('name, slug, custom_domain')
    .eq('id', tenantId)
    .single();

  return (
    <TenantDashboardLayout 
      session={session}
      profile={profile}
      organization={organization}
    >
      {children}
    </TenantDashboardLayout>
  );
}
