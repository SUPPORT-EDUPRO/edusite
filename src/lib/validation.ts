import { z } from 'zod';

/**
 * South African provinces
 */
export const SA_PROVINCES = [
  'eastern-cape',
  'free-state',
  'gauteng',
  'kwazulu-natal',
  'limpopo',
  'mpumalanga',
  'north-west',
  'northern-cape',
  'western-cape',
] as const;

/**
 * Supported languages
 */
export const LANGUAGES = ['en', 'af', 'zu', 'xh', 'st', 'tn'] as const;

/**
 * Lead/Bulk quote form validation schema
 */
export const leadFormSchema = z.object({
  contactName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^(\+27|0)[0-9]{9}$/, 'Invalid SA phone number (e.g., +27821234567 or 0821234567)')
    .optional(),
  centreCount: z
    .number()
    .int()
    .min(1, 'Must have at least 1 centre')
    .max(100, 'For 100+ centres, contact us directly'),
  provinces: z
    .array(z.enum(SA_PROVINCES))
    .min(1, 'Select at least one province')
    .max(9, 'Cannot select more than 9 provinces'),
  preferredLanguages: z
    .array(z.enum(LANGUAGES))
    .min(1, 'Select at least one language')
    .max(6, 'Cannot select more than 6 languages'),
  templates: z.array(z.string()).max(10, 'Maximum 10 templates').optional(),
  interestedInEduDashPro: z.boolean().optional(),
  message: z.string().max(1000, 'Message too long').optional(),
  captchaToken: z.string().min(1, 'Please complete the captcha'),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

/**
 * API response for lead submission
 */
export const leadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  leadId: z.string().optional(),
});

export type LeadResponse = z.infer<typeof leadResponseSchema>;
