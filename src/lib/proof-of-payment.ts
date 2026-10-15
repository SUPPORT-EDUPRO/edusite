// Vercel rejects request bodies over 4.5 MB, so keep a safe margin below that.
export const PROOF_OF_PAYMENT_MAX_BYTES = 4 * 1024 * 1024;
export const PROOF_OF_PAYMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;
export const REGISTRATION_REFERENCE_PATTERN = /^REG-\d{4}-\d{10,}-[A-Z0-9]{5}$/;

export interface ProofFileInfo {
  name: string;
  size: number;
  type: string;
}

/** Returns a parent-friendly message, or '' when the file can be uploaded. */
export function validateProofOfPaymentFile(file: ProofFileInfo | null | undefined): string {
  if (!file || !file.size) return 'Choose your proof of payment file.';
  if (file.size > PROOF_OF_PAYMENT_MAX_BYTES) return 'The file must be 4 MB or smaller.';
  const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  if (!(PROOF_OF_PAYMENT_TYPES as readonly string[]).includes(type)) {
    return 'Use a PDF, JPG, PNG or WebP file.';
  }
  return '';
}

/** Maps the DashPro registration-pop-upload error codes to messages a parent can act on. */
export function proofUploadErrorMessage(code: string | undefined): {
  status: number;
  message: string;
} {
  switch (code) {
    case 'registration_not_pending':
      return {
        status: 409,
        message:
          'This application has already been reviewed, so proof can no longer be added here. Please contact the school.',
      };
    case 'registration_fee_waived':
      return { status: 409, message: 'No registration payment is due for this application.' };
    case 'invalid_file':
    case 'invalid_file_encoding':
    case 'file_size_invalid':
      return {
        status: 400,
        message: 'We could not read that file. Use a PDF, JPG or PNG up to 4 MB.',
      };
    case 'upload_conflict':
      return {
        status: 409,
        message:
          'Another upload was received at the same time. Please check your status and try again.',
      };
    default:
      return {
        status: 500,
        message: 'We could not save your proof of payment. Please try again or contact the school.',
      };
  }
}
