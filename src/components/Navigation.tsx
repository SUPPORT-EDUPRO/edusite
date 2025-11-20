'use client';

import { ArrowLeft, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: 'internal' | 'external' | 'page';
}

interface NavigationProps {
  tenantName: string;
  menuItems?: MenuItem[];
  tenantLogo?: string;
  websiteUrl?: string;
  accentColor?: string;
  backHref?: string;
}

export function Navigation({
  tenantName,
  menuItems = [],
  tenantLogo,
  websiteUrl,
  accentColor,
  backHref = '/organizations',
}: NavigationProps) {
  const router = useRouter();

  const normalizedWebsite = websiteUrl
    ? websiteUrl.startsWith('http')
      ? websiteUrl
      : `https://${websiteUrl}`
    : undefined;

  const brandColor = accentColor || '#2563eb';
  const initial = tenantName?.charAt(0).toUpperCase() || 'E';

  const handleBackNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

    if (isModifiedClick) {
      return;
    }

    event.preventDefault();

    if (backHref) {
      router.replace(backHref);
    } else {
      router.back();
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === 'external') {
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
        >
          {item.label}
        </a>
      );
    }

    return (
      <Link
        href={item.url}
        className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            onClick={handleBackNavigation}
            className="hidden rounded-full border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-900 sm:inline-flex sm:items-center sm:gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schools
          </Link>
          <Link
            href={backHref}
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-900 sm:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {tenantLogo ? (
            <div className="relative hidden h-14 w-14 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-md sm:block">
              <Image src={tenantLogo} alt={`${tenantName} logo`} fill className="object-contain p-2" />
            </div>
          ) : (
            <div
              className="hidden h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-inner sm:flex"
              style={{ backgroundColor: brandColor }}
            >
              {initial}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Powered by EduSitePro</p>
            <p className="text-lg font-semibold text-stone-900">{tenantName}</p>
            <p className="text-sm text-stone-500">In partnership with EduDash Pro</p>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <span key={item.id}>{renderMenuItem(item)}</span>
            ))
          ) : normalizedWebsite ? (
            <a
              href={normalizedWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </a>
          ) : (
            <span className="text-sm text-stone-500">More navigation coming soon</span>
          )}
        </div>

        <div className="flex items-center gap-3">

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
          >
            Apply Now
          </Link>
        </div>
      </div>

      {menuItems.length > 0 ? (
        <div className="border-t border-stone-100 bg-white lg:hidden">
          <div className="flex gap-4 overflow-x-auto px-4 py-3">
            {menuItems.map((item) => (
              <div key={item.id}>{renderMenuItem(item)}</div>
            ))}
          </div>
        </div>
      ) : normalizedWebsite ? (
        <div className="border-t border-stone-100 bg-white lg:hidden">
          <a
            href={normalizedWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-4 my-3 inline-flex w-auto items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
          >
            <ExternalLink className="h-4 w-4" />
            Visit Website
          </a>
        </div>
      ) : null}
    </nav>
  );
}
