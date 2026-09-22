export const YOUNG_EAGLES_2027_DOCUMENT_SLOTS = [
  {
    id: 'birthCertificate',
    label: 'Child birth certificate',
  },
  {
    id: 'clinicCard',
    label: 'Child clinic card (Road to Health card)',
  },
  {
    id: 'guardianId',
    label: 'Parent or guardian ID document',
  },
] as const;

export type YoungEagles2027DocumentSlotId = (typeof YOUNG_EAGLES_2027_DOCUMENT_SLOTS)[number]['id'];

export const YOUNG_EAGLES_2027_DOCUMENT_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
export const YOUNG_EAGLES_2027_MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const YOUNG_EAGLES_2027_MEDIA_OPTIONS = [
  {
    id: 'yes',
    label:
      'Yes — I give permission for photographs and videos of my child for school activities and promotional materials',
  },
  {
    id: 'not-now',
    label: 'No media permission for now',
  },
  {
    id: 'ask-me',
    label: 'Ask me later about media permission',
  },
] as const;

export type YoungEagles2027MediaPermission = (typeof YOUNG_EAGLES_2027_MEDIA_OPTIONS)[number]['id'];

export interface SelectedRegistrationDocument {
  fileName: string;
  sizeBytes: number;
  mimeType: string;
}

export interface YoungEagles2027RegistrationState {
  guardianLegalName: string;
  email: string;
  mobile: string;
  relationship: string;
  alternateContact: string;
  address: string;
  communicationPreference: string;
  emergencyContact: string;
  siblingEnrolled: boolean;
  childLegalName: string;
  childPreferredName: string;
  childDateOfBirth: string;
  intendedStart: string;
  healthSupportDisclosure: string;
  documentPreference: '' | 'upload-now' | 'upload-later';
  birthCertificate: SelectedRegistrationDocument | null;
  clinicCard: SelectedRegistrationDocument | null;
  guardianId: SelectedRegistrationDocument | null;
  contactConsent: boolean;
  privacyConsent: boolean;
  termsConsent: boolean;
  mediaPermission: '' | YoungEagles2027MediaPermission;
}

export const initialYoungEagles2027RegistrationState: YoungEagles2027RegistrationState = {
  guardianLegalName: '',
  email: '',
  mobile: '',
  relationship: '',
  alternateContact: '',
  address: '',
  communicationPreference: '',
  emergencyContact: '',
  siblingEnrolled: false,
  childLegalName: '',
  childPreferredName: '',
  childDateOfBirth: '',
  intendedStart: '',
  healthSupportDisclosure: '',
  documentPreference: '',
  birthCertificate: null,
  clinicCard: null,
  guardianId: null,
  contactConsent: false,
  privacyConsent: false,
  termsConsent: false,
  mediaPermission: '',
};

const ALLOWED_DOCUMENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);

function hasAllowedDocumentExtension(fileName: string): boolean {
  return /\.(pdf|jpe?g|png)$/i.test(fileName);
}

export function emptyDocumentSelections(): Pick<
  YoungEagles2027RegistrationState,
  YoungEagles2027DocumentSlotId
> {
  return {
    birthCertificate: null,
    clinicCard: null,
    guardianId: null,
  };
}

export function validateRegistrationDocument(file: File): string | null {
  if (!file.size) {
    return 'Choose a file that is not empty.';
  }

  if (file.size > YOUNG_EAGLES_2027_MAX_DOCUMENT_BYTES) {
    return 'Each document must be 10 MB or smaller.';
  }

  if (!ALLOWED_DOCUMENT_TYPES.has(file.type) && !hasAllowedDocumentExtension(file.name)) {
    return 'Use a PDF, JPG, or PNG file.';
  }

  return null;
}

export function toSelectedRegistrationDocument(file: File): SelectedRegistrationDocument {
  return {
    fileName: file.name,
    sizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
  };
}

export function hasImmediateUploadDocuments(values: YoungEagles2027RegistrationState): boolean {
  return YOUNG_EAGLES_2027_DOCUMENT_SLOTS.every((slot) => values[slot.id] !== null);
}

export function formatSelectedDocument(document: SelectedRegistrationDocument): string {
  const kilobytes = Math.max(1, Math.round(document.sizeBytes / 1024));
  return `${document.fileName} (${kilobytes} KB)`;
}

export function mediaPermissionReviewLabel(
  permission: YoungEagles2027RegistrationState['mediaPermission'],
): string {
  if (permission === 'yes') return 'Permission given for school photographs and videos';
  if (permission === 'not-now') return 'No media permission for now';
  if (permission === 'ask-me') return 'Ask later about media permission';
  return 'Not chosen';
}

export function validateYoungEagles2027Step(
  step: number,
  values: YoungEagles2027RegistrationState,
): string {
  if (step === 0) {
    if (
      !values.guardianLegalName.trim() ||
      !values.email.trim() ||
      !values.mobile.trim() ||
      !values.relationship
    ) {
      return 'Add the parent or guardian’s contact details to continue.';
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return 'Enter a valid email address to continue.';
  }

  if (
    step === 1 &&
    (!values.childLegalName.trim() || !values.childDateOfBirth || !values.intendedStart)
  ) {
    return 'Add the child’s required details and care preferences to continue.';
  }

  if (step === 2) {
    if (
      !values.documentPreference ||
      !values.contactConsent ||
      !values.privacyConsent ||
      !values.termsConsent
    ) {
      return 'Choose a document preference and confirm the three required acknowledgements to continue.';
    }

    if (values.documentPreference === 'upload-now' && !hasImmediateUploadDocuments(values)) {
      return 'Select the three required documents to upload now, or choose to upload later in the app.';
    }
  }

  return '';
}
