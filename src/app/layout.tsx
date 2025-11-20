import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import CookieConsent from '@/components/analytics/CookieConsent';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { OrganizationSchema, ProductSchema } from '@/components/seo/StructuredData';
import { generateMetadata as genMeta } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = genMeta();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* SEO Structured Data */}
        <OrganizationSchema />
        <ProductSchema />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <PostHogProvider>
          {children}
          <CookieConsent />
          <Analytics />
          <SpeedInsights />
        </PostHogProvider>
      </body>
    </html>
  );
}
