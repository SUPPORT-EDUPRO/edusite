import {
  PROOF_OF_PAYMENT_MAX_BYTES,
  proofUploadErrorMessage,
  REGISTRATION_REFERENCE_PATTERN,
  validateProofOfPaymentFile,
} from '@/lib/proof-of-payment';

describe('validateProofOfPaymentFile', () => {
  it('accepts a small pdf or image', () => {
    expect(validateProofOfPaymentFile({ name: 'a.pdf', size: 1000, type: 'application/pdf' })).toBe(
      '',
    );
    expect(validateProofOfPaymentFile({ name: 'a.jpg', size: 1000, type: 'image/jpg' })).toBe('');
  });

  it('rejects missing, empty, oversized and unsupported files', () => {
    expect(validateProofOfPaymentFile(null)).toContain('Choose');
    expect(validateProofOfPaymentFile({ name: 'a', size: 0, type: 'image/png' })).toContain(
      'Choose',
    );
    expect(
      validateProofOfPaymentFile({
        name: 'a',
        size: PROOF_OF_PAYMENT_MAX_BYTES + 1,
        type: 'image/png',
      }),
    ).toContain('4 MB');
    expect(
      validateProofOfPaymentFile({ name: 'a.exe', size: 10, type: 'application/x-msdownload' }),
    ).toContain('PDF');
  });
});

describe('registration reference pattern and error mapping', () => {
  it('matches references the form generates', () => {
    expect(REGISTRATION_REFERENCE_PATTERN.test('REG-2027-1791977674747-H9VKH')).toBe(true);
    expect(REGISTRATION_REFERENCE_PATTERN.test('reg-2027')).toBe(false);
  });

  it('maps DashPro upload errors to parent-friendly messages', () => {
    expect(proofUploadErrorMessage('registration_fee_waived').message).toContain(
      'No registration payment',
    );
    expect(proofUploadErrorMessage('registration_not_pending').status).toBe(409);
    expect(proofUploadErrorMessage(undefined).status).toBe(500);
  });
});
