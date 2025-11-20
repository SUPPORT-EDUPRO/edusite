/**
 * SEO Configuration for EduSitePro
 */

import type { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'EduSitePro',
  title: 'EduSitePro | NCF-Aligned Websites for South African ECD Centres',
  description:
    'Professional website creation for Early Childhood Development centres across South Africa. NCF-aligned templates, bulk discounts, and seamless parent communication.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://edusitepro.co.za',
  ogImage: '/images/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/edusitepro',
    facebook: 'https://facebook.com/edusitepro',
    linkedin: 'https://linkedin.com/company/edusitepro',
  },
};

export const DEFAULT_SEO = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  canonical: SITE_CONFIG.url,
  openGraph: {
    type: 'website' as const,
    locale: 'en_ZA',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    handle: '@edusitepro',
    site: '@edusitepro',
    cardType: 'summary_large_image' as const,
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content:
        'ECD websites, early childhood development, South Africa, NCF, National Curriculum Framework, preschool websites, creche websites, daycare websites',
    },
    {
      name: 'author',
      content: 'EduSitePro',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'theme-color',
      content: '#44403c', // stone-700 - warm neutral brand color
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
  ],
};

/**
 * Generate structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/logo.png`,
    description: SITE_CONFIG.description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
    },
    sameAs: Object.values(SITE_CONFIG.links),
  };
}

/**
 * Generate structured data for Service
 */
export function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Website Design and Development',
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Early Childhood Development Centres',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ZAR',
      price: '2999',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };
}

/**
 * Generate page metadata with SEO defaults
 */
interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.ogImage,
  url = SITE_CONFIG.url,
  noIndex = false,
}: SEOProps = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.title;
  const imageUrl = image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`;

  return {
    title: pageTitle,
    description,
    keywords: [
      'ECD websites South Africa',
      'early childhood development',
      'preschool website',
      'daycare website',
      'NCF-aligned websites',
      'POPIA-compliant websites',
    ],
    authors: [{ name: 'EduSitePro' }],
    creator: 'EduSitePro',
    openGraph: {
      type: 'website',
      locale: 'en_ZA',
      url,
      title: pageTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [imageUrl],
      creator: '@edusitepro',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

// Export as siteConfig for StructuredData component compatibility
export const siteConfig = SITE_CONFIG;
