'use client';

import { CheckCircle2, Clock3, Search } from 'lucide-react';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { YoungEaglesContactCard } from './YoungEaglesContactCard';

type ApplicationStatus = {
  childFirstName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string | null;
  registrationFeeAmount: number;
  registrationFeePaid: boolean;
  registrationFeeWaived: boolean;
  paymentVerified: boolean;
  documentsUploaded: boolean;
  rejectionReason: string | null;
};

const statusCopy = {
  pending: {
    title: 'Application under review',
    detail: 'Young Eagles admissions has your application and will contact you after review.',
  },
  approved: {
    title: 'Application approved',
    detail: 'Your application has been approved. Check your email for onboarding details.',
  },
  rejected: {
    title: 'Application not approved',
    detail: 'Please contact Young Eagles if you need help or want to discuss the outcome.',
  },
} as const;

export function RegistrationStatusTracker({
  initialReference = '',
}: {
  initialReference?: string;
}) {
  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState('');
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function checkStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setApplication(null);
    try {
      const response = await fetch('/api/registrations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, email }),
      });
      const payload = (await response.json().catch(() => null)) as {
        application?: ApplicationStatus;
        error?: string;
      } | null;
      if (!response.ok || !payload?.application) {
        throw new Error(payload?.error || 'We could not check the application right now.');
      }
      setApplication(payload.application);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Status check failed.');
    } finally {
      setLoading(false);
    }
  }

  const copy = application ? statusCopy[application.status] : null;
  const paymentComplete = application
    ? application.registrationFeeWaived || application.paymentVerified
    : false;

  return (
    <div className="mx-auto max-w-2xl">
      <form
        className="rounded-[24px] border border-white bg-white p-6 shadow-xl sm:p-8"
        onSubmit={checkStatus}
      >
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[#172f56]">
          Track your application
        </h1>
        <p className="mt-3 leading-7 text-[#64748b]">
          Use the reference and email address from your Young Eagles confirmation.
        </p>
        <label className="mt-6 block text-sm font-extrabold text-[#2b3e5c]">
          Registration reference
          <input
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-[#cbd7e7] px-4 py-3 font-mono font-semibold outline-none focus:border-[#7651d6] focus:ring-2 focus:ring-[#7651d6]/20"
            onChange={(event) => setReference(event.target.value)}
            placeholder="REG-2027-..."
            required
            value={reference}
          />
        </label>
        <label className="mt-4 block text-sm font-extrabold text-[#2b3e5c]">
          Parent or guardian email
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-[#cbd7e7] px-4 py-3 outline-none focus:border-[#7651d6] focus:ring-2 focus:ring-[#7651d6]/20"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e4b8f] px-5 py-3 font-extrabold text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          <Search aria-hidden="true" className="size-4" />
          {loading ? 'Checking…' : 'Check application'}
        </button>
      </form>

      {application && copy ? (
        <section
          className="mt-5 rounded-[24px] border border-[#d9d0fb] bg-white p-6 shadow-lg sm:p-8"
          aria-live="polite"
        >
          <p className="text-sm font-bold text-[#64748b]">
            {application.childFirstName}&apos;s application
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#172f56]">{copy.title}</h2>
          <p className="mt-2 leading-7 text-[#64748b]">{copy.detail}</p>
          {application.rejectionReason ? (
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              School note: {application.rejectionReason}
            </p>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatusItem
              complete={paymentComplete}
              label="Registration payment"
              value={
                application.registrationFeeWaived
                  ? 'Fee waived'
                  : application.paymentVerified
                    ? 'Verified'
                    : application.registrationFeePaid
                      ? 'Submitted for verification'
                      : `Awaiting R${application.registrationFeeAmount.toFixed(2)}`
              }
            />
            <StatusItem
              complete={application.documentsUploaded}
              label="Documents"
              value={application.documentsUploaded ? 'Received' : 'Upload still required'}
            />
          </div>
          {application.status === 'pending' && !paymentComplete ? (
            <Link
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1e4b8f] px-5 py-3 font-extrabold text-white sm:w-auto"
              href={`/upload-payment?ref=${encodeURIComponent(reference.trim().toUpperCase())}`}
            >
              Upload proof of payment
            </Link>
          ) : null}
          {application.status === 'approved' ? (
            <a
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#238265] px-5 py-3 font-extrabold text-white sm:w-auto"
              href="https://app.edudashpro.org.za"
              rel="noreferrer"
              target="_blank"
            >
              Open EduDash Pro
            </a>
          ) : null}
        </section>
      ) : null}

      <div className="mt-6">
        <YoungEaglesContactCard heading="Need help?" />
      </div>
    </div>
  );
}

function StatusItem({
  complete,
  label,
  value,
}: {
  complete: boolean;
  label: string;
  value: string;
}) {
  const Icon = complete ? CheckCircle2 : Clock3;
  return (
    <div className="flex gap-3 rounded-xl border border-[#e5ebf4] p-4">
      <Icon
        aria-hidden="true"
        className={`mt-0.5 size-5 shrink-0 ${complete ? 'text-[#238265]' : 'text-[#c07824]'}`}
      />
      <div>
        <p className="text-xs font-extrabold tracking-wide text-[#64748b] uppercase">{label}</p>
        <p className="mt-1 text-sm font-bold text-[#172f56]">{value}</p>
      </div>
    </div>
  );
}
