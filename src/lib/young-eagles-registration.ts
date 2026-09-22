import { CURRENT_ACADEMIC_YEAR, youngEaglesSchoolCode } from '@/lib/academic-year';

export const YOUNG_EAGLES_ORGANIZATION_ID = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';
export const YOUNG_EAGLES_SCHOOL_NAME = 'Young Eagles Preschool';
export const YOUNG_EAGLES_SLUG = 'young-eagles';
export const YOUNG_EAGLES_SCHOOL_CODE = youngEaglesSchoolCode();
export const YOUNG_EAGLES_TERMS_PATH = '/terms-young-eagles.html';
export const YOUNG_EAGLES_TERMS_URL = `https://edusitepro.edudashpro.org.za${YOUNG_EAGLES_TERMS_PATH}`;
export const YOUNG_EAGLES_2027_TERMS_ACKNOWLEDGEMENT =
  'Required terms acknowledgement: I have read and accept the Young Eagles Terms & Conditions. This is the current agreement, carried over unchanged for 2027 registration.';
export const YOUNG_EAGLES_2027_TERMS_LINK_LABEL =
  'Read the current Young Eagles Terms & Conditions';
export const YOUNG_EAGLES_2027_TERMS_LINK_ACCESSIBLE_NAME = `${YOUNG_EAGLES_2027_TERMS_LINK_LABEL} (opens in a new tab)`;
export const YOUNG_EAGLES_2027_TERMS_CARRYOVER_NOTE =
  'This is the current Young Eagles agreement. It is carried over as-is for 2027; no changes have been made.';

export const YOUNG_EAGLES_REGISTRATION_MESSAGE = `Welcome to Young Eagles Preschool! We are now accepting registrations for the ${CURRENT_ACADEMIC_YEAR} academic year. Join our nurturing environment where young minds take flight!`;

export const YOUNG_EAGLES_BRANDING = {
  id: YOUNG_EAGLES_ORGANIZATION_ID,
  name: YOUNG_EAGLES_SCHOOL_NAME,
  slug: YOUNG_EAGLES_SLUG,
  organization_type: 'preschool' as const,
  logo_url: '/images/schools/young-eagles-logo.png',
  primary_color: '#3B82F6',
  secondary_color: '#8B5CF6',
  registration_open: true,
  registration_message: YOUNG_EAGLES_REGISTRATION_MESSAGE,
  min_age: 0.5,
  max_age: 6,
  terms_and_conditions_url: YOUNG_EAGLES_TERMS_URL,
};
