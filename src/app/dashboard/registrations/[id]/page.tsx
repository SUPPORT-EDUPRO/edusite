import { ArrowLeft, CheckCircle, CreditCard, FileText, User, XCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import RegistrationActions from '@/components/dashboard/RegistrationActions';
import ResendEmailButton from '@/components/dashboard/ResendEmailButton';
import { createClient } from '@/lib/auth';
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
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  payment_reference: string | null;
  proof_of_payment_url: string | null;
  payment_verified: boolean | null;
  payment_date: string | null;
  payment_amount: number | null;
}

export default async function RegistrationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const authSupabase = createClient();
  const supabase = getServiceRoleClient();

  // Get current user session
  const { data: { session } } = await authSupabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  // Fetch registration details
  const { data: registration, error } = await supabase
    .from('registration_requests')
    .select('*')
    .eq('id', params.id)
    .single<Registration>();

  if (error || !registration) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/registrations"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Registrations
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-bold text-stone-900">
              Registration Details
            </h1>
            <div className="flex items-center gap-3">
              <ResendEmailButton 
                registrationId={registration.id}
                guardianEmail={registration.guardian_email}
              />
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  registration.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : registration.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {registration.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Student Information */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900">Student Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-stone-500">Full Name</p>
                <p className="font-medium text-stone-900">
                  {registration.student_first_name} {registration.student_last_name}
                </p>
              </div>
              {registration.student_dob && (
                <div>
                  <p className="text-sm text-stone-500">Date of Birth</p>
                  <p className="font-medium text-stone-900">
                    {new Date(registration.student_dob).toLocaleDateString()}
                  </p>
                </div>
              )}
              {registration.student_gender && (
                <div>
                  <p className="text-sm text-stone-500">Gender</p>
                  <p className="font-medium text-stone-900">{registration.student_gender}</p>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900">Guardian Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-stone-500">Name</p>
                <p className="font-medium text-stone-900">{registration.guardian_name}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Email</p>
                <p className="font-medium text-stone-900 break-all">{registration.guardian_email}</p>
              </div>
              {registration.guardian_phone && (
                <div>
                  <p className="text-sm text-stone-500">Phone</p>
                  <p className="font-medium text-stone-900">{registration.guardian_phone}</p>
                </div>
              )}
              {registration.guardian_address && (
                <div>
                  <p className="text-sm text-stone-500">Address</p>
                  <p className="font-medium text-stone-900 break-words">{registration.guardian_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Registration Details */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900">Registration Details</h2>
            </div>
            <div className="space-y-4">
              {registration.payment_reference && (
                <div>
                  <p className="text-sm text-stone-500">Payment Reference</p>
                  <p className="font-mono font-semibold text-purple-600">{registration.payment_reference}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-stone-500">Registration Fee</p>
                <p className="font-medium text-stone-900">R{registration.registration_fee_amount || 300}</p>
              </div>
              {registration.discount_amount && registration.discount_amount > 0 && (
                <div>
                  <p className="text-sm text-stone-500">Discount</p>
                  <p className="font-medium text-green-600">
                    {registration.discount_amount}% off
                    {registration.coupon_code && ` (${registration.coupon_code})`}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-stone-500">Submitted</p>
                <p className="font-medium text-stone-900">
                  {new Date(registration.created_at).toLocaleString()}
                </p>
              </div>
              {registration.preferred_class && (
                <div>
                  <p className="text-sm text-stone-500">Preferred Class</p>
                  <p className="font-medium text-stone-900">{registration.preferred_class}</p>
                </div>
              )}
              {registration.preferred_start_date && (
                <div>
                  <p className="text-sm text-stone-500">Preferred Start Date</p>
                  <p className="font-medium text-stone-900">
                    {new Date(registration.preferred_start_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900">Payment Information</h2>
            </div>
            <div className="space-y-4">
              {registration.payment_reference && (
                <div>
                  <p className="text-sm text-stone-500">Payment Reference</p>
                  <p className="font-mono font-medium text-stone-900">{registration.payment_reference}</p>
                </div>
              )}
              {registration.proof_of_payment_url ? (
                <>
                  <div>
                    <p className="text-sm text-stone-500 mb-2">Proof of Payment</p>
                    {registration.payment_verified ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-sm font-semibold text-green-800">
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-sm font-semibold text-yellow-800">
                        <svg className="mr-1.5 h-4 w-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <div>
                    <a
                      href={registration.proof_of_payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Document
                    </a>
                  </div>
                  {registration.payment_date && (
                    <div>
                      <p className="text-sm text-stone-500">Payment Uploaded</p>
                      <p className="font-medium text-stone-900">
                        {new Date(registration.payment_date).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {registration.payment_amount && (
                    <div>
                      <p className="text-sm text-stone-500">Amount Paid</p>
                      <p className="font-medium text-lg text-green-700">
                        R{registration.payment_amount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <div className="inline-flex items-center text-sm font-semibold text-red-800">
                    <XCircle className="mr-2 h-5 w-5" />
                    No Proof of Payment Uploaded
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    Parent has not yet uploaded proof of payment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {registration.status === 'pending' && (
          <div className="mt-6">
            <RegistrationActions registration={registration} />
          </div>
        )}
      </div>
    </div>
  );
}
