# Analytics & Tracking Guide

## Overview

EduSitePro uses a multi-layered analytics approach to track the conversion funnel from website visitor to EduDash Pro user.

## Analytics Stack

### 1. PostHog (Primary)

- **Purpose**: Product analytics and user behavior
- **Features**: Events, funnels, session recording, feature flags
- **Privacy**: POPIA-compliant, hosted in EU

### 2. Vercel Analytics

- **Purpose**: Performance monitoring and Core Web Vitals
- **Features**: Real user metrics, lightweight
- **Privacy**: No cookies, privacy-friendly

### 3. Google Search Console (SEO)

- **Purpose**: Search performance and indexing
- **Features**: Keywords, impressions, click-through rates
- **Setup**: Manual verification required

## Event Taxonomy

### Naming Convention

Format: `{category}_{action}_{object}`

Examples:

- `page_view_landing`
- `cta_click_get_quote`
- `form_submit_bulk_quote`

### Event Categories

#### Page Views

```typescript
// Homepage
posthog.capture('page_view_landing', {
  referrer: document.referrer,
  utm_source: params.get('utm_source'),
  utm_campaign: params.get('utm_campaign'),
});

// Templates
posthog.capture('page_view_templates', {
  filter_elda: selectedELDA,
  filter_age: selectedAge,
});

// Pricing
posthog.capture('page_view_pricing', {
  scroll_depth: percentage,
});
```

#### User Actions

```typescript
// CTA Clicks
posthog.capture('cta_click_browse_templates', {
  location: 'hero_section',
});

posthog.capture('cta_click_view_pricing', {
  location: 'hero_section',
});

posthog.capture('cta_click_bulk_quote', {
  location: 'footer',
});
```

#### Template Interactions

```typescript
// Template viewing
posthog.capture('template_view', {
  template_slug: 'welcome-play',
  template_elda: ['well-being', 'creativity'],
  template_age_band: '3-5',
});

// Template filtering
posthog.capture('template_filter', {
  filter_type: 'elda',
  filter_value: 'communication',
});
```

#### Form Events

```typescript
// Form started
posthog.capture('form_start_bulk_quote', {
  form_location: 'bulk_page',
});

// Form fields filled
posthog.capture('form_field_complete', {
  field_name: 'centre_count',
  field_value: '5', // anonymized if PII
});

// Form validation errors
posthog.capture('form_error', {
  field_name: 'email',
  error_type: 'invalid_format',
});

// Form submission
posthog.capture('form_submit_bulk_quote', {
  centre_count: 5,
  provinces: ['gauteng', 'western_cape'],
  languages: ['en', 'af'],
  has_edudash_interest: true,
});

// Lead captured
posthog.capture('lead_captured', {
  lead_type: 'bulk_quote',
  centre_count: 5,
  estimated_value: 11995,
});
```

#### EduDash Pro Conversion

```typescript
// App link clicked
posthog.capture('app_link_click', {
  link_type: 'deep_link',
  destination: 'onboarding/ecd-centre',
  utm_campaign: 'website_conversion',
});

// Store redirect
posthog.capture('store_redirect', {
  platform: 'android',
  utm_source: 'edusitepro',
});

// Smart banner shown
posthog.capture('banner_show_app', {
  banner_type: 'smart_banner',
  user_has_app: false,
});

// Smart banner dismissed
posthog.capture('banner_dismiss_app', {
  dismiss_reason: 'user_action',
});
```

## UTM Parameter Standards

### Campaign Structure

#### Source (utm_source)

Always: `edusitepro`

#### Medium (utm_medium)

- `website` - Main website traffic
- `email` - Email campaigns
- `social` - Social media posts
- `referral` - Partner referrals

#### Campaign (utm_campaign)

```
website_conversion      - Main conversion funnel
bulk_quote             - From bulk quote form
template_view          - From template gallery
pricing_view           - From pricing page
app_download           - Direct app store links
hero_cta               - Hero section CTAs
footer_cta             - Footer CTAs
```

#### Content (utm_content) - Optional

```
hero_button
sidebar_widget
footer_link
template_card
pricing_tier_solo
pricing_tier_5pack
pricing_tier_10pack
```

#### Term (utm_term) - Optional

For paid search campaigns (future use)

### Example UTM URLs

```
# Deep link from hero section
edudashpro://onboarding/ecd-centre?utm_source=edusitepro&utm_medium=website&utm_campaign=website_conversion&utm_content=hero_button

# App store from pricing page
https://play.google.com/store/apps/details?id=com.edudashpro&utm_source=edusitepro&utm_medium=website&utm_campaign=pricing_view&utm_content=sidebar_widget

# Deep link from template detail
edudashpro://dashboard?utm_source=edusitepro&utm_medium=website&utm_campaign=template_view&utm_content=welcome_play
```

## Conversion Funnels

### Primary Funnel: Website → EduDash Pro

```
1. page_view_landing
2. page_view_pricing OR page_view_templates
3. cta_click_get_quote OR app_link_click
4. [If quote] form_submit_bulk_quote → lead_captured
5. [If app] store_redirect OR app_deep_link_open
6. [In EduDash Pro] edusitepro_signup
7. [In EduDash Pro] edusitepro_conversion
```

### Secondary Funnel: Template Exploration

```
1. page_view_templates
2. template_filter (optional, may happen multiple times)
3. template_view
4. cta_click_use_template
5. page_view_bulk
6. form_submit_bulk_quote
7. lead_captured
```

## User Properties

Track user characteristics:

```typescript
posthog.identify(anonymousId, {
  // Location (IP-based, POPIA-compliant)
  $geoip_country_code: 'ZA',
  $geoip_city_name: 'Cape Town',

  // Device
  $device_type: 'Mobile',
  $browser: 'Chrome',
  $os: 'Android',

  // Behavior
  first_visit_date: '2025-10-13',
  pages_viewed: 5,
  templates_viewed: ['welcome-play', 'bright-start'],
  has_submitted_form: false,
  has_clicked_app_link: false,

  // Attribution
  utm_source: 'google',
  utm_campaign: 'organic',
  first_referrer: 'https://google.com',
});
```

## Session Tracking

### Session Definition

- **Timeout**: 30 minutes of inactivity
- **New session on**: New day, different UTM parameters

### Session Properties

```typescript
{
  session_start: timestamp,
  session_duration: seconds,
  pages_viewed: number,
  events_count: number,
  converted: boolean,
  exit_page: string
}
```

## A/B Testing (Future)

### Feature Flags

```typescript
// Example: Test different hero CTAs
const heroVariant = posthog.getFeatureFlag('hero_cta_variant');

if (heroVariant === 'browse_templates') {
  // Show "Browse Templates" button
} else if (heroVariant === 'get_quote') {
  // Show "Get Quote" button
}

// Track which variant converted better
posthog.capture('cta_click', {
  variant: heroVariant,
  button_text: 'Browse Templates',
});
```

## Privacy & POPIA Compliance

### Data Collection Principles

1. **Minimal collection**: Only collect what's needed
2. **Anonymous by default**: No PII without consent
3. **User control**: Easy opt-out mechanism
4. **Transparent**: Clear privacy policy

### Cookie Consent

```typescript
// Only track after consent
if (hasUserConsent()) {
  posthog.opt_in_capturing();
  enableVercelAnalytics();
} else {
  posthog.opt_out_capturing();
}
```

### PII Handling

**Never track**:

- Full names
- Email addresses
- Phone numbers
- Physical addresses
- IP addresses (mask last octet)

**Can track**:

- Anonymous user IDs
- Device types
- Page URLs
- Button clicks
- General location (city level)

### Data Retention

- **PostHog**: 12 months
- **Vercel**: 30 days
- **Server logs**: 7 days

## Reporting & Dashboards

### Weekly Report

- New visitors
- Page views by page
- Top templates viewed
- Forms submitted
- Conversion rate (quote submissions)
- App link clicks

### Monthly Report

- MoM growth in visitors
- Top acquisition channels
- Conversion funnel drop-offs
- Template popularity
- EduDash Pro conversions (from their side)

### Key Metrics

```
Metric                          Target      Current
────────────────────────────────────────────────────
Website visitors                1000/mo     -
Template page views             500/mo      -
Bulk quote submissions          50/mo       -
Conversion rate                 5%          -
App link clicks                 200/mo      -
EduDash Pro signups (attrib)    10/mo       -
```

## Implementation Checklist

### PostHog Setup

- [ ] Create PostHog account
- [ ] Add project key to environment
- [ ] Install PostHog provider in layout
- [ ] Test events firing
- [ ] Create custom dashboards

### Vercel Analytics

- [ ] Enable in Vercel dashboard
- [ ] Add Analytics component to layout
- [ ] Verify data appearing

### Event Implementation

- [ ] Page view events on all pages
- [ ] CTA click events
- [ ] Form events (start, error, submit)
- [ ] Template interaction events
- [ ] App link events
- [ ] Error events

### UTM Tracking

- [ ] Deep link builder with UTM
- [ ] Store link builder with UTM
- [ ] Test all link combinations
- [ ] Document UTM strategy

## Testing

### Local Testing

```bash
# Enable debug mode in development
NEXT_PUBLIC_POSTHOG_DEBUG=true pnpm dev
```

### Production Testing

1. Open browser DevTools → Network
2. Filter for "posthog" or "vitals"
3. Perform actions
4. Verify events appear
5. Check PostHog dashboard (5 min delay)

## Support

### PostHog

- Docs: https://posthog.com/docs
- Slack: https://posthog.com/slack

### Vercel Analytics

- Docs: https://vercel.com/docs/analytics

---

**Remember**: Analytics are for improving user experience, not surveillance. Be POPIA-compliant always.
