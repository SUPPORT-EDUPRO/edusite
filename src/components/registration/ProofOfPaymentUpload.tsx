'use client';

import { CheckCircle2, Upload } from 'lucide-react';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { validateProofOfPaymentFile } from '@/lib/proof-of-payment';
import { YOUNG_EAGLES_BANKING } from '@/lib/young-eagles-contact';

import { YoungEaglesContactCard } from './YoungEaglesContactCard';

const inputClass =
  'mt-2 w-full rounded-xl border border-[#cbd7e7] px-4 py-3 outline-none focus:border-[#7651d6] focus:ring-2 focus:ring-[#7651d6]/20';

export function ProofOfPaymentUpload({ initialReference = '' }: { initialReference?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fileError = validateProofOfPaymentFile(file);
    if (fileError || !file) {
      setError(fileError);
      return;
    }
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.set('reference', reference);
      body.set('email', email);
      body.set('file', file);
      const response = await fetch('/api/registrations/proof-of-payment', { method: 'POST', body });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error || 'We could not save your proof of payment. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-[28px] border border-white/90 bg-white p-6 text-center shadow-[0_24px_70px_rgba(30,75,143,0.14)] sm:p-8">
        <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-[#238265]" />
        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-[#172f56]">
          Proof of payment received
        </h1>
        <p className="mt-3 leading-7 text-[#64748b]">
          The principal has been notified and will confirm your payment. You can follow progress at
          any time.
        </p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-[#1e4b8f] px-5 py-3 font-extrabold text-white"
          href={`/registration/status?ref=${encodeURIComponent(reference)}`}
        >
          Track application
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-xl gap-5">
      <form
        className="rounded-[28px] border border-white/90 bg-white p-6 shadow-[0_24px_70px_rgba(30,75,143,0.14)] sm:p-8"
        onSubmit={upload}
      >
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[#172f56]">
          Upload proof of payment
        </h1>
        <p className="mt-2 leading-7 text-[#64748b]">
          Pay the registration fee, then send us the proof so the principal can confirm it.
        </p>

        <section className="mt-5 rounded-2xl border border-[#d9d0fb] bg-[#f8f5ff] p-4 text-sm">
          <h2 className="font-extrabold text-[#172f56]">Banking details</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-[#435775]">
            <div>
              <dt className="font-bold">Bank</dt>
              <dd>{YOUNG_EAGLES_BANKING.bank}</dd>
            </div>
            <div>
              <dt className="font-bold">Account type</dt>
              <dd>{YOUNG_EAGLES_BANKING.accountType}</dd>
            </div>
            <div>
              <dt className="font-bold">Account number</dt>
              <dd className="font-mono">{YOUNG_EAGLES_BANKING.accountNumber}</dd>
            </div>
            <div>
              <dt className="font-bold">Branch code</dt>
              <dd className="font-mono">{YOUNG_EAGLES_BANKING.branchCode}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[#64748b]">
            Use your registration reference as the payment reference.
          </p>
        </section>

        <label className="mt-5 block text-sm font-bold text-[#354966]">
          Registration reference
          <input
            className={`${inputClass} font-mono`}
            onChange={(event) => setReference(event.target.value)}
            placeholder="REG-2027-…"
            required
            value={reference}
          />
        </label>
        <label className="mt-4 block text-sm font-bold text-[#354966]">
          Parent or guardian email
          <input
            autoComplete="email"
            className={inputClass}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        <label className="mt-4 block text-sm font-bold text-[#354966]">
          Proof of payment (PDF, JPG or PNG, up to 4 MB)
          <input
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-[#edf4fe] file:px-4 file:py-2 file:font-bold file:text-[#1e4b8f]`}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
            type="file"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e4b8f] px-5 py-3 font-extrabold text-white disabled:opacity-60"
          disabled={uploading}
          type="submit"
        >
          <Upload aria-hidden="true" className="size-4" />
          {uploading ? 'Uploading…' : 'Upload proof of payment'}
        </button>
        <p className="mt-4 text-center text-sm text-[#64748b]">
          <Link className="font-bold text-[#1e4b8f] underline" href="/registration/status">
            Track your application
          </Link>
        </p>
      </form>
      <YoungEaglesContactCard heading="Need help?" />
    </div>
  );
}
