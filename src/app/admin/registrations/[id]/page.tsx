'use client';

import { ArrowLeft, Baby, Calendar, Check, FileText,Mail, MapPin, Phone, User, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect,useState } from 'react';

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
  const [popVerified, setPopVerified] = useState(false);

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
      router.push('/admin/registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!registration) return;
    
    if (!confirm(`Approve registration for ${registration.student_first_name} ${registration.student_last_name}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const supabase = getServiceRoleClient();

      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'admin',
        })
        .eq('id', registration.id);

      if (error) throw error;

      alert('Registration approved successfully!');
      router.push('/admin/registrations');
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Failed to approve registration');
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
      router.push('/admin/registrations');
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
            href="/admin/registrations"
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
                    disabled={processing || (!popVerified && !!registration.proof_of_payment_url) || !registration.proof_of_payment_url}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!registration.proof_of_payment_url ? 'No proof of payment uploaded' : !popVerified ? 'Please verify proof of payment first' : 'Approve registration'}
                  >
                    <Check className="h-4 w-4" />
                    Approve
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

          {/* Proof of Payment */}
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Proof of Payment</h2>
              </div>
              {registration.proof_of_payment_url && popVerified && (
                <div className="flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900 px-3 py-1">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Verified</span>
                </div>
              )}
            </div>
            
            {registration.proof_of_payment_url ? (
              <div className="space-y-4">
                {/* POP Image Preview */}
                <div className="overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <img 
                    src={registration.proof_of_payment_url} 
                    alt="Proof of Payment"
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <a
                      href={registration.proof_of_payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Full Size
                    </a>
                    {!popVerified && registration.status === 'pending' && (
                      <button
                        onClick={() => setPopVerified(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        Verify Payment
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Warning if not verified */}
                {!popVerified && registration.status === 'pending' && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                    <svg className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Payment Verification Required</h3>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        Please verify the proof of payment before approving this registration.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Proof of Payment</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  The parent has not uploaded proof of payment yet.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-2">
                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    Cannot approve without payment verification
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
