import type { YoungEagles2027RegistrationState } from '@/lib/young-eagles-2027-registration';

import { Field, StepHeading, youngEagles2027InputClassName } from './youngEagles2027PreviewUi';

export interface YoungEagles2027StepProps {
  values: YoungEagles2027RegistrationState;
  updateField: <Key extends keyof YoungEagles2027RegistrationState>(
    key: Key,
    value: YoungEagles2027RegistrationState[Key],
  ) => void;
  isFieldInvalid: (field: keyof YoungEagles2027RegistrationState) => boolean;
}

export function FamilyDetails({ values, updateField, isFieldInvalid }: YoungEagles2027StepProps) {
  return (
    <>
      <StepHeading
        title="Tell us about the family"
        helper="Only fields marked required are needed for an initial application. This preview does not collect ID numbers, employer details, or detailed financial information."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Guardian legal name (required)" invalid={isFieldInvalid('guardianLegalName')}>
          <input
            autoComplete="name"
            aria-invalid={isFieldInvalid('guardianLegalName')}
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('guardianLegalName', event.target.value)}
            placeholder="e.g. Naledi Mokoena"
            required
            value={values.guardianLegalName}
          />
        </Field>
        <Field label="Email address (required)" invalid={isFieldInvalid('email')}>
          <input
            autoComplete="email"
            aria-invalid={isFieldInvalid('email')}
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={values.email}
          />
        </Field>
        <Field label="Mobile number (required)" invalid={isFieldInvalid('mobile')}>
          <input
            autoComplete="tel"
            aria-invalid={isFieldInvalid('mobile')}
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('mobile', event.target.value)}
            placeholder="+27 72 000 0000"
            required
            type="tel"
            value={values.mobile}
          />
        </Field>
        <Field label="Relationship to child (required)" invalid={isFieldInvalid('relationship')}>
          <select
            aria-invalid={isFieldInvalid('relationship')}
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('relationship', event.target.value)}
            required
            value={values.relationship}
          >
            <option value="">Select a relationship</option>
            <option>Parent</option>
            <option>Legal guardian</option>
            <option>Other caregiver</option>
          </select>
        </Field>
        <Field label="Alternate contact (optional)">
          <input
            autoComplete="tel"
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('alternateContact', event.target.value)}
            placeholder="Name and mobile number"
            type="tel"
            value={values.alternateContact}
          />
        </Field>
        <Field label="Communication preference (optional)">
          <select
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('communicationPreference', event.target.value)}
            value={values.communicationPreference}
          >
            <option value="">Select a preference</option>
            <option>Email</option>
            <option>Mobile call</option>
            <option>WhatsApp</option>
          </select>
        </Field>
        <Field label="Home address (optional)" wide>
          <input
            autoComplete="street-address"
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('address', event.target.value)}
            placeholder="Area or street address"
            value={values.address}
          />
        </Field>
        <Field label="Emergency contact (optional)" wide>
          <input
            autoComplete="tel"
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('emergencyContact', event.target.value)}
            placeholder="Name, relationship and mobile number"
            type="tel"
            value={values.emergencyContact}
          />
        </Field>
      </div>
    </>
  );
}

export function ChildDetails({ values, updateField, isFieldInvalid }: YoungEagles2027StepProps) {
  return (
    <>
      <StepHeading
        title="Tell us about your child"
        helper="Share only the essentials for an initial application. Detailed medical information is requested later only when it is required and approved."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Child legal name (required)" invalid={isFieldInvalid('childLegalName')}>
          <input
            autoComplete="off"
            aria-invalid={isFieldInvalid('childLegalName')}
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('childLegalName', event.target.value)}
            placeholder="e.g. Amahle Mokoena"
            required
            value={values.childLegalName}
          />
        </Field>
        <Field label="Preferred name (optional)">
          <input
            autoComplete="off"
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('childPreferredName', event.target.value)}
            placeholder="What should we call your child?"
            value={values.childPreferredName}
          />
        </Field>
        <Field label="Date of birth (required)" invalid={isFieldInvalid('childDateOfBirth')}>
          <input
            aria-invalid={isFieldInvalid('childDateOfBirth')}
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('childDateOfBirth', event.target.value)}
            required
            type="date"
            value={values.childDateOfBirth}
          />
        </Field>
        <Field label="Intended start (required)" invalid={isFieldInvalid('intendedStart')}>
          <select
            aria-invalid={isFieldInvalid('intendedStart')}
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('intendedStart', event.target.value)}
            required
            value={values.intendedStart}
          >
            <option value="">Select a preference</option>
            <option>Start of the 2027 school year</option>
            <option>Later in 2027</option>
            <option>I would like guidance</option>
          </select>
        </Field>
        <div className="grid gap-2 text-sm font-extrabold text-[#3e506b] sm:col-span-2">
          <span>Attendance / care schedule</span>
          <p className="rounded-xl border border-[#d6e0ed] bg-[#fbfdff] px-3 py-3 text-sm font-semibold text-[#2b3e5c]">
            Full-day weekday care
          </p>
          <p className="text-sm leading-5 font-normal text-[#64748b]">
            Weekend Care is not part of this registration. It is a separate optional booking,
            available only after a linked guardian signs in; availability and prices are confirmed
            later.
          </p>
        </div>
        <Field label="Initial health or support disclosure (optional)" wide>
          <select
            className={youngEagles2027InputClassName}
            onChange={(event) => updateField('healthSupportDisclosure', event.target.value)}
            value={values.healthSupportDisclosure}
          >
            <option value="">Nothing to share at this stage</option>
            <option>A health consideration to discuss</option>
            <option>An accessibility or learning-support need to discuss</option>
            <option>Please contact me to discuss</option>
          </select>
        </Field>
      </div>
    </>
  );
}
