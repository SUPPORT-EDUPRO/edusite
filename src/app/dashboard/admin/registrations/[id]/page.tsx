'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, Calendar, User, Baby, Mail, Phone, MapPin, FileText } from 'lucide-react';
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
  discount_amount: number | null;
  coupon_code: string | null;
  payment_reference: string | null;
  proof_of_payment_url: string | null;
  payment_verified: boolean | null;
  registration_fee_paid: boolean | null;
  payment_date: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  organizations?: {
    name: string;
  };
}

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRegistration();
  }, [params.id]);

  const fetchRegistration = async () => {
    setLoading(true);
    try {
      const supabase = getServiceRoleClient();
      
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*, organizations(name)')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setRegistration(data);
    } catch (error) {
      console.error('Error fetching registration:', error);
      alert('Failed to load registration details');
      router.push('/dashboard/admin/registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!registration) return;
    
    if (!confirm(`Approve registration for ${registration.student_first_name} ${registration.student_last_name}?\n\nThis will:\n- Approve the registration\n- Create parent account in EduDashPro\n- Send welcome email with login instructions`)) {
      return;
    }

    setProcessing(true);
    try {
      const supabase = getServiceRoleClient();

      // Step 1: Update status to approved and verify payment if POP exists
      const updates: any = {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'admin',
      };

      // If there's proof of payment, mark as verified and paid
      if (registration.proof_of_payment_url) {
        updates.payment_verified = true;
        updates.registration_fee_paid = true;
        updates.payment_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('registration_requests')
        .update(updates)
        .eq('id', registration.id);

      if (error) throw error;

      // Step 2: Trigger sync to EduDashPro to create parent account and send email
      console.log('[EduSitePro] Triggering sync to EduDashPro for registration:', registration.id);
      
      const syncResponse = await fetch('https://lvvvjywrmpcqrpvuptdi.supabase.co/functions/v1/sync-registration-to-edudash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ registration_id: registration.id }),
      });

      const syncResult = await syncResponse.json();
      
      if (!syncResponse.ok || !syncResult.success) {
        console.error('[EduSitePro] Sync failed:', syncResult);
        throw new Error(syncResult.error || 'Failed to sync registration to EduDashPro');
      }

      console.log('[EduSitePro] Sync successful:', syncResult);

      alert('✅ Registration approved successfully!\n\n✉️ Parent account created and welcome email sent.');
      router.push('/dashboard/admin/registrations');
    } catch (error) {
      console.error('Error approving registration:', error);
      alert(`Failed to approve registration: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThe registration status was updated but the parent account may not have been created. Please try syncing manually.`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!registration) return;
    
    if (!confirm(`Reject registration for ${registration.student_first_name} ${registration.student_last_name}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const supabase = getServiceRoleClient();

      const { error } = await supabase
        .from('registration_requests')
        .update({ status: 'rejected' })
        .eq('id', registration.id);

      if (error) throw error;

      alert('Registration rejected');
      router.push('/dashboard/admin/registrations');
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Failed to reject registration');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading registration details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!registration) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin/registrations"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Registrations
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registration Details</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {registration.student_first_name} {registration.student_last_name} - {registration.organizations?.name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {registration.status === 'pending' && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Approve & Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Student Information */}
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <div className="mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Baby className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Full Name</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">
                  {registration.student_first_name} {registration.student_last_name}
                </p>
              </div>
              {registration.student_dob && (
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Date of Birth</label>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">
                    {new Date(registration.student_dob).toLocaleDateString()}
                  </p>
                </div>
              )}
              {registration.student_gender && (
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Gender</label>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50 capitalize">{registration.student_gender}</p>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information */}
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <div className="mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Guardian Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Name</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">{registration.guardian_name}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p className="text-base font-medium text-gray-900 dark:text-gray-50">{registration.guardian_email}</p>
                </div>
              </div>
              {registration.guardian_phone && (
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Phone</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-base font-medium text-gray-900 dark:text-gray-50">{registration.guardian_phone}</p>
                  </div>
                </div>
              )}
              {registration.guardian_address && (
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Address</label>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <p className="text-base font-medium text-gray-900 dark:text-gray-50">{registration.guardian_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Details */}
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <div className="mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Registration Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {registration.payment_reference && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Payment Reference</label>
                  <p className="mt-1 text-lg font-mono font-semibold text-purple-600 dark:text-purple-400">{registration.payment_reference}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">School</label>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">{registration.organizations?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      registration.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : registration.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {registration.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Submitted</label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-base font-medium text-gray-900 dark:text-gray-50">
                    {new Date(registration.created_at).toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {registration.approved_at && (
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Approved</label>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">
                    {new Date(registration.approved_at).toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              {registration.approved_by && (
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Approved By</label>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">{registration.approved_by}</p>
                </div>
              )}
              {registration.preferred_class && (
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Preferred Class</label>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">{registration.preferred_class}</p>
                </div>
              )}
              {registration.preferred_start_date && (
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Preferred Start Date</label>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">
                    {new Date(registration.preferred_start_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          {(registration.registration_fee_amount || registration.discount_amount || registration.coupon_code) && (
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
              <div className="mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Information</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {registration.registration_fee_amount && (
                  <div>
                    <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Registration Fee</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">R{registration.registration_fee_amount}</p>
                  </div>
                )}
                {registration.discount_amount && (
                  <div>
                    <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Discount</label>
                    <p className="mt-1 text-base font-medium text-green-600 dark:text-green-400">{registration.discount_amount}% off</p>
                  </div>
                )}
                {registration.coupon_code && (
                  <div>
                    <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Coupon Code</label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-50">{registration.coupon_code}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
