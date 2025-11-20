"use client";

import { CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FloatingEnrollFabProps {
  href: string;
  label: string;
  sublabel?: string;
  accentColor?: string;
  pulse?: boolean;
}

export function FloatingEnrollFab({
  href,
  label,
  sublabel,
  accentColor = '#2563eb',
  pulse = true,
}: FloatingEnrollFabProps) {
  const [autoVisible, setAutoVisible] = useState(Boolean(sublabel));
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    if (!sublabel) {
      return undefined;
    }

    const timeout = setTimeout(() => setAutoVisible(false), 4000);
    return () => clearTimeout(timeout);
  }, [sublabel]);

  const showTooltip = Boolean(sublabel && (autoVisible || interacting));

  return (
    <div className="group fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 text-sm text-stone-700">
      {sublabel && (
        <span
          className={`max-w-xs rounded-2xl bg-white/95 px-4 py-3 text-sm font-semibold text-stone-700 shadow-lg shadow-stone-900/10 ring-1 ring-stone-100 transition-all duration-200 md:block ${
            showTooltip
              ? 'opacity-100 translate-y-0 scale-100'
              : 'pointer-events-none opacity-0 translate-y-1 scale-95'
          }`}
        >
          {sublabel}
        </span>
      )}
      <Link
        href={href}
        className="group inline-flex items-center gap-3 rounded-full px-5 py-3 font-semibold text-white shadow-2xl transition hover:translate-y-0.5"
        style={{
          background: `linear-gradient(120deg, ${accentColor}, ${accentColor}cc)`,
          boxShadow: `0 20px 45px ${accentColor}33`,
        }}
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocus={() => setInteracting(true)}
        onBlur={() => setInteracting(false)}
        aria-label={label}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ${
            pulse ? 'animate-pulse' : ''
          }`}
        >
          <CalendarCheck className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] uppercase tracking-wider text-white/70">Apply Today</span>
          <span className="text-base">{label}</span>
        </div>
      </Link>
    </div>
  );
}
