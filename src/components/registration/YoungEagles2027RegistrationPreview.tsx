'use client';

import {
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import type { YoungEagles2027RegistrationState } from '@/lib/young-eagles-2027-registration';
import {
  formatSelectedDocument,
  initialYoungEagles2027RegistrationState,
  mediaPermissionReviewLabel,
  validateYoungEagles2027Step,
  YOUNG_EAGLES_2027_DOCUMENT_SLOTS,
} from '@/lib/young-eagles-2027-registration';

import { DocumentsAndConsent } from './YoungEagles2027DocumentsConsent';
import { ChildDetails, FamilyDetails } from './YoungEagles2027FamilyChildSteps';
import { StepHeading } from './youngEagles2027PreviewUi';

const steps = [
  'Family details',
  'Child details',
  'Documents & consent',
  'Review & submit',
] as const;

const previewConfiguration = {
  applicationTiming: 'To be confirmed before launch',
  feesAndPayments: 'To be confirmed before launch',
  placementAvailability: 'To be confirmed before launch',
} as const;

export function YoungEagles2027RegistrationPreview() {
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<YoungEagles2027RegistrationState>(
    initialYoungEagles2027RegistrationState,
  );
  const [validationMessage, setValidationMessage] = useState('');

  function updateField<Key extends keyof YoungEagles2027RegistrationState>(
    key: Key,
    value: YoungEagles2027RegistrationState[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function continueJourney() {
    const message = validateYoungEagles2027Step(activeStep, values);
    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage('');
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function moveToStep(index: number) {
    if (index <= activeStep) {
      setValidationMessage('');
      setActiveStep(index);
    }
  }

  const isFieldInvalid = (field: keyof YoungEagles2027RegistrationState) =>
    Boolean(validationMessage) &&
    ((activeStep === 0 &&
      ['guardianLegalName', 'email', 'mobile', 'relationship'].includes(field)) ||
      (activeStep === 1 &&
        ['childLegalName', 'childDateOfBirth', 'intendedStart'].includes(field)) ||
      (activeStep === 2 &&
        [
          'documentPreference',
          'birthCertificate',
          'clinicCard',
          'guardianId',
          'contactConsent',
          'privacyConsent',
          'termsConsent',
        ].includes(field)));

  const stepProps = { values, updateField, isFieldInvalid };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ece8ff,_transparent_34%),linear-gradient(135deg,_#f7faff,_#f6f2ff)] px-3 py-3 text-[#2b3e5c] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[28px] border border-white/90 bg-white/90 shadow-[0_24px_70px_rgba(30,75,143,0.14)]">
        <header className="flex items-center justify-between gap-4 border-b border-[#e5ebf4] bg-white/85 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              alt="Young Eagles logo"
              className="size-11 shrink-0 rounded-[15px] object-contain"
              height={44}
              src="/images/schools/young-eagles-logo.png"
              width={44}
            />
            <div>
              <p className="font-extrabold tracking-[-0.02em] text-[#172f56]">Young Eagles</p>
              <p className="mt-0.5 text-xs text-[#64748b]">Premium early learning &amp; daycare</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d9d0fb] bg-[#f7f3ff] px-3 py-2 text-xs font-extrabold text-[#5d3db3]">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#7651d6] shadow-[0_0_0_4px_rgba(118,81,214,0.12)]"
            />
            2027 admissions preview
          </span>
        </header>

        <div className="grid gap-7 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
          <section aria-labelledby="young-eagles-2027-title">
            <div className="mb-6">
              <p className="mb-2 text-xs font-black tracking-[0.12em] text-[#7651d6] uppercase">
                A calmer registration journey
              </p>
              <h1
                id="young-eagles-2027-title"
                className="max-w-[610px] text-4xl font-extrabold tracking-[-0.055em] text-[#172f56] sm:text-5xl"
              >
                Start your child&apos;s 2027 journey with us.
              </h1>
              <p className="mt-4 max-w-[610px] leading-7 text-[#64748b]">
                A guided application for families. Review each detail before submitting when live
                admissions are open.
              </p>
            </div>

            <section
              aria-label="2027 registration application preview"
              className="overflow-hidden rounded-[22px] border border-[#e5ebf4] bg-white shadow-[0_12px_30px_rgba(23,36,61,0.06)]"
            >
              <ol
                aria-label="Registration progress"
                className="grid grid-cols-4 gap-2 border-b border-[#e5ebf4] px-4 py-5 sm:px-6"
              >
                {steps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isComplete = index < activeStep;
                  return (
                    <li key={step} className="relative min-w-0">
                      <button
                        aria-current={isActive ? 'step' : undefined}
                        className={`group grid min-w-0 text-left text-[11px] leading-4 font-extrabold transition sm:text-xs ${
                          isActive || isComplete ? 'text-[#1e4b8f]' : 'text-[#8b9ab2]'
                        } ${index <= activeStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        disabled={index > activeStep}
                        onClick={() => moveToStep(index)}
                        type="button"
                      >
                        <span
                          className={`mb-2 grid size-[22px] place-items-center rounded-full border-2 text-[10px] ${
                            isActive
                              ? 'border-[#1e4b8f] bg-[#1e4b8f] text-white'
                              : isComplete
                                ? 'border-[#7651d6] bg-[#f3efff] text-[#7651d6]'
                                : 'border-[#cbd7e7] bg-white'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 aria-hidden="true" className="size-3.5" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span>{step}</span>
                      </button>
                      {index < steps.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="absolute top-[10px] left-7 hidden h-0.5 w-[calc(100%-24px)] bg-[#e5ebf4] sm:block"
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ol>

              <div className="p-5 sm:p-6">
                {activeStep === 0 ? <FamilyDetails {...stepProps} /> : null}
                {activeStep === 1 ? <ChildDetails {...stepProps} /> : null}
                {activeStep === 2 ? <DocumentsAndConsent {...stepProps} /> : null}
                {activeStep === 3 ? <ReviewAndSubmit values={values} /> : null}

                {validationMessage ? (
                  <p
                    aria-live="polite"
                    className="mt-5 rounded-xl border border-[#f2caca] bg-[#fff7f7] px-3 py-2 text-sm text-[#9b3131]"
                    role="alert"
                  >
                    {validationMessage}
                  </p>
                ) : null}

                {activeStep < steps.length - 1 ? (
                  <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-xs text-[#8290a5]">{steps[activeStep + 1]} comes next.</p>
                    <button
                      className="rounded-xl bg-gradient-to-r from-[#1e4b8f] to-[#7651d6] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_16px_rgba(30,75,143,0.2)] transition hover:brightness-110 focus-visible:ring-4 focus-visible:ring-[#7651d6]/30 focus-visible:outline-none"
                      onClick={continueJourney}
                      type="button"
                    >
                      Continue to {steps[activeStep + 1]}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                    <button
                      className="text-sm font-bold text-[#1e4b8f] underline decoration-[#b7c9e6] underline-offset-4 focus-visible:ring-4 focus-visible:ring-[#7651d6]/30 focus-visible:outline-none"
                      onClick={() => moveToStep(2)}
                      type="button"
                    >
                      Back to documents &amp; consent
                    </button>
                    <button
                      aria-describedby="preview-submit-note"
                      className="cursor-not-allowed rounded-xl bg-[#dbe3ed] px-4 py-3 text-sm font-extrabold text-[#64748b]"
                      disabled
                      type="button"
                    >
                      Submission unavailable in preview
                    </button>
                  </div>
                )}
                {activeStep === 3 ? (
                  <p id="preview-submit-note" className="mt-3 text-xs text-[#8290a5]">
                    This preview does not send, save, or submit any information.
                  </p>
                ) : null}
              </div>
            </section>
          </section>

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
                  value={previewConfiguration.applicationTiming}
                />
                <SummaryItem
                  icon={<HeartHandshake />}
                  label="Early learning & daycare"
                  value={previewConfiguration.placementAvailability}
                />
                <SummaryItem
                  icon={<ClipboardCheck />}
                  label="Fees and payment"
                  value={previewConfiguration.feesAndPayments}
                />
              </dl>
              <p className="mt-5 border-t border-[#e7e1fb] pt-4 text-xs leading-5 text-[#756c95]">
                No 2027 dates, fees, discounts, or payment deadlines are confirmed in this preview.
              </p>
            </section>

            <section className="rounded-[20px] border border-[#e5ebf4] bg-white/80 p-5">
              <h2 className="font-extrabold tracking-[-0.015em] text-[#172f56]">
                Readiness checklist
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-5 text-[#64748b]">
                {[
                  'Parent or guardian contact details',
                  'Child details and care notes',
                  'Upload documents now or later in the app',
                  'Consent, media permission and final review',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-[#238265]"
                    />
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
        </div>
      </div>
    </main>
  );
}

function ReviewAndSubmit({ values }: { values: YoungEagles2027RegistrationState }) {
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
    ['Care schedule', 'Full-day weekday care'],
    ['Documents', documentSummary],
    ['Media permission', mediaPermissionReviewLabel(values.mediaPermission)],
  ];

  return (
    <>
      <StepHeading
        title="Review your application"
        helper="Check the details below. Nothing entered here is stored or sent to Young Eagles until live submission is enabled."
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
        Final submission, fees, and application timing remain unavailable until they are confirmed.
      </div>
    </>
  );
}

function SummaryItem({
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
