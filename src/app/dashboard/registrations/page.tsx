import RegistrationsList from '@/components/dashboard/RegistrationsList';
import { createClient } from '@/lib/auth';
import { getServiceRoleClient } from '@/lib/supabase';

export const metadata = { title: 'Registrations | Dashboard' };

interface Registration {
  id: string;
  organization_id: string;
  student_first_name: string;
  student_last_name: string;
  student_dob: string | null;
  student_gender: string | null;
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string | null;
  guardian_address: string | null;
  preferred_class: string | null;
  preferred_start_date: string | null;
  registration_fee_amount: number | null;
  discount_amount: number | null;
  coupon_code: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  payment_reference: string | null;
  proof_of_payment_url: string | null;
  payment_verified: boolean | null;
  payment_date: string | null;
  payment_amount: number | null;
  organizations?: {
    name: string;
  };
}

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const authSupabase = createClient();
  const supabase = getServiceRoleClient();
  
  // Get current user session
  const { data: { session } } = await authSupabase.auth.getSession();
  
  if (!session) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-gray-600 mt-2">Not authenticated.</p>
      </div>
    );
  }
  
  // Get user's organization from profile using service role client
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', session.user.id)
    .single();
  
  if (profileError) {
    console.error('[RegistrationsPage] Profile error:', profileError);
  }
  
  const tenantId = profile?.organization_id;
  
  console.log('[RegistrationsPage] User:', session.user.email);
  console.log('[RegistrationsPage] Tenant ID:', tenantId);
  console.log('[RegistrationsPage] Role:', profile?.role);
  
  if (!tenantId) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-gray-600 mt-2">No organization context found.</p>
        <p className="text-xs text-gray-500 mt-2">This user is not associated with an organization</p>
      </div>
    );
  }

  // Get registrations for this organization
  let query = supabase
    .from('registration_requests')
    .select('*')
    .eq('organization_id', tenantId)
    .order('created_at', { ascending: false });

  // Filter by status if provided
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  const { data: registrations, error } = await query;
  
  console.log('[RegistrationsPage] Query result:', {
    tenantId,
    count: registrations?.length || 0,
    error: error?.message
  });

  if (error) {
    console.error('Error fetching registrations:', error);
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-gray-600 mt-2">Failed to load registrations.</p>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
      </div>
    );
  }

  // Get stats
  const allRegistrations = await supabase
    .from('registration_requests')
    .select('id, status')
    .eq('organization_id', tenantId);

  const stats = {
    total: allRegistrations.data?.length || 0,
    pending: allRegistrations.data?.filter(r => r.status === 'pending').length || 0,
    approved: allRegistrations.data?.filter(r => r.status === 'approved').length || 0,
    rejected: allRegistrations.data?.filter(r => r.status === 'rejected').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Registration Management</h1>
        <p className="text-sm text-stone-600 mt-1">
          Review and approve registration requests from parents
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-stone-900">{stats.total}</div>
          <div className="text-sm text-stone-600">Total</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-stone-900">{stats.pending}</div>
          <div className="text-sm text-stone-600">Pending</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border-l-4 border-green-500">
          <div className="text-2xl font-bold text-stone-900">{stats.approved}</div>
          <div className="text-sm text-stone-600">Approved</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border-l-4 border-red-500">
          <div className="text-2xl font-bold text-stone-900">{stats.rejected}</div>
          <div className="text-sm text-stone-600">Rejected</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-stone-200 overflow-x-auto pb-px">
        <a
          href="/dashboard/registrations"
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            !searchParams.status
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          All
        </a>
        <a
          href="/dashboard/registrations?status=pending"
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            searchParams.status === 'pending'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Pending
        </a>
        <a
          href="/dashboard/registrations?status=approved"
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            searchParams.status === 'approved'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Approved
        </a>
        <a
          href="/dashboard/registrations?status=rejected"
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            searchParams.status === 'rejected'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Rejected
        </a>
      </div>

      {/* Registrations List */}
      <RegistrationsList 
        registrations={registrations as Registration[] || []} 
        organizationId={tenantId}
      />
    </div>
  );
}
