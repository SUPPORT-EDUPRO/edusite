export const youngEagles2027InputClassName =
  'h-11 w-full rounded-xl border border-[#d6e0ed] bg-[#fbfdff] px-3 text-sm text-[#2b3e5c] outline-none transition placeholder:text-[#8290a5] focus:border-[#7651d6] focus:ring-4 focus:ring-[#7651d6]/15';

export function StepHeading({ title, helper }: { title: string; helper: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[#172f56]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#64748b]">{helper}</p>
    </div>
  );
}

export function Field({
  label,
  invalid = false,
  wide = false,
  children,
}: {
  label: string;
  invalid?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`grid gap-2 text-sm font-extrabold text-[#3e506b] ${wide ? 'sm:col-span-2' : ''}`}
    >
      <span>{label}</span>
      <span className={invalid ? '[&_input]:border-[#c45a5a] [&_select]:border-[#c45a5a]' : ''}>
        {children}
      </span>
    </label>
  );
}

export function Consent({
  checked,
  error,
  id,
  label,
  onChange,
  reference,
}: {
  checked: boolean;
  error: boolean;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
  reference?: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-5 text-[#52657f] ${error ? 'border-[#e7b2b2] bg-[#fffafa]' : 'border-[#e5ebf4] bg-[#fbfdff]'}`}
    >
      <input
        checked={checked}
        className="mt-0.5 size-4 accent-[#1e4b8f]"
        id={id}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <div className="grid gap-2">
        <label className="cursor-pointer" htmlFor={id}>
          {label}
        </label>
        {reference ? <div className="text-xs text-[#5d3db3]">{reference}</div> : null}
      </div>
    </div>
  );
}

export function Choice({
  checked,
  id,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  id: string;
  label: string;
  name: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-sm leading-5 transition ${
        checked
          ? 'border-[#9f8ae0] bg-[#f7f3ff] text-[#4f3695]'
          : 'border-[#d6e0ed] bg-white text-[#52657f]'
      }`}
      htmlFor={id}
    >
      <input
        checked={checked}
        className="mt-0.5 size-4 accent-[#1e4b8f]"
        id={id}
        name={name}
        onChange={onChange}
        type="radio"
      />
      <span>{label}</span>
    </label>
  );
}
