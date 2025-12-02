'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

interface RegistrationsListProps {
  registrations: Registration[];
  organizationId: string;
}

export default function RegistrationsList({ registrations, organizationId }: RegistrationsListProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

      alert(`✅ Registration approved! Welcome email sent to ${result.data?.parent?.email || 'parent'}`);
      router.refresh(); // Refresh server component data
    } catch (error: any) {
      console.error('Approval error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (registrationId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setProcessing(registrationId);
    try {
      const response = await fetch('/api/registrations/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, reason: reason || 'Not specified' }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to reject registration');
      }

      alert('✅ Registration rejected');
      router.refresh();
    } catch (error: any) {
      console.error('Rejection error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleVerifyPayment = async (registrationId: string, verified: boolean) => {
    if (!confirm(`Are you sure you want to ${verified ? 'verify' : 'unverify'} this payment?`)) {
      return;
    }

    setProcessing(registrationId);
    try {
      const response = await fetch('/api/registrations/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, verified }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify payment');
      }

      alert(`✅ ${result.message}`);
      router.refresh();
    } catch (error: any) {
      console.error('Payment verification error:', error);
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

  if (registrations.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 shadow-sm text-center">
        <p className="text-stone-600">No registrations found</p>
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 sm:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filteredRegistrations.map((reg) => (
          <div key={reg.id} className="rounded-lg bg-white p-4 shadow-sm border border-stone-200">
            {/* Student Name */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-stone-900">
                  {reg.student_first_name} {reg.student_last_name}
                </h3>
                {reg.student_dob && (
                  <p className="text-xs text-stone-500">
                    DOB: {new Date(reg.student_dob).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  reg.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : reg.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {reg.status}
              </span>
            </div>

            {/* Parent Info */}
            <div className="mb-3 space-y-1">
              <p className="text-sm text-stone-900">{reg.guardian_name}</p>
              <p className="text-xs text-stone-500">{reg.guardian_email}</p>
            </div>

            {/* Fee and Payment */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-100">
              <div>
                <p className="text-sm font-medium text-stone-900">
                  R{reg.registration_fee_amount || 300}
                </p>
                {reg.discount_amount && reg.discount_amount > 0 && (
                  <p className="text-xs text-green-600">{reg.discount_amount}% off</p>
                )}
              </div>
              <div>
                {reg.proof_of_payment_url ? (
                  <div className="text-right">
                    {reg.payment_verified ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        <svg className="mr-1 h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Pending
                      </span>
                    )}
                    <a
                      href={reg.proof_of_payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1"
                    >
                      View POP →
                    </a>
                  </div>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                    No Payment
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={reg.proof_of_payment_url ? `/dashboard/registrations/${reg.id}` : '#'}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium text-center ${
                  reg.proof_of_payment_url
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                }`}
                onClick={(e) => {
                  if (!reg.proof_of_payment_url) {
                    e.preventDefault();
                  }
                }}
              >
                View Details
              </Link>
              {reg.proof_of_payment_url && !reg.payment_verified && reg.status === 'pending' && (
                <button
                  onClick={() => handleVerifyPayment(reg.id, true)}
                  disabled={processing === reg.id}
                  className="flex-1 rounded-lg bg-purple-100 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                >
                  Verify Payment
                </button>
              )}
              {reg.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(reg.id)}
                    disabled={processing === reg.id || !reg.payment_verified}
                    className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                    title={!reg.payment_verified ? 'Payment must be verified first' : ''}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(reg.id)}
                    disabled={processing === reg.id}
                    className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>

            {/* Date */}
            <p className="text-xs text-stone-400 mt-2 text-center">
              {new Date(reg.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        {filteredRegistrations.length === 0 && (
          <div className="rounded-lg bg-white p-8 shadow-sm text-center">
            <p className="text-stone-600">No registrations found</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-lg bg-white shadow-sm">`
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-stone-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-stone-900">
                      {reg.student_first_name} {reg.student_last_name}
                    </div>
                    {reg.student_dob && (
                      <div className="text-xs text-stone-500">
                        DOB: {new Date(reg.student_dob).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-stone-900">{reg.guardian_name}</div>
                    <div className="text-xs text-stone-500">{reg.guardian_email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-stone-900">
                      R{reg.registration_fee_amount || 300}
                    </div>
                    {reg.discount_amount && reg.discount_amount > 0 && (
                      <div className="text-xs text-green-600">
                        {reg.discount_amount}% off
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="space-y-1">
                      {reg.status === 'pending' && reg.payment_verified ? (
                        // Show only verified badge when payment is verified
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              reg.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : reg.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {reg.status}
                          </span>
                          {reg.status === 'pending' && reg.proof_of_payment_url && !reg.payment_verified && (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                              <svg className="mr-1 h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Pending Review
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {reg.proof_of_payment_url ? (
                      <div className="space-y-1">
                        <a
                          href={reg.proof_of_payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View POP →
                        </a>
                        {reg.payment_reference && (
                          <div className="text-xs text-stone-500 font-mono">
                            {reg.payment_reference}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        No Payment
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                    {new Date(reg.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={reg.proof_of_payment_url ? `/dashboard/registrations/${reg.id}` : '#'}
                        className={`rounded-lg px-3 py-1 text-sm ${
                          reg.proof_of_payment_url
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                        }`}
                        onClick={(e) => {
                          if (!reg.proof_of_payment_url) {
                            e.preventDefault();
                          }
                        }}
                      >
                        View
                      </Link>
                      {reg.proof_of_payment_url && !reg.payment_verified && reg.status === 'pending' && (
                        <button
                          onClick={() => handleVerifyPayment(reg.id, true)}
                          disabled={processing === reg.id}
                          className="rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                        >
                          Verify Payment
                        </button>
                      )}
                      {reg.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(reg.id)}
                            disabled={processing === reg.id || !reg.payment_verified}
                            className="rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200 disabled:opacity-50"
                            title={!reg.payment_verified ? 'Payment must be verified first' : ''}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(reg.id)}
                            disabled={processing === reg.id}
                            className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            Reject
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
      </div>
    </>
  );
}
