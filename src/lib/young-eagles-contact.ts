/**
 * Public contact details, hours and addresses for Young Eagles Preschool.
 * Addresses and hours are operator-confirmed (2026-10-15). Phone numbers and emails mirror the
 * public Young Eagles website contact page; confirm them with the school if they ever change.
 */
export const YOUNG_EAGLES_PHYSICAL_ADDRESS =
  '7118 Section U Shabangu Street, Mamelodi West, Pretoria 0122';
/** The pin used by Google Maps differs from the physical address. */
export const YOUNG_EAGLES_MAPS_PIN = '848 Shabangu Avenue, Mamelodi West, Pretoria 0122';
export const YOUNG_EAGLES_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  YOUNG_EAGLES_MAPS_PIN,
)}`;

export const YOUNG_EAGLES_PHONES = [
  { label: '081 523 6000 (main)', href: 'tel:+27815236000' },
  { label: '067 494 2359 (secondary)', href: 'tel:+27674942359' },
] as const;

export const YOUNG_EAGLES_EMAILS = [
  { label: 'info@youngeagles.org.za', href: 'mailto:info@youngeagles.org.za' },
  { label: 'admin@youngeagles.org.za', href: 'mailto:admin@youngeagles.org.za' },
] as const;

export const YOUNG_EAGLES_PRIMARY_PHONE = YOUNG_EAGLES_PHONES[0];
export const YOUNG_EAGLES_PRIMARY_EMAIL = YOUNG_EAGLES_EMAILS[0];
export const YOUNG_EAGLES_WHATSAPP_URL = 'https://wa.me/27815236000';

export const YOUNG_EAGLES_OPERATING_DAYS = 'Monday to Friday';
export const YOUNG_EAGLES_SCHOOL_HOURS = '06:00–16:00';
export const YOUNG_EAGLES_AFTERCARE_HOURS = '16:30–18:30';

/** Registration-fee bank account, carried over from the existing upload-payment page. */
export const YOUNG_EAGLES_BANKING = {
  bank: 'First National Bank (FNB)',
  accountNumber: '62777403181',
  branchCode: '250655',
  accountType: 'Business',
} as const;
