import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MailCheck,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import Link from 'next/link';

import type { SubmitYoungEagles2027Result } from '@/lib/submit-public-registration';
import type { YoungEagles2027RegistrationState } from '@/lib/young-eagles-2027-registration';
import {
  formatSelectedDocument,
  mediaPermissionReviewLabel,
  YOUNG_EAGLES_2027_DOCUMENT_SLOTS,
} from '@/lib/young-eagles-2027-registration';
import {
  YOUNG_EAGLES_AFTERCARE_HOURS,
  YOUNG_EAGLES_OPERATING_DAYS,
  YOUNG_EAGLES_SCHOOL_HOURS,
} from '@/lib/young-eagles-contact';

import { StepHeading } from './youngEagles2027PreviewUi';
import { YoungEaglesContactCard } from './YoungEaglesContactCard';

export function ReviewAndSubmit({
  persistEnabled,
  values,
}: {
  persistEnabled: boolean;
  values: YoungEagles2027RegistrationState;
}) {
  const documentSummary =
    values.documentPreference === 'upload-now'
      ? YOUNG_EAGLES_2027_DOCUMENT_SLOTS.map((slot) => {
          const selected = values[slot.id];
          return `${slot.label}: ${selected ? formatSelectedDocument(selected) : 'Not selected'}`;
        }).join('; ')
      : values.documentPreference === 'upload-later'
        ? 'Upload later in the EduDash Pro app'
        : 'Not provided';

  const rows = [
    ['Guardian', values.guardianLegalName || 'Not provided'],
    ['Email', values.email || 'Not provided'],
    ['Child', values.childLegalName || 'Not provided'],
    ['Intended start', values.intendedStart || 'Not provided'],
    ['Sibling enrolled', values.siblingEnrolled ? 'Yes' : 'No'],
    ['Care schedule', 'Full-day weekday care'],
    ['Documents', documentSummary],
    ['Media permission', mediaPermissionReviewLabel(values.mediaPermission)],
  ];

  return (
    <>
      <StepHeading
        title="Review your application"
        helper={
          persistEnabled
            ? 'Check the details below, then submit your 2027 application.'
            : 'Check the details below. Nothing entered here is stored or sent to Young Eagles until live submission is enabled.'
        }
      />
      <dl className="grid divide-y divide-[#e5ebf4] overflow-hidden rounded-xl border border-[#e5ebf4] bg-[#fbfdff]">
        {rows.map(([label, value]) => (
          <div className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4" key={label}>
            <dt className="text-xs font-extrabold tracking-wide text-[#64748b] uppercase">
              {label}
            </dt>
            <dd className="text-sm text-[#2b3e5c]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex gap-3 rounded-xl border border-[#d9d0fb] bg-[#f8f5ff] p-3 text-sm leading-5 text-[#5d3db3]">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        {persistEnabled
          ? 'Submitting saves this application for Young Eagles admissions. Registration fees follow the live campaign shown above.'
          : 'Final submission, fees, and application timing remain unavailable until they are confirmed.'}
      </div>
    </>
  );
}

export function SubmittedConfirmation({
  registration,
}: {
  registration: SubmitYoungEagles2027Result;
}) {
  const feeDue = registration.registrationFeeAmount > 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ece8ff,_transparent_34%),linear-gradient(135deg,_#f7faff,_#f6f2ff)] px-3 py-8 text-[#2b3e5c]">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-white/90 bg-white p-6 shadow-[0_24px_70px_rgba(30,75,143,0.14)] sm:p-8">
        <Check className="mx-auto mb-4 size-12 text-[#238265]" />
        <h1 className="text-center text-3xl font-extrabold tracking-[-0.04em] text-[#172f56]">
          Registration submitted
        </h1>
        <p className="mt-4 text-center leading-7 text-[#64748b]">
          Thank you for registering {registration.childName} for the 2027 academic year at Young
          Eagles Preschool. Your application is safely in the admissions queue.
        </p>

        <section className="mt-6 rounded-2xl border border-[#d9d0fb] bg-[#f8f5ff] p-5 text-center">
          <p className="text-xs font-black tracking-[0.12em] text-[#7651d6] uppercase">
            Keep this reference
          </p>
          <p className="mt-2 font-mono text-lg font-extrabold break-all text-[#172f56]">
            {registration.paymentReference}
          </p>
          <p className="mt-2 text-sm text-[#64748b]">
            A confirmation with the next steps is being sent to {registration.guardianEmail}. Check
            your spam folder if it does not arrive shortly.
          </p>
        </section>

        <ol className="mt-6 grid gap-3 text-left text-sm leading-6 text-[#435775]">
          <li className="flex gap-3 rounded-xl border border-[#e5ebf4] p-4">
            <MailCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#238265]" />
            <span>
              <strong className="block text-[#172f56]">1. Check your email</strong>
              Your confirmation includes the payment instructions and school contact details.
            </span>
          </li>
          <li className="flex gap-3 rounded-xl border border-[#e5ebf4] p-4">
            <Upload aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#7651d6]" />
            <span>
              <strong className="block text-[#172f56]">
                2. {feeDue ? 'Pay and upload proof' : 'No registration payment is due'}
              </strong>
              {feeDue
                ? `The registration fee for this application is R${registration.registrationFeeAmount.toFixed(2)}.`
                : 'A registration fee waiver was applied to this application.'}
            </span>
          </li>
          <li className="flex gap-3 rounded-xl border border-[#e5ebf4] p-4">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#1e4b8f]" />
            <span>
              <strong className="block text-[#172f56]">3. Track the review</strong>
              Admissions will update the status after reviewing the application and payment.
            </span>
          </li>
        </ol>

        <div className="mt-6">
          <YoungEaglesContactCard heading="School hours and contact" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {feeDue ? (
            <Link
              className="rounded-xl bg-[#1e4b8f] px-5 py-3 text-center font-extrabold text-white transition hover:bg-[#173d75]"
              href={`/upload-payment?ref=${encodeURIComponent(registration.paymentReference)}`}
            >
              Upload proof of payment
            </Link>
          ) : null}
          <Link
            className="rounded-xl border border-[#1e4b8f] px-5 py-3 text-center font-extrabold text-[#1e4b8f] transition hover:bg-[#f2f6fc]"
            href={`/registration/status?ref=${encodeURIComponent(registration.paymentReference)}`}
          >
            Track application
          </Link>
        </div>
      </div>
    </main>
  );
}

export function RegistrationInfoAside({ persistEnabled }: { persistEnabled: boolean }) {
  return (
    <aside
      aria-label="2027 registration information"
      className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1"
    >
      <section className="rounded-[20px] border border-[#d9d0fb] bg-gradient-to-br from-[#f8f5ff] to-white p-5">
        <h2 className="font-extrabold tracking-[-0.015em] text-[#172f56]">
          2027 admissions at a glance
        </h2>
        <dl className="mt-5 grid gap-4">
          <SummaryItem
            icon={<CalendarDays />}
            label="Application timing"
            value={persistEnabled ? 'Now open for 2027' : 'To be confirmed before launch'}
          />
          <SummaryItem
            icon={<HeartHandshake />}
            label="Early learning & daycare"
            value={persistEnabled ? 'Ages 6 months to 6 years' : 'To be confirmed before launch'}
          />
          <SummaryItem
            icon={<Clock3 />}
            label="Operating hours"
            value={
              persistEnabled
                ? `${YOUNG_EAGLES_OPERATING_DAYS}: school day ${YOUNG_EAGLES_SCHOOL_HOURS}, aftercare ${YOUNG_EAGLES_AFTERCARE_HOURS}`
                : 'To be confirmed before launch'
            }
          />
        </dl>
      </section>

      <section className="rounded-[20px] border border-[#e5ebf4] bg-white/80 p-5">
        <h2 className="font-extrabold tracking-[-0.015em] text-[#172f56]">What happens next</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-5 text-[#64748b]">
          {[
            'You receive a reference number and a confirmation email straight away.',
            'Pay the registration fee and send proof of payment (no payment is due if a waiver applies).',
            'The principal and admissions team are notified and review your application.',
            'Once approved, you get access to the Young Eagles app for your child.',
          ].map((item, index) => (
            <li key={item} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#edf4fe] text-xs font-extrabold text-[#1e4b8f]"
              >
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-[#64748b]">
          Already applied?{' '}
          <Link className="font-bold text-[#1e4b8f] underline" href="/registration/status">
            Track your application
          </Link>
        </p>
      </section>

      <section className="rounded-[20px] border border-[#e5ebf4] bg-white/80 p-5">
        <h2 className="font-extrabold tracking-[-0.015em] text-[#172f56]">Readiness checklist</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-5 text-[#64748b]">
          {[
            'Parent or guardian contact details',
            'Child details and care notes',
            'Upload documents now or later in the app',
            'Consent, media permission and final review',
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#238265]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="sm:col-span-2 lg:col-span-1">
        <YoungEaglesContactCard heading="Need a hand? Visit or contact us" />
      </div>
    </aside>
  );
}

export function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#edf4fe] text-[#1e4b8f] [&_svg]:size-4"
      >
        {icon}
      </span>
      <div>
        <dt className="text-sm font-extrabold text-[#354966]">{label}</dt>
        <dd className="mt-0.5 text-xs leading-5 text-[#64748b]">{value}</dd>
      </div>
    </div>
  );
}
