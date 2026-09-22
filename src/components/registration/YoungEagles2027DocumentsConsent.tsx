import { useState } from 'react';

import {
  emptyDocumentSelections,
  formatSelectedDocument,
  toSelectedRegistrationDocument,
  validateRegistrationDocument,
  YOUNG_EAGLES_2027_DOCUMENT_ACCEPT,
  YOUNG_EAGLES_2027_DOCUMENT_SLOTS,
  YOUNG_EAGLES_2027_MEDIA_OPTIONS,
  type YoungEagles2027DocumentSlotId,
} from '@/lib/young-eagles-2027-registration';
import {
  YOUNG_EAGLES_2027_TERMS_ACKNOWLEDGEMENT,
  YOUNG_EAGLES_2027_TERMS_CARRYOVER_NOTE,
  YOUNG_EAGLES_2027_TERMS_LINK_LABEL,
  YOUNG_EAGLES_TERMS_PATH,
} from '@/lib/young-eagles-registration';

import type { YoungEagles2027StepProps } from './YoungEagles2027FamilyChildSteps';
import { Choice, Consent, StepHeading } from './youngEagles2027PreviewUi';

export function DocumentsAndConsent({
  values,
  updateField,
  isFieldInvalid,
}: YoungEagles2027StepProps) {
  const [fileErrors, setFileErrors] = useState<
    Partial<Record<YoungEagles2027DocumentSlotId, string>>
  >({});
  const documentPreferenceInvalid = isFieldInvalid('documentPreference');
  const immediateUploadInvalid =
    values.documentPreference === 'upload-now' &&
    YOUNG_EAGLES_2027_DOCUMENT_SLOTS.some((slot) => isFieldInvalid(slot.id));

  function chooseDocumentPreference(preference: 'upload-now' | 'upload-later') {
    updateField('documentPreference', preference);
    if (preference === 'upload-later') {
      const cleared = emptyDocumentSelections();
      updateField('birthCertificate', cleared.birthCertificate);
      updateField('clinicCard', cleared.clinicCard);
      updateField('guardianId', cleared.guardianId);
      setFileErrors({});
    }
  }

  function handleDocumentFileChange(
    slotId: YoungEagles2027DocumentSlotId,
    fileList: FileList | null,
  ) {
    const file = fileList?.[0];
    if (!file) {
      updateField(slotId, null);
      setFileErrors((current) => ({ ...current, [slotId]: undefined }));
      return;
    }

    const error = validateRegistrationDocument(file);
    if (error) {
      updateField(slotId, null);
      setFileErrors((current) => ({ ...current, [slotId]: error }));
      return;
    }

    updateField(slotId, toSelectedRegistrationDocument(file));
    setFileErrors((current) => ({ ...current, [slotId]: undefined }));
  }

  return (
    <>
      <StepHeading
        title="Documents & consent"
        helper="If you choose to upload now, select the three required documents on this step. If you choose to upload later, you add them in the EduDash Pro app after the application is linked."
      />
      <div className="grid gap-3">
        <fieldset
          aria-describedby="document-preference-help"
          className={`rounded-xl border p-4 ${documentPreferenceInvalid ? 'border-[#e7b2b2] bg-[#fffafa]' : 'border-[#e5ebf4] bg-[#fbfdff]'}`}
        >
          <legend className="px-1 text-sm font-extrabold text-[#3e506b]">
            Document preference (required)
          </legend>
          <p id="document-preference-help" className="mt-1 text-sm leading-5 text-[#52657f]">
            Immediate upload happens on this step. Later upload happens in the app after the family
            is linked. Files selected here stay on this device until a live private upload is
            available.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Choice
              checked={values.documentPreference === 'upload-now'}
              id="upload-now"
              label="Upload the required documents now"
              name="document-preference"
              onChange={() => chooseDocumentPreference('upload-now')}
            />
            <Choice
              checked={values.documentPreference === 'upload-later'}
              id="upload-later"
              label="Upload later in the EduDash Pro app"
              name="document-preference"
              onChange={() => chooseDocumentPreference('upload-later')}
            />
          </div>
        </fieldset>

        {values.documentPreference === 'upload-now' ? (
          <fieldset
            className={`rounded-xl border p-4 ${immediateUploadInvalid ? 'border-[#e7b2b2] bg-[#fffafa]' : 'border-[#e5ebf4] bg-[#fbfdff]'}`}
          >
            <legend className="px-1 text-sm font-extrabold text-[#3e506b]">
              Upload required documents now
            </legend>
            <p className="mt-1 text-sm leading-5 text-[#52657f]">
              Select a PDF, JPG, or PNG for each document. Maximum 10 MB per file.
            </p>
            <div className="mt-3 grid gap-3">
              {YOUNG_EAGLES_2027_DOCUMENT_SLOTS.map((slot) => {
                const selected = values[slot.id];
                const error = fileErrors[slot.id];
                return (
                  <label className="grid gap-2 text-sm font-extrabold text-[#3e506b]" key={slot.id}>
                    <span>{slot.label} (required)</span>
                    <input
                      accept={YOUNG_EAGLES_2027_DOCUMENT_ACCEPT}
                      aria-invalid={Boolean(error) || isFieldInvalid(slot.id)}
                      className="w-full text-sm font-semibold text-[#2b3e5c] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f3efff] file:px-3 file:py-2 file:font-extrabold file:text-[#5d3db3]"
                      onChange={(event) => handleDocumentFileChange(slot.id, event.target.files)}
                      type="file"
                    />
                    {selected ? (
                      <span className="text-xs font-semibold text-[#238265]">
                        Selected: {formatSelectedDocument(selected)}
                      </span>
                    ) : null}
                    {error ? (
                      <span className="text-xs font-semibold text-[#9b3131]">{error}</span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {values.documentPreference === 'upload-later' ? (
          <p className="rounded-xl border border-[#e5ebf4] bg-[#fbfdff] px-4 py-3 text-sm leading-5 text-[#52657f]">
            After the application is linked, upload the birth certificate, clinic card, and guardian
            ID in the EduDash Pro app. The centre’s document policy decides when each item is due.
          </p>
        ) : null}

        <Consent
          checked={values.contactConsent}
          error={isFieldInvalid('contactConsent')}
          id="contact-consent"
          label="Required application-contact acknowledgement: I am authorised to enquire about registration and agree to be contacted about this application."
          onChange={(checked) => updateField('contactConsent', checked)}
        />
        <Consent
          checked={values.privacyConsent}
          error={isFieldInvalid('privacyConsent')}
          id="privacy-consent"
          label="Required privacy acknowledgement: I understand that the published privacy information will apply to this application."
          onChange={(checked) => updateField('privacyConsent', checked)}
        />
        <Consent
          checked={values.termsConsent}
          error={isFieldInvalid('termsConsent')}
          id="terms-consent"
          label={YOUNG_EAGLES_2027_TERMS_ACKNOWLEDGEMENT}
          onChange={(checked) => updateField('termsConsent', checked)}
          reference={
            <div className="grid gap-1.5">
              <a
                className="w-fit font-extrabold underline decoration-[#9f8ae0] underline-offset-4 focus-visible:ring-4 focus-visible:ring-[#7651d6]/30 focus-visible:outline-none"
                href={YOUNG_EAGLES_TERMS_PATH}
                rel="noopener noreferrer"
                target="_blank"
              >
                {YOUNG_EAGLES_2027_TERMS_LINK_LABEL} <span>(opens in a new tab)</span>
              </a>
              <p className="text-[#756c95]">{YOUNG_EAGLES_2027_TERMS_CARRYOVER_NOTE}</p>
            </div>
          }
        />
        <fieldset className="rounded-xl border border-[#e5ebf4] bg-[#fbfdff] p-4">
          <legend className="px-1 text-sm font-extrabold text-[#3e506b]">
            Media permission (optional)
          </legend>
          <p className="mt-1 text-sm leading-5 text-[#52657f]">
            This optional choice does not affect whether the application can be made. The enrolment
            agreement also includes photography wording.
          </p>
          <div className="mt-3 grid gap-2">
            {YOUNG_EAGLES_2027_MEDIA_OPTIONS.map((option) => (
              <Choice
                checked={values.mediaPermission === option.id}
                id={`media-${option.id}`}
                key={option.id}
                label={option.label}
                name="media-permission"
                onChange={() => updateField('mediaPermission', option.id)}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </>
  );
}
