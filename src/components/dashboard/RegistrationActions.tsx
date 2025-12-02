'use client';

import { CheckCircle, Eye,XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect,useState } from 'react';

interface Registration {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  proof_of_payment_url: string | null;
  payment_verified: boolean | null;
}

interface RegistrationActionsProps {
  registration: Registration;
}

export default function RegistrationActions({ registration }: RegistrationActionsProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  // Auto-refresh when POP status changes (poll every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [router]);

  const handleVerifyPayment = async () => {
    if (!confirm('Are you sure you want to verify this payment?')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/registrations/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id, verified: true }),
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
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this registration? This will create a parent account and send a welcome email.')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve registration');
      }

      alert(`✅ Registration approved! Welcome email sent to ${result.data?.parent?.email || 'parent'}`);
      router.push('/dashboard/registrations');
      router.refresh();
    } catch (error: any) {
      console.error('Approval error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setProcessing(true);
    try {
      const response = await fetch('/api/registrations/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id, reason: reason || 'Not specified' }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to reject registration');
      }

      alert('✅ Registration rejected');
      router.push('/dashboard/registrations');
      router.refresh();
    } catch (error: any) {
      console.error('Rejection error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const hasProofOfPayment = !!registration.proof_of_payment_url;
  const isPaymentVerified = registration.payment_verified === true;
  const canApprove = hasProofOfPayment && isPaymentVerified;

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-stone-900">Actions</h3>
      
      {/* View POP Button */}
      {hasProofOfPayment && (
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Proof of Payment Available</p>
              <p className="text-xs text-blue-700 mt-1">
                {isPaymentVerified ? '✓ Payment verified' : 'Review the document before approving'}
              </p>
            </div>
            <a
              href={registration.proof_of_payment_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View POP
            </a>
          </div>
        </div>
      )}

      {/* No POP Warning */}
      {!hasProofOfPayment && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">No Proof of Payment</p>
              <p className="text-xs text-amber-700 mt-1">
                The parent has not uploaded proof of payment yet. You cannot approve this registration without it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verify Payment Button */}
      {hasProofOfPayment && !isPaymentVerified && (
        <div className="mb-4">
          <button
            onClick={handleVerifyPayment}
            disabled={processing}
            className="w-full rounded-lg bg-purple-600 px-4 py-3 text-base font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Processing...' : '✓ Verify Payment'}
          </button>
          <p className="text-xs text-stone-500 mt-2 text-center">
            Verify the payment before approving the registration
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleApprove}
          disabled={processing || !canApprove}
          className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={!canApprove ? 'Payment must be uploaded and verified first' : 'Approve registration and create account'}
        >
          {processing ? 'Processing...' : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Approve & Create Account
            </span>
          )}
        </button>
        <button
          onClick={handleReject}
          disabled={processing}
          className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-base font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? 'Processing...' : (
            <span className="flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5" />
              Reject Registration
            </span>
          )}
        </button>
      </div>

      {/* Helper Text */}
      {!canApprove && hasProofOfPayment && !isPaymentVerified && (
        <p className="text-xs text-stone-500 mt-3 text-center">
          💡 Verify the payment first to enable the approve button
        </p>
      )}
      {!canApprove && !hasProofOfPayment && (
        <p className="text-xs text-stone-500 mt-3 text-center">
          ⏳ Waiting for parent to upload proof of payment
        </p>
      )}
    </div>
  );
}
