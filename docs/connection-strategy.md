# EduSitePro → EduDash Pro Connection Strategy

## Overview

EduSitePro serves as a **marketing funnel** to convert ECD centre website visitors into EduDash Pro users. This document outlines the connection strategy while maintaining complete separation between the two codebases.

## Core Principles

### 1. Zero Backend Coupling

- **No shared databases**: EduSitePro and EduDash Pro have completely separate backends
- **No API dependencies**: No direct API calls between the systems
- **Independent deployments**: Each system can be deployed and scaled independently
- **Separate authentication**: No shared user accounts or session management

### 2. Frontend-Only Integration

All integration happens at the presentation layer:

- Deep linking
- UTM parameter tracking
- Smart app banners
- Store redirects

## Integration Methods

### Deep Linking

EduSitePro uses deep links to launch EduDash Pro directly on mobile devices:

```typescript
// Example: Open EduDash Pro onboarding for ECD centres
const deepLink = buildDeepLink('/onboarding/ecd-centre', {
  utm_source: 'edusitepro',
  utm_campaign: 'website_conversion',
  template_slug: 'welcome-play',
});
```

**Deep Link Format**: `edudashpro://path?param=value`

**Fallback Strategy**:

1. Attempt to open deep link
2. Wait 1.5 seconds
3. If app not installed, redirect to app store

### UTM Tracking

All links from EduSitePro to EduDash Pro include UTM parameters for attribution:

- `utm_source=edusitepro` - Always set
- `utm_medium=website` - For website traffic
- `utm_campaign` - Specific campaign identifier
  - `website_conversion` - Main conversion funnel
  - `bulk_quote` - From bulk quote page
  - `template_view` - From template gallery
  - `app_download` - Direct app store links

### Smart App Banners

Mobile visitors see a dismissible banner prompting them to:

- Install EduDash Pro (if not installed)
- Open EduDash Pro (if already installed)

Banner behavior:

- Only shown on mobile devices
- Can be dismissed (stored in localStorage)
- Hidden for 7 days after dismissal
- Deep links directly to relevant section

## Conversion Funnel

### Primary Funnel

1. **Discovery**: User searches for "ECD websites South Africa"
2. **Landing**: Arrives at EduSitePro homepage
3. **Exploration**: Views templates, pricing, NCF alignment
4. **Decision**: Submits bulk quote or contacts sales
5. **Conversion**: Sales team mentions EduDash Pro integration
6. **Onboarding**: User downloads EduDash Pro
7. **Attribution**: UTM parameters track conversion source

### Secondary Funnel (Direct App Promotion)

1. **Website Visit**: User explores EduSitePro
2. **App Discovery**: Sees "Seamless parent communication with EduDash Pro" CTA
3. **Interest**: Clicks "Learn More" or "Get the App"
4. **Installation**: Redirected to app store with UTM tracking
5. **Onboarding**: Opens EduDash Pro with deep link parameters

## Recommended Onboarding Path in EduDash Pro

When users arrive from EduSitePro (identified by UTM parameters), EduDash Pro should:

1. **Detect Source**: Check for `utm_source=edusitepro`
2. **Tailored Onboarding**: Show ECD-specific onboarding flow
3. **Feature Highlights**: Emphasize:
   - Website integration capabilities
   - Parent communication tools
   - NCF curriculum tracking
   - Multi-centre management
4. **Special Offer**: Consider offering EduSitePro customers a discount or trial extension

### Recommended Deep Link Routes

```typescript
// ECD centre onboarding
edudashpro://onboarding/ecd-centre

// Pricing/subscription page
edudashpro://subscription/ecd-package

// Dashboard with ECD features highlighted
edudashpro://dashboard?highlight=parent-communication

// Profile setup for ECD centre
edudashpro://settings/centre-profile
```

## Tracking & Analytics

### Events to Track in EduSitePro (PostHog)

- `view_landing` - Homepage view
- `view_template` - Template gallery view
- `template_detail_view` - Individual template view
- `pricing_view` - Pricing page view
- `bulk_quote_started` - Bulk form opened
- `lead_submitted` - Quote form submitted
- `click_open_app` - Deep link clicked
- `click_app_store` - Store link clicked
- `banner_shown` - Smart banner displayed
- `banner_dismissed` - Smart banner dismissed

### Events to Track in EduDash Pro

- `edusitepro_referral` - User arrived from EduSitePro
- `edusitepro_signup` - User signed up from EduSitePro
- `edusitepro_conversion` - User became paying customer from EduSitePro

### Attribution Window

- **Primary**: 30 days from initial EduSitePro visit
- **Extended**: 90 days for bulk quotes

## Future Integration Possibilities

**⚠️ Important**: Any future backend integration MUST follow proper migration procedures in EduDash Pro repo.

### Potential Future Features (Requires Backend Changes)

1. **Shared Marketing Database**:
   - Supabase table for leads from both platforms
   - Requires migration in EduDash Pro
   - Must not break existing functionality

2. **Website Builder in EduDash Pro**:
   - Allow EduDash Pro users to create EduSitePro-style websites
   - Would require EduSitePro template API
   - Cross-platform authentication needed

3. **Unified Analytics Dashboard**:
   - Combined view of website visitors + app users
   - Requires data sharing agreement
   - Privacy/POPIA considerations

**Note**: None of these should be implemented without:

- Proper planning and architecture review
- Migrations in both repositories
- Testing in staging environments
- POPIA compliance review

## Security Considerations

### Data Privacy

- No user data shared without consent
- UTM parameters contain no PII
- Deep links don't expose sensitive information
- POPIA compliance maintained in both systems

### Cross-Site Security

- No cookies shared between domains
- No localStorage/sessionStorage sharing
- No postMessage communication
- CSP policies remain independent

## Development Guidelines

### For EduSitePro Developers

- Never hard-code EduDash Pro URLs
- Always use environment variables
- Test deep links on both Android and iOS
- Verify UTM parameters are URL-encoded
- Don't assume EduDash Pro API structure

### For EduDash Pro Developers

- Parse and respect UTM parameters
- Handle deep link routes gracefully
- Don't break when EduSitePro adds new parameters
- Log attribution data for analytics
- Provide clear onboarding for EduSitePro users

## Testing Checklist

- [ ] Deep links work on Android
- [ ] Deep links work on iOS
- [ ] Store fallback works when app not installed
- [ ] UTM parameters correctly passed
- [ ] Smart banner shows on mobile
- [ ] Smart banner can be dismissed
- [ ] Desktop users see appropriate CTAs
- [ ] All links have correct attribution

## Contact & Support

For questions about the integration:

- **EduSitePro Team**: sitepro@edudash.co.za
- **EduDash Pro Team**: support@edudash.co.za
- **Integration Issues**: Create ticket in relevant repository

---

**Remember**: Keep the codebases separate. Integration happens at the user experience level, not the backend level.
