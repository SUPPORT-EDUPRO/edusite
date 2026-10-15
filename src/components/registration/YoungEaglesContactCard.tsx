import { Clock3, Mail, MapPin, Phone } from 'lucide-react';

import {
  YOUNG_EAGLES_AFTERCARE_HOURS,
  YOUNG_EAGLES_EMAILS,
  YOUNG_EAGLES_MAPS_URL,
  YOUNG_EAGLES_OPERATING_DAYS,
  YOUNG_EAGLES_PHONES,
  YOUNG_EAGLES_PHYSICAL_ADDRESS,
  YOUNG_EAGLES_SCHOOL_HOURS,
} from '@/lib/young-eagles-contact';

const linkClass = 'font-bold text-[#1e4b8f] underline-offset-2 hover:underline';

/** Hours, address, phone and email in one card, shared by the form, confirmation and status pages. */
export function YoungEaglesContactCard({ heading = 'Visit or contact us' }: { heading?: string }) {
  return (
    <section
      aria-label={heading}
      className="rounded-[20px] border border-[#e5ebf4] bg-white/90 p-5 text-sm leading-6 text-[#64748b]"
    >
      <h2 className="font-extrabold tracking-[-0.015em] text-[#172f56]">{heading}</h2>
      <ul className="mt-4 grid gap-4">
        <li className="flex gap-3">
          <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#1e4b8f]" />
          <div>
            <p className="font-extrabold text-[#354966]">{YOUNG_EAGLES_OPERATING_DAYS}</p>
            <p>School day {YOUNG_EAGLES_SCHOOL_HOURS}</p>
            <p>Aftercare {YOUNG_EAGLES_AFTERCARE_HOURS}</p>
          </div>
        </li>
        <li className="flex gap-3">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#1e4b8f]" />
          <div>
            <p>{YOUNG_EAGLES_PHYSICAL_ADDRESS}</p>
            <a className={linkClass} href={YOUNG_EAGLES_MAPS_URL} rel="noreferrer" target="_blank">
              Open directions in Google Maps (opens in a new tab)
            </a>
          </div>
        </li>
        <li className="flex gap-3">
          <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#1e4b8f]" />
          <div className="grid">
            {YOUNG_EAGLES_PHONES.map((phone) => (
              <a className={linkClass} href={phone.href} key={phone.href}>
                {phone.label}
              </a>
            ))}
          </div>
        </li>
        <li className="flex gap-3">
          <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#1e4b8f]" />
          <div className="grid">
            {YOUNG_EAGLES_EMAILS.map((email) => (
              <a className={linkClass} href={email.href} key={email.href}>
                {email.label}
              </a>
            ))}
          </div>
        </li>
      </ul>
    </section>
  );
}
