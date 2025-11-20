'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-stone-700 to-stone-800 text-white">
            <span className="text-xl font-bold">E</span>
          </div>
          <span className="text-xl font-bold text-stone-900">
            Edu<span className="text-amber-600">Site</span>Pro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          <Link
            href="/organizations"
            className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <span className="text-base">🏫 Schools</span>
            <span className="flex h-5 min-w-[2.5rem] items-center justify-center rounded-full bg-white/80 px-2 text-[10px] font-bold uppercase text-fuchsia-600 animate-pulse">
              Live
            </span>
          </Link>
          <Link
            href="/templates"
            className="text-sm font-medium text-stone-700 transition-colors hover:text-amber-600"
          >
            Templates
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-stone-700 transition-colors hover:text-amber-600"
          >
            Pricing
          </Link>
          <Link
            href="/bulk"
            className="text-sm font-medium text-stone-700 transition-colors hover:text-amber-600"
          >
            Bulk Services
          </Link>
          <Link
            href="/legal/privacy"
            className="text-sm font-medium text-stone-700 transition-colors hover:text-amber-600"
          >
            Privacy
          </Link>
        </div>

        {/* CTA Button - Desktop */}
        <div className="hidden md:block">
          <Link
            href="/bulk"
            className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Get Quote
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-stone-700 hover:bg-stone-100 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-white md:hidden">
          <div className="space-y-1 px-4 pt-2 pb-3">
            <Link
              href="/organizations"
              className="relative block rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 px-4 py-3 text-base font-semibold text-white shadow-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">🏫 Schools</span>
                <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold uppercase text-fuchsia-600">
                  Live
                </span>
              </div>
            </Link>
            <Link
              href="/templates"
              className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-100 hover:text-amber-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Templates
            </Link>
            <Link
              href="/pricing"
              className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-100 hover:text-amber-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/bulk"
              className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-100 hover:text-amber-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bulk Services
            </Link>
            <Link
              href="/legal/privacy"
              className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-100 hover:text-amber-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Privacy
            </Link>
            <Link
              href="/bulk"
              className="mt-4 block rounded-lg bg-amber-600 px-3 py-2.5 text-center text-base font-semibold text-white hover:bg-amber-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
