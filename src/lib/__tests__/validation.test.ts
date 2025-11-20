import { LANGUAGES, leadFormSchema, leadResponseSchema, SA_PROVINCES } from '../validation';

describe('leadFormSchema', () => {
  const validLeadData = {
    contactName: 'Thabo Mbeki',
    email: 'thabo@example.co.za',
    phone: '+27821234567',
    centreCount: 5,
    provinces: ['gauteng', 'western-cape'],
    preferredLanguages: ['en', 'af'],
    templates: ['welcome-play'],
    interestedInEduDashPro: true,
    message: 'Interested in bulk package',
    captchaToken: 'test-captcha-token',
  };

  describe('valid inputs', () => {
    it('should accept valid lead data', () => {
      const result = leadFormSchema.safeParse(validLeadData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactName).toBe('Thabo Mbeki');
        expect(result.data.centreCount).toBe(5);
      }
    });

    it('should accept phone number with 0 prefix', () => {
      const data = { ...validLeadData, phone: '0821234567' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept data without optional fields', () => {
      const minimalData = {
        contactName: 'Neo Sithole',
        email: 'neo@test.com',
        centreCount: 1,
        provinces: ['limpopo'],
        preferredLanguages: ['en'],
        captchaToken: 'token',
      };
      const result = leadFormSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should accept all 9 provinces', () => {
      const data = { ...validLeadData, provinces: [...SA_PROVINCES] };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept all 6 languages', () => {
      const data = { ...validLeadData, preferredLanguages: [...LANGUAGES] };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('contactName validation', () => {
    it('should reject names shorter than 2 characters', () => {
      const data = { ...validLeadData, contactName: 'X' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('at least 2 characters'))).toBe(
          true,
        );
      }
    });

    it('should reject names longer than 100 characters', () => {
      const data = { ...validLeadData, contactName: 'A'.repeat(101) };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('too long'))).toBe(true);
      }
    });

    it('should accept exactly 2 characters', () => {
      const data = { ...validLeadData, contactName: 'AB' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const data = { ...validLeadData, email: 'not-an-email' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('Invalid email'))).toBe(true);
      }
    });

    it('should reject email without @', () => {
      const data = { ...validLeadData, email: 'test.com' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept valid .co.za email', () => {
      const data = { ...validLeadData, email: 'user@example.co.za' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('phone validation', () => {
    it('should reject invalid phone format', () => {
      const data = { ...validLeadData, phone: '123456' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('Invalid SA phone number'))).toBe(
          true,
        );
      }
    });

    it('should reject phone with incorrect country code', () => {
      const data = { ...validLeadData, phone: '+1234567890' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject phone with too few digits', () => {
      const data = { ...validLeadData, phone: '+2782123' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow missing phone (optional field)', () => {
      const { phone: _omit, ...data } = validLeadData;
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('centreCount validation', () => {
    it('should reject 0 centres', () => {
      const data = { ...validLeadData, centreCount: 0 };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('at least 1'))).toBe(true);
      }
    });

    it('should reject negative numbers', () => {
      const data = { ...validLeadData, centreCount: -5 };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject more than 100 centres', () => {
      const data = { ...validLeadData, centreCount: 101 };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('contact us directly'))).toBe(
          true,
        );
      }
    });

    it('should accept exactly 100 centres', () => {
      const data = { ...validLeadData, centreCount: 100 };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject decimal numbers', () => {
      const data = { ...validLeadData, centreCount: 5.5 };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('provinces validation', () => {
    it('should reject empty provinces array', () => {
      const data = { ...validLeadData, provinces: [] };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('at least one province'))).toBe(
          true,
        );
      }
    });

    it('should reject invalid province name', () => {
      const data = { ...validLeadData, provinces: ['invalid-province'] };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept single province', () => {
      const data = { ...validLeadData, provinces: ['gauteng'] };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('preferredLanguages validation', () => {
    it('should reject empty languages array', () => {
      const data = { ...validLeadData, preferredLanguages: [] };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('at least one language'))).toBe(
          true,
        );
      }
    });

    it('should reject invalid language code', () => {
      const data = { ...validLeadData, preferredLanguages: ['fr'] };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept multiple languages', () => {
      const data = { ...validLeadData, preferredLanguages: ['en', 'af', 'zu'] };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('message validation', () => {
    it('should reject message longer than 1000 characters', () => {
      const data = { ...validLeadData, message: 'A'.repeat(1001) };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('too long'))).toBe(true);
      }
    });

    it('should accept exactly 1000 characters', () => {
      const data = { ...validLeadData, message: 'A'.repeat(1000) };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty message', () => {
      const data = { ...validLeadData, message: '' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('captchaToken validation', () => {
    it('should reject empty captcha token', () => {
      const data = { ...validLeadData, captchaToken: '' };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('captcha'))).toBe(true);
      }
    });

    it('should reject missing captcha token', () => {
      const { captchaToken: _omit, ...data } = validLeadData;
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('templates validation', () => {
    it('should reject more than 10 templates', () => {
      const data = { ...validLeadData, templates: Array(11).fill('template') };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('Maximum 10'))).toBe(true);
      }
    });

    it('should accept up to 10 templates', () => {
      const data = { ...validLeadData, templates: Array(10).fill('template') };
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow missing templates', () => {
      const { templates: _omit, ...data } = validLeadData;
      const result = leadFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('leadResponseSchema', () => {
  it('should accept valid response with leadId', () => {
    const response = {
      success: true,
      message: 'Lead created successfully',
      leadId: 'lead-123',
    };
    const result = leadResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('should accept valid response without leadId', () => {
    const response = {
      success: false,
      message: 'Error creating lead',
    };
    const result = leadResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('should reject response without success field', () => {
    const response = {
      message: 'Some message',
    };
    const result = leadResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('should reject response without message field', () => {
    const response = {
      success: true,
    };
    const result = leadResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});
