import {
  RegistrationInputError,
  sanitizeYoungEagles2027Values,
  submitYoungEagles2027Application,
  validateChildDateOfBirth,
} from '@/lib/submit-public-registration';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

const validValues = {
  guardianLegalName: ' Naledi Mokoena ',
  email: 'Naledi@Example.com',
  mobile: '+27 72 000 0000',
  relationship: 'Parent',
  childLegalName: 'Amahle Mokoena',
  childDateOfBirth: '2024-04-12',
  intendedStart: 'Start of the 2027 school year',
  documentPreference: 'upload-later',
  contactConsent: true,
  privacyConsent: true,
  termsConsent: true,
  mediaPermission: 'yes',
  siblingEnrolled: true,
  // Fields the browser must never control:
  organizationId: '00000000-0000-0000-0000-000000000000',
  registrationFeeAmount: 0,
  status: 'approved',
};

function fakeClient(options: { campaigns?: unknown[]; existing?: boolean } = {}) {
  const inserted: Record<string, unknown>[] = [];
  const client = {
    from(table: string) {
      const builder = {
        select() {
          return builder;
        },
        eq() {
          return builder;
        },
        then(resolve: (value: unknown) => unknown) {
          return resolve({
            data: table === 'marketing_campaigns' ? (options.campaigns ?? []) : null,
            error: null,
          });
        },
        async maybeSingle() {
          return { data: options.existing ? { id: 'existing', status: 'pending' } : null };
        },
        insert(row: Record<string, unknown>) {
          inserted.push(row);
          return {
            select() {
              return this;
            },
            async single() {
              return { data: { id: 'reg-1' }, error: null };
            },
          };
        },
      };
      return builder;
    },
  };
  return { client, inserted };
}

describe('sanitizeYoungEagles2027Values', () => {
  it('trims and lowercases and ignores unlisted fields', () => {
    const values = sanitizeYoungEagles2027Values(validValues);
    expect(values.guardianLegalName).toBe('Naledi Mokoena');
    expect(values.email).toBe('naledi@example.com');
    expect(values).not.toHaveProperty('organizationId');
    expect(values).not.toHaveProperty('status');
  });

  it('rejects non-object input and non-string text', () => {
    expect(() => sanitizeYoungEagles2027Values(null)).toThrow(RegistrationInputError);
    expect(() => sanitizeYoungEagles2027Values({ ...validValues, mobile: 123 })).toThrow(
      RegistrationInputError,
    );
  });
});

describe('validateChildDateOfBirth', () => {
  const now = new Date('2026-10-14T10:00:00Z');
  it('accepts a normal date and rejects future, impossible and too-old dates', () => {
    expect(validateChildDateOfBirth('2024-04-12', now)).toBe('');
    expect(validateChildDateOfBirth('2030-01-01', now)).toContain('future');
    expect(validateChildDateOfBirth('2024-02-31', now)).toContain('valid');
    expect(validateChildDateOfBirth('2010-01-01', now)).toContain('up to 8');
    expect(validateChildDateOfBirth('', now)).toContain('date of birth');
  });
});

describe('submitYoungEagles2027Application', () => {
  it('always inserts for Young Eagles with a server-decided pending row', async () => {
    const { client, inserted } = fakeClient();
    const result = await submitYoungEagles2027Application(client as never, validValues);

    expect(result.id).toBe('reg-1');
    expect(result.guardianEmail).toBe('naledi@example.com');
    expect(inserted[0]).toMatchObject({
      organization_id: YOUNG_EAGLES_ORGANIZATION_ID,
      status: 'pending',
      registration_fee_amount: 400,
      registration_fee_paid: false,
    });
  });

  it('applies the sibling waiver from the database, not from the browser', async () => {
    const { client, inserted } = fakeClient({
      campaigns: [
        {
          id: 'campaign-sibling',
          organization_id: YOUNG_EAGLES_ORGANIZATION_ID,
          promo_code: 'SIBLING',
          discount_type: 'waive_registration',
          discount_value: 50,
          active: true,
          campaign_type: 'sibling_discount',
          start_date: '2026-01-01',
          end_date: '2099-12-31',
        },
      ],
    });
    await submitYoungEagles2027Application(client as never, validValues);
    expect(inserted[0]).toMatchObject({
      campaign_applied: 'campaign-sibling',
      discount_amount: 400,
      registration_fee_amount: 0,
    });
  });

  it('rejects incomplete applications before touching the database', async () => {
    const { client, inserted } = fakeClient();
    await expect(
      submitYoungEagles2027Application(client as never, { ...validValues, termsConsent: false }),
    ).rejects.toThrow(RegistrationInputError);
    expect(inserted).toHaveLength(0);
  });

  it('rejects a duplicate child', async () => {
    const { client, inserted } = fakeClient({ existing: true });
    await expect(submitYoungEagles2027Application(client as never, validValues)).rejects.toThrow(
      'already exists',
    );
    expect(inserted).toHaveLength(0);
  });
});
