'use client';

import { useState, useEffect } from 'react';
import { Check, X, Eye, Search, Filter, Clock, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import AdminLayout from '@/components/admin/AdminLayout';
import { getServiceRoleClient } from '@/lib/supabase';

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
  registration_fee_paid?: boolean;
  payment_verified?: boolean;
  discount_amount: number | null;
  coupon_code: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  organizations?: {
    name: string;
  };
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, [filter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const supabase = getServiceRoleClient();
      
      let query = supabase
        .from('registration_requests')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    if (!confirm('Are you sure you want to approve this registration? This will create a parent account and send a welcome email.')) {
      return;
    }

    setProcessing(registrationId);
    try {
      const response = await fetch('/api/registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve registration');
      }

      alert(`✅ Registration approved! Welcome email sent to ${result.data.parent.email}`);
      fetchRegistrations(); // Refresh list
    } catch (error: any) {
      console.error('Approval error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (registrationId: string) => {
    const reason = prompt('Please provide a reason for rejection (will be sent to the parent):');
    if (!reason) return;

    setProcessing(registrationId);
    try {
      const supabase = getServiceRoleClient();
      
      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', registrationId);

      if (error) throw error;

      alert('✅ Registration rejected');
      fetchRegistrations();
    } catch (error: any) {
      console.error('Rejection error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleVerifyPayment = async (registrationId: string, verify: boolean) => {
    const action = verify ? 'verify' : 'remove verification for';
    if (!confirm(`Are you sure you want to ${action} this payment?`)) {
      return;
    }

    setProcessing(registrationId);
    try {
      const response = await fetch('/api/registrations/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          registrationId,
          verified: verify
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} payment`);
      }

      alert(`✅ ${result.message || 'Payment status updated'}`);
      fetchRegistrations();
    } catch (error: any) {
      console.error(`${action} error:`, error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reg.student_first_name.toLowerCase().includes(searchLower) ||
      reg.student_last_name.toLowerCase().includes(searchLower) ||
      reg.guardian_name.toLowerCase().includes(searchLower) ||
      reg.guardian_email.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
    total: registrations.length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Management</h1>
          <p className="mt-2 text-gray-600">
            Review and approve registration requests from parents
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-amber-200" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-200" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-200" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Filter className="h-10 w-10 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === status
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 md:w-80"
              />
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading registrations...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No registrations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reg.student_first_name} {reg.student_last_name}
                        </div>
                        {reg.student_dob && (
                          <div className="text-xs text-gray-500">
                            DOB: {new Date(reg.student_dob).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{reg.guardian_name}</div>
                        <div className="text-xs text-gray-500">{reg.guardian_email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {reg.organizations?.name || 'Unknown'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          R{reg.registration_fee_amount || 300}
                        </div>
                        {reg.discount_amount && reg.discount_amount > 0 && (
                          <div className="text-xs text-green-600">
                            {reg.discount_amount}% off
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {(reg as any).payment_verified && reg.status !== 'rejected' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (reg as any).registration_fee_paid && reg.status !== 'rejected' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                            <XCircle className="h-3 w-3" />
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            reg.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : reg.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/registrations/${reg.id}`}
                            className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {reg.status === 'approved' && (reg as any).registration_fee_paid && !(reg as any).payment_verified && (
                            <button
                              onClick={() => handleVerifyPayment(reg.id, true)}
                              disabled={processing === reg.id}
                              className="rounded-lg bg-yellow-100 p-2 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                              title="Verify Payment"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                          )}
                          {reg.status === 'approved' && (reg as any).payment_verified && (
                            <button
                              onClick={() => handleVerifyPayment(reg.id, false)}
                              disabled={processing === reg.id}
                              className="rounded-lg bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                              title="Remove Verification"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {reg.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(reg.id)}
                                disabled={processing === reg.id}
                                className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200 disabled:opacity-50"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(reg.id)}
                                disabled={processing === reg.id}
                                className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 disabled:opacity-50"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
