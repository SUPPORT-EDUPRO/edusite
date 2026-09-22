'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { persistYoungEagles2027Registration } from '@/lib/persist-young-eagles-2027-registration';
import {
  type RegistrationCampaignView,
  resolveDisplayedRegistrationCampaign,
} from '@/lib/registration-campaign';
import {
  initialYoungEagles2027RegistrationState,
  validateYoungEagles2027Step,
  type YoungEagles2027RegistrationState,
} from '@/lib/young-eagles-2027-registration';
import {
  formatYoungEaglesRandWithCents,
  YOUNG_EAGLES_REGISTRATION_FEE_RAND,
} from '@/lib/young-eagles-fees';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

import { RegistrationCampaignBanner } from './RegistrationCampaignBanner';
import { DocumentsAndConsent } from './YoungEagles2027DocumentsConsent';
import { ChildDetails, FamilyDetails } from './YoungEagles2027FamilyChildSteps';
import { YoungEagles2027FeeSchedule } from './YoungEagles2027FeeSchedule';
import {
  RegistrationInfoAside,
  ReviewAndSubmit,
  SubmittedConfirmation,
} from './YoungEagles2027Review';

const steps = [
  'Family details',
  'Child details',
  'Documents & consent',
  'Review & submit',
] as const;

export function YoungEagles2027RegistrationPreview({
  activeCampaign = null,
  siblingCampaign = null,
  mode = 'preview',
  organizationId,
}: {
  activeCampaign?: RegistrationCampaignView | null;
  siblingCampaign?: RegistrationCampaignView | null;
  mode?: 'preview' | 'live';
  organizationId?: string;
}) {
  const persistEnabled = mode === 'live' && organizationId === YOUNG_EAGLES_ORGANIZATION_ID;
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
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

  const displayedCampaign = useMemo(
    () =>
      resolveDisplayedRegistrationCampaign({
        siblingEnrolled: values.siblingEnrolled,
        siblingCampaign,
        typedCampaign: null,
        autoCampaign: activeCampaign,
      }),
    [activeCampaign, siblingCampaign, values.siblingEnrolled],
  );

  const siblingHelp = siblingCampaign
    ? `Applies the sibling registration waiver (${formatYoungEaglesRandWithCents(YOUNG_EAGLES_REGISTRATION_FEE_RAND)} → ${formatYoungEaglesRandWithCents(siblingCampaign.finalAmount)}).`
    : 'We will note that a sibling is enrolled. No sibling fee waiver is currently active.';

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

  const stepProps = { values, updateField, isFieldInvalid, siblingHelp };

  async function submitLiveApplication() {
    const message = validateYoungEagles2027Step(2, values);
    if (message) {
      setSubmitError(message);
      return;
    }
    if (!organizationId) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const { supabase } = await import('@/lib/supabase');
      await persistYoungEagles2027Registration(supabase, {
        organizationId,
        values,
        campaign: displayedCampaign,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit registration. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <SubmittedConfirmation childLegalName={values.childLegalName} />;
  }

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
            {persistEnabled ? '2027 admissions open' : '2027 admissions preview'}
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
                {persistEnabled
                  ? 'A guided application for families. Review each detail before submitting.'
                  : 'A guided application for families. Review each detail before submitting when live admissions are open.'}
              </p>
            </div>

            {displayedCampaign ? (
              <RegistrationCampaignBanner campaign={displayedCampaign} />
            ) : null}

            <YoungEagles2027FeeSchedule />

            <section
              aria-label={
                persistEnabled
                  ? '2027 registration application'
                  : '2027 registration application preview'
              }
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
                {activeStep === 3 ? (
                  <ReviewAndSubmit persistEnabled={persistEnabled} values={values} />
                ) : null}

                {validationMessage || submitError ? (
                  <p
                    aria-live="polite"
                    className="mt-5 rounded-xl border border-[#f2caca] bg-[#fff7f7] px-3 py-2 text-sm text-[#9b3131]"
                    role="alert"
                  >
                    {validationMessage || submitError}
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
                ) : persistEnabled ? (
                  <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                    <button
                      className="text-sm font-bold text-[#1e4b8f] underline decoration-[#b7c9e6] underline-offset-4 focus-visible:ring-4 focus-visible:ring-[#7651d6]/30 focus-visible:outline-none"
                      onClick={() => moveToStep(2)}
                      type="button"
                    >
                      Back to documents &amp; consent
                    </button>
                    <button
                      className="rounded-xl bg-gradient-to-r from-[#1e4b8f] to-[#7651d6] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_16px_rgba(30,75,143,0.2)] transition hover:brightness-110 focus-visible:ring-4 focus-visible:ring-[#7651d6]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={submitting}
                      onClick={() => void submitLiveApplication()}
                      type="button"
                    >
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                          Submitting
                        </span>
                      ) : (
                        'Submit registration'
                      )}
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
                {activeStep === 3 && !persistEnabled ? (
                  <p id="preview-submit-note" className="mt-3 text-xs text-[#8290a5]">
                    This preview does not send, save, or submit any information.
                  </p>
                ) : null}
              </div>
            </section>
          </section>

          <RegistrationInfoAside persistEnabled={persistEnabled} />
        </div>
      </div>
    </main>
  );
}
