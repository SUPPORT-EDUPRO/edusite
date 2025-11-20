# Domain Strategy - EduDash Pro Ecosystem

**Date:** October 13, 2025  
**Primary Domain:** edudashpro.org.za

---

## 🌐 Domain Architecture

### Current Setup

```
edudashpro.org.za
├── Main application (Expo/React Native web)
└── Marketing site options below
```

### Option A: Subdomain (Recommended)

```
edudashpro.org.za              → Main EduDash Pro app
edusitepro.edudashpro.org.za   → Marketing site (this repo)
```

**Pros:**

- ✅ Clear separation of concerns
- ✅ Independent deployments
- ✅ Easy to manage DNS
- ✅ Can use different hosting (Vercel for both)

**DNS Configuration:**

```
Type    Name                Value
CNAME   edusitepro          cname.vercel-dns.com
```

### Option B: Path-based

```
edudashpro.org.za          → Main EduDash Pro app
edudashpro.org.za/site     → Marketing site
```

**Pros:**

- ✅ Single domain
- ✅ Unified SSL cert

**Cons:**

- ❌ Complex routing
- ❌ Both apps need coordination
- ❌ Harder to maintain separately

---

## 📋 Deployment Strategy

### EduSitePro (Marketing Site - This Repo)

**Deployment:** Vercel  
**Domain:** `edusitepro.edudashpro.org.za` _(recommended)_  
**Purpose:** Lead generation, template showcase, bulk packages

**Environment Variables:**

```env
NEXT_PUBLIC_SITE_URL=https://edusitepro.edudashpro.org.za
NEXT_PUBLIC_EDUDASH_APP_URL=https://edudashpro.org.za
MARKETING_LEADS_EMAIL_TO=leads@edudashpro.org.za
```

### EduDash Pro (Main App)

**Deployment:** Already live at edudashpro.org.za  
**Tech:** Expo web  
**Purpose:** The actual educational platform

---

## 🔗 Cross-Linking Strategy

### From EduSitePro → EduDash Pro

1. **Smart App Banner** ✅ (already updated)
   - Shows on mobile
   - Links to edudashpro.org.za
   - Tries deep link first (edudashpro://)
   - Falls back to web app

2. **CTAs throughout site**
   - "Try EduDash Pro" buttons
   - "Already have an account? Login" → edudashpro.org.za/login
   - Footer links

3. **After Lead Submission**
   - Thank you page: "While you wait, explore EduDash Pro"
   - Link to app with UTM parameters

### From EduDash Pro → EduSitePro

1. **"Get a Website" CTA** in app settings
2. **Bulk package promotions** for multi-centre owners
3. **Referral links** for users to share

---

## 📧 Email Addresses

Consolidate to .org.za domain:

```
leads@edudashpro.org.za       → Marketing leads
support@edudashpro.org.za     → Customer support
hello@edudashpro.org.za       → General inquiries
noreply@edudashpro.org.za     → Automated emails
```

---

## 🎯 Analytics & Tracking

### UTM Parameters Standard

All links from EduSitePro → EduDash Pro:

```
utm_source=edusitepro
utm_medium=website
utm_campaign=[specific_campaign]
```

Examples:

```
https://edudashpro.org.za?utm_source=edusitepro&utm_medium=website&utm_campaign=hero_cta
https://edudashpro.org.za/signup?utm_source=edusitepro&utm_medium=website&utm_campaign=bulk_quote_conversion
```

### Separate Analytics Properties

- **EduSitePro:** PostHog project for marketing metrics
- **EduDash Pro:** Separate PostHog project for app usage

---

## 🚀 Implementation Checklist

### Phase 1: Current State (Today)

- [x] Update smart banner to use edudashpro.org.za
- [x] Fix all .org.za references
- [x] Document domain strategy
- [ ] Test banner on mobile (dev server running)

### Phase 2: DNS Configuration (When Ready for Production)

1. Add subdomain CNAME record in domain registrar
2. Configure custom domain in Vercel
3. Verify SSL certificate
4. Test redirection

### Phase 3: Cross-linking

1. Add "Try EduDash Pro" CTAs to EduSitePro
2. Add "Get a Website" link in EduDash Pro app
3. Implement UTM tracking
4. Set up conversion funnels in PostHog

---

## 📝 Notes

- All domains use **.org.za** (not .com or .co.za)
- Main brand is **EduDash Pro**
- **EduSitePro** is a service offering, not a separate brand
- Keep messaging consistent: "Get a professional website for your ECD centre"
- Don't confuse users with multiple brand names

---

## ✅ Recommendation

Use **edusitepro.edudashpro.org.za** as the subdomain for this marketing site.

**Benefits:**

- Clear hierarchy (edudashpro is parent brand)
- Easy to remember and explain
- Professional appearance
- Simple deployment and maintenance

**Alternative naming:**

- `site.edudashpro.org.za` - if you want shorter
- `www.edudashpro.org.za` - redirect to main app
- `marketing.edudashpro.org.za` - internal name
