export const YOUNG_EAGLES_REGISTRATION_FEE_RAND = 400;
export const YOUNG_EAGLES_AFTERCARE_FEE_RAND = 300;

export const YOUNG_EAGLES_MONTHLY_FEES = [
  { id: 'baby', label: '6 months - 1 year', amountRand: 950 },
  { id: 'toddler', label: '1 - 3 years', amountRand: 720 },
  { id: 'preschool', label: '4 - 6 years', amountRand: 680 },
] as const;

export const YOUNG_EAGLES_AFTERCARE_FEE = {
  id: 'aftercare',
  label: 'Aftercare',
  amountRand: YOUNG_EAGLES_AFTERCARE_FEE_RAND,
} as const;

export function formatYoungEaglesRand(amountRand: number): string {
  return `R${amountRand}`;
}

export function formatYoungEaglesRandWithCents(amountRand: number): string {
  return `R${amountRand.toFixed(2)}`;
}
