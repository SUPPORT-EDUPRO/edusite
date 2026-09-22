import { CalendarDays, Check, CheckCircle2, CircleHelp, HeartHandshake, ShieldCheck } from 'lucide-react';

import type { YoungEagles2027RegistrationState } from '@/lib/young-eagles-2027-registration';
import {
  formatSelectedDocument,
  mediaPermissionReviewLabel,
  YOUNG_EAGLES_2027_DOCUMENT_SLOTS,
} from '@/lib/young-eagles-2027-registration';

import { StepHeading } from './youngEagles2027PreviewUi';

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

export function SubmittedConfirmation({ childLegalName }: { childLegalName: string }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ece8ff,_transparent_34%),linear-gradient(135deg,_#f7faff,_#f6f2ff)] px-3 py-8 text-[#2b3e5c]">
      <div className="mx-auto max-w-xl rounded-[28px] border border-white/90 bg-white p-8 text-center shadow-[0_24px_70px_rgba(30,75,143,0.14)]">
        <Check className="mx-auto mb-4 size-12 text-[#238265]" />
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[#172f56]">
          Registration submitted
        </h1>
        <p className="mt-4 leading-7 text-[#64748b]">
          Thank you for registering {childLegalName} for the 2027 academic year at Young Eagles
          Preschool. Admissions will review your application and contact you.
        </p>
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
            value="To be confirmed before launch"
          />
        </dl>
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

      <section className="flex items-center justify-between gap-4 rounded-2xl bg-[#172f56] p-4 text-white sm:col-span-2 lg:col-span-1">
        <div>
          <h2 className="text-sm font-extrabold">Need a hand?</h2>
          <p className="mt-1 text-xs leading-5 text-[#dce7fa]">
            Admissions support details are to be confirmed before launch.
          </p>
        </div>
        <CircleHelp
          aria-hidden="true"
          className="size-8 shrink-0 rounded-xl border border-white/25 p-1.5"
        />
      </section>
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
