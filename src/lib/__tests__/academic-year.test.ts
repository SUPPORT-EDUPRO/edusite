import {
  CURRENT_ACADEMIC_YEAR,
  defaultPreferredStartDate,
  youngEaglesSchoolCode,
} from '@/lib/academic-year';
import {
  YOUNG_EAGLES_2027_TERMS_CARRYOVER_NOTE,
  YOUNG_EAGLES_BRANDING,
  YOUNG_EAGLES_REGISTRATION_MESSAGE,
  YOUNG_EAGLES_SCHOOL_CODE,
  YOUNG_EAGLES_TERMS_PATH,
  YOUNG_EAGLES_TERMS_URL,
} from '@/lib/young-eagles-registration';

describe('2027 Young Eagles academic year', () => {
  it('uses 2027 for school code, start date, and public registration copy', () => {
    expect(CURRENT_ACADEMIC_YEAR).toBe('2027');
    expect(youngEaglesSchoolCode()).toBe('YE-2027');
    expect(YOUNG_EAGLES_SCHOOL_CODE).toBe('YE-2027');
    expect(defaultPreferredStartDate()).toBe('2027-01-12');
    expect(YOUNG_EAGLES_REGISTRATION_MESSAGE).toContain('2027 academic year');
    expect(YOUNG_EAGLES_REGISTRATION_MESSAGE).not.toContain('2026 academic year');
  });

  it('carries the current Young Eagles terms document into 2027 unchanged', () => {
    expect(YOUNG_EAGLES_TERMS_PATH).toBe('/terms-young-eagles.html');
    expect(YOUNG_EAGLES_TERMS_URL).toBe(
      'https://edusitepro.edudashpro.org.za/terms-young-eagles.html',
    );
    expect(YOUNG_EAGLES_BRANDING.terms_and_conditions_url).toBe(YOUNG_EAGLES_TERMS_URL);
    expect(YOUNG_EAGLES_2027_TERMS_CARRYOVER_NOTE).toMatch(/carried over as-is for 2027/i);
    expect(YOUNG_EAGLES_2027_TERMS_CARRYOVER_NOTE).not.toMatch(/reference only/i);
  });
});
