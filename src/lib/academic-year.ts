export const CURRENT_ACADEMIC_YEAR = '2027';

export function youngEaglesSchoolCode(year: string = CURRENT_ACADEMIC_YEAR): string {
  return `YE-${year}`;
}

export function defaultPreferredStartDate(year: string = CURRENT_ACADEMIC_YEAR): string {
  return `${year}-01-12`;
}
