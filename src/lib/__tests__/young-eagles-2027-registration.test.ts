import {
  emptyDocumentSelections,
  hasImmediateUploadDocuments,
  initialYoungEagles2027RegistrationState,
  toSelectedRegistrationDocument,
  validateRegistrationDocument,
  validateYoungEagles2027Step,
  YOUNG_EAGLES_2027_MEDIA_OPTIONS,
} from '@/lib/young-eagles-2027-registration';

function makeFile(name: string, type: string, size = 1024): File {
  const file = new File(['x'.repeat(size)], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('2027 Young Eagles document and media procedure', () => {
  it('accepts PDF, JPG and PNG documents up to 10 MB', () => {
    expect(validateRegistrationDocument(makeFile('birth.pdf', 'application/pdf'))).toBeNull();
    expect(validateRegistrationDocument(makeFile('card.jpg', 'image/jpeg'))).toBeNull();
    expect(validateRegistrationDocument(makeFile('id.png', 'image/png'))).toBeNull();
    expect(validateRegistrationDocument(makeFile('notes.txt', 'text/plain'))).toBe(
      'Use a PDF, JPG, or PNG file.',
    );
    expect(
      validateRegistrationDocument(makeFile('huge.pdf', 'application/pdf', 11 * 1024 * 1024)),
    ).toBe('Each document must be 10 MB or smaller.');
  });

  it('requires the three documents only when the family chooses to upload now', () => {
    const withoutFiles = {
      ...initialYoungEagles2027RegistrationState,
      documentPreference: 'upload-now' as const,
      contactConsent: true,
      privacyConsent: true,
      termsConsent: true,
    };
    expect(validateYoungEagles2027Step(2, withoutFiles)).toBe(
      'Select the three required documents to upload now, or choose to upload later in the app.',
    );

    const withFiles = {
      ...withoutFiles,
      birthCertificate: toSelectedRegistrationDocument(makeFile('birth.pdf', 'application/pdf')),
      clinicCard: toSelectedRegistrationDocument(makeFile('clinic.jpg', 'image/jpeg')),
      guardianId: toSelectedRegistrationDocument(makeFile('id.png', 'image/png')),
    };
    expect(hasImmediateUploadDocuments(withFiles)).toBe(true);
    expect(validateYoungEagles2027Step(2, withFiles)).toBe('');

    const later = {
      ...withoutFiles,
      documentPreference: 'upload-later' as const,
      ...emptyDocumentSelections(),
    };
    expect(validateYoungEagles2027Step(2, later)).toBe('');
  });

  it('does not require media permission and includes an explicit yes option', () => {
    expect(YOUNG_EAGLES_2027_MEDIA_OPTIONS.map((option) => option.id)).toEqual([
      'yes',
      'not-now',
      'ask-me',
    ]);
    expect(YOUNG_EAGLES_2027_MEDIA_OPTIONS[0]?.label).toMatch(/give permission/i);

    const readyToContinue = {
      ...initialYoungEagles2027RegistrationState,
      documentPreference: 'upload-later' as const,
      contactConsent: true,
      privacyConsent: true,
      termsConsent: true,
      mediaPermission: '' as const,
    };
    expect(validateYoungEagles2027Step(2, readyToContinue)).toBe('');
  });
});
