# SEO Implementation Guide

## Overview

EduSitePro includes comprehensive SEO optimizations designed for the South African ECD market, including metadata management, structured data, sitemap generation, and search engine compliance.

## Features Implemented

### 1. **Metadata Management**

- **Location**: `src/lib/seo.ts`
- **Function**: `generateMetadata()`
- Generates complete metadata for each page including:
  - Title tags (format: `Page Title | EduSitePro`)
  - Meta descriptions
  - Keywords optimized for SA ECD market
  - Open Graph tags for social media sharing
  - Twitter Card metadata
  - Canonical URLs
  - Robots directives

### 2. **Structured Data (JSON-LD)**

- **Location**: `src/components/seo/StructuredData.tsx`
- Implemented schemas:
  - **OrganizationSchema**: Business information, contact details, service area (South Africa)
  - **ProductSchema**: ECD website package details, pricing, ratings
  - **BreadcrumbSchema**: Navigation hierarchy for improved SERP display

These structured data components are automatically included in the root layout for all pages.

### 3. **Sitemap Generation**

- **Location**: `src/app/sitemap.ts`
- Automatically generates `sitemap.xml` at build time
- Includes all static pages with:
  - Priority levels (1.0 for homepage, 0.9 for bulk, 0.5 for legal pages)
  - Change frequency hints
  - Last modified timestamps

### 4. **Robots.txt**

- **Location**: `src/app/robots.ts`
- Configures search engine crawling:
  - Allows all pages by default
  - Disallows: `/api/`, `/_next/`, `/admin/`
  - References sitemap location

## Usage

### Adding SEO to a New Page

```typescript
import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Page Title',
  description: 'Page description optimized for SEO',
  url: 'https://edusitepro.co.za/page-path',
});

export default function Page() {
  return <div>Your content</div>;
}
```

### Adding Breadcrumbs

```tsx
import { BreadcrumbSchema } from '@/components/seo/StructuredData';

export default function Page() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Current Page', url: '/current' },
        ]}
      />
      <div>Your content</div>
    </>
  );
}
```

## Configuration

### Environment Variables

Required in `.env.local`:

```env
# Base site URL (required)
NEXT_PUBLIC_SITE_URL=https://edusitepro.co.za

# Google Search Console verification (optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
```

### Site Configuration

Edit `src/lib/seo.ts` to customize:

- Site name and description
- Social media handles
- Contact information
- Keywords for the SA ECD market

## Testing

### 1. Verify Metadata

```bash
# Start dev server
npm run dev

# Check metadata in browser:
# - View page source (Ctrl+U)
# - Look for <meta> tags in <head>
# - Verify Open Graph and Twitter Card tags
```

### 2. Validate Structured Data

Use Google's Rich Results Test:

1. Visit: https://search.google.com/test/rich-results
2. Enter your page URL or paste HTML
3. Verify Organization and Product schemas are recognized

### 3. Check Sitemap

```bash
# After build, verify sitemap is generated
npm run build
curl http://localhost:3000/sitemap.xml

# Should return XML with all pages listed
```

### 4. Verify Robots.txt

```bash
curl http://localhost:3000/robots.txt

# Should show:
# User-agent: *
# Allow: /
# Disallow: /api/
# Sitemap: https://edusitepro.co.za/sitemap.xml
```

## Best Practices

### Keywords

Target keywords included:

- ECD websites South Africa
- early childhood development
- preschool website
- daycare website
- NCF-aligned websites
- POPIA-compliant websites

### Content Optimization

1. **Title Tags**: Keep under 60 characters
2. **Meta Descriptions**: 150-160 characters, include call-to-action
3. **URLs**: Use descriptive, keyword-rich slugs
4. **Headings**: Proper hierarchy (H1 → H2 → H3)

### Images

- Add descriptive `alt` attributes
- Use WebP format when possible
- Optimize file sizes (aim for < 100KB)
- Include keywords naturally in alt text

### Performance

SEO is heavily influenced by Core Web Vitals:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

Monitor these with Vercel Speed Insights (integrated).

## Local Market Optimization

### South African Focus

1. **Locale**: Set to `en_ZA` in Open Graph
2. **Geographic Targeting**: Google Search Console → Settings → Geographic target: South Africa
3. **Local Keywords**: Emphasize "South Africa", "SA", province names
4. **Currency**: Always display pricing in ZAR (Rands)

### Multi-language Support (Future)

While currently English-only, the site is prepared for multi-language support with:

- Proper `lang` attribute on `<html>`
- Structured data `availableLanguage` property
- Form language selection for lead capture

## Monitoring

### Google Search Console

1. Add property for `edusitepro.co.za`
2. Verify ownership using `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
3. Submit sitemap manually (if not auto-detected)
4. Monitor:
   - Search queries and rankings
   - Indexing status
   - Core Web Vitals
   - Manual actions

### Regular Audits

Run monthly SEO audits using:

- **Lighthouse**: Built into Chrome DevTools
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **Screaming Frog**: Desktop crawler for technical SEO

### Key Metrics to Track

- **Organic traffic**: Google Analytics
- **Keyword rankings**: Search Console
- **Click-through rate (CTR)**: Search Console
- **Bounce rate**: Google Analytics
- **Page load speed**: Vercel Analytics

## Troubleshooting

### Pages Not Indexed

1. Check `robots.txt` isn't blocking
2. Verify sitemap includes the page
3. Use "Request Indexing" in Search Console
4. Check for crawl errors in Search Console

### Structured Data Not Recognized

1. Validate with Rich Results Test
2. Ensure JSON-LD is in `<head>` or early in `<body>`
3. Check for JSON syntax errors
4. Wait 24-48 hours after deployment

### Poor Rankings

1. Audit content quality and keyword density
2. Improve page load speed
3. Build quality backlinks
4. Ensure mobile-friendliness
5. Check for duplicate content

## Future Enhancements

- [ ] Blog with dynamic sitemap
- [ ] Multi-language sitemaps
- [ ] FAQ schema for common questions
- [ ] Video schema for demo videos
- [ ] Review schema for testimonials
- [ ] LocalBusiness schema (if physical office)

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Vercel Analytics Guide](https://vercel.com/docs/analytics)
