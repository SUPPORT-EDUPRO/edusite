import {
  formatYoungEaglesRand,
  formatYoungEaglesRandWithCents,
  YOUNG_EAGLES_AFTERCARE_FEE,
  YOUNG_EAGLES_MONTHLY_FEES,
  YOUNG_EAGLES_REGISTRATION_FEE_RAND,
} from '@/lib/young-eagles-fees';

export function YoungEagles2027FeeSchedule() {
  return (
    <section
      aria-labelledby="young-eagles-2027-fees-heading"
      className="mb-6 rounded-[22px] border border-[#d9d0fb] bg-gradient-to-br from-[#f8f5ff] to-white p-5 shadow-[0_12px_30px_rgba(23,36,61,0.06)] sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            className="font-extrabold tracking-[-0.015em] text-[#172f56]"
            id="young-eagles-2027-fees-heading"
          >
            Fees
          </h2>
          <p className="mt-1 text-sm leading-5 text-[#64748b]">
            One-time registration {formatYoungEaglesRand(YOUNG_EAGLES_REGISTRATION_FEE_RAND)}. Age
            fees are monthly. Aftercare is an optional extra.
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {YOUNG_EAGLES_MONTHLY_FEES.map((tier) => (
          <div className="rounded-xl border border-[#e5ebf4] bg-white px-3 py-3" key={tier.id}>
            <p className="text-xs font-extrabold tracking-wide text-[#5d3db3] uppercase">
              {tier.label}
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#172f56]">
              {formatYoungEaglesRand(tier.amountRand)}
              <span className="text-sm font-semibold text-[#64748b]">/month</span>
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-[#e5ebf4] bg-white px-3 py-3">
          <p className="text-xs font-extrabold tracking-wide text-[#5d3db3] uppercase">
            {YOUNG_EAGLES_AFTERCARE_FEE.label}
          </p>
          <p className="mt-1 text-lg font-extrabold text-[#172f56]">
            {formatYoungEaglesRandWithCents(YOUNG_EAGLES_AFTERCARE_FEE.amountRand)}
            <span className="text-sm font-semibold text-[#64748b]">/month</span>
          </p>
        </div>
      </div>
    </section>
  );
}
