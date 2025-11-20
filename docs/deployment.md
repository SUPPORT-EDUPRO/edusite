# EduSitePro Deployment Guide

## Prerequisites

- [Vercel Account](https://vercel.com)
- [GitHub Repository](https://github.com) (recommended)
- Domain registered (.co.za preferred)
- Email service (Resend API key)
- hCaptcha account (site and secret keys)
- PostHog account (optional, for analytics)

## Vercel Deployment

### Step 1: Connect Repository

1. Push code to GitHub:

   ```bash
   git remote add origin https://github.com/your-org/edusitepro.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### Step 2: Environment Variables

Add all environment variables in Vercel Dashboard:

#### Required Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://edusitepro.co.za

# EduDash Pro Integration
NEXT_PUBLIC_ANDROID_STORE_URL=https://play.google.com/store/apps/details?id=com.edudashpro
NEXT_PUBLIC_IOS_STORE_URL=https://apps.apple.com/za/app/edudash-pro/idXXXXXXXXX
NEXT_PUBLIC_EDUDASH_DEEP_LINK_BASE=edudashpro://

# Email & Lead Capture
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
MARKETING_LEADS_EMAIL_TO=leads@edusitepro.co.za

# Security (hCaptcha)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=xxxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HCAPTCHA_SECRET_KEY=0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Note**: Add these to all environments (Production, Preview, Development)

### Step 3: Domain Configuration

#### Add Custom Domain

1. In Vercel Dashboard → Project Settings → Domains
2. Add domain: `edusitepro.co.za`
3. Add www subdomain: `www.edusitepro.co.za`
4. Configure DNS records at your registrar:

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     Auto
CNAME   www     cname.vercel-dns.com            Auto
```

#### SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

- Certificate auto-renews
- HTTPS enforced by default
- HTTP → HTTPS redirect automatic

### Step 4: Build Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["cpt1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Note**: `cpt1` = Cape Town region for optimal SA performance

## Environment Setup

### Development (.env.local)

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
# ... other dev keys
```

### Production (.env.production)

Managed via Vercel Dashboard - never commit to repo

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Domain DNS records updated
- [ ] Build succeeds locally: `pnpm build`
- [ ] TypeScript passes: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] No console errors in production build
- [ ] Mobile responsive tested
- [ ] Forms tested with real email
- [ ] hCaptcha working
- [ ] Deep links tested (if applicable)
- [ ] SEO meta tags present
- [ ] sitemap.xml generating
- [ ] robots.txt accessible

## Deployment Commands

```bash
# Install Vercel CLI (optional)
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment

### 1. Verify Deployment

- [ ] Visit https://edusitepro.co.za
- [ ] Check all pages load
- [ ] Submit test lead form
- [ ] Verify email received
- [ ] Test mobile responsiveness
- [ ] Check Lighthouse scores

### 2. Configure Analytics

- [ ] PostHog events tracking
- [ ] Vercel Analytics enabled
- [ ] Google Search Console setup
- [ ] Google Analytics (if needed)

### 3. SEO Setup

```bash
# Generate sitemap (runs automatically on build)
pnpm postbuild

# Submit to Google Search Console
https://search.google.com/search-console
```

### 4. Monitoring

- Set up Vercel notifications for failed deployments
- Monitor email delivery rates
- Check form submission success rates
- Review analytics weekly

## Continuous Deployment

Vercel automatically deploys:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Branch Strategy

```
main          → Production (edusitepro.co.za)
develop       → Preview (develop.edusitepro.vercel.app)
feature/*     → Preview (unique URL per PR)
```

## Performance Optimization

### Caching Strategy

Vercel automatically caches:

- Static assets (images, fonts): 1 year
- HTML pages: Based on Next.js config
- API routes: No cache (dynamic)

### ISR (Incremental Static Regeneration)

```typescript
// For pages that change occasionally
export const revalidate = 3600; // 1 hour
```

### Edge Functions

API routes run on Edge by default - ultra-fast globally

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Reproduce locally: `pnpm build`
3. Check TypeScript errors: `pnpm typecheck`
4. Verify all dependencies installed

### Environment Variables Not Working

1. Ensure `NEXT_PUBLIC_` prefix for client-side vars
2. Redeploy after adding new variables
3. Check variable names (case-sensitive)

### Domain Not Resolving

1. Verify DNS propagation: `dig edusitepro.co.za`
2. Wait 24-48 hours for DNS propagation
3. Check Vercel domain status in dashboard

### Form Submissions Failing

1. Check Resend API key is valid
2. Verify hCaptcha secret key
3. Check server logs in Vercel
4. Test API route directly: `/api/lead`

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use environment variables** for all keys
3. **Enable hCaptcha** on all forms
4. **Keep dependencies updated**: `pnpm update`
5. **Review Vercel security headers**
6. **Monitor for suspicious activity**

## Backup & Recovery

### Database (Future)

If you add a database:

- Enable automatic backups
- Test restore procedure monthly
- Keep offsite backup

### Code

- Code in Git (GitHub)
- Vercel keeps deployment history
- Can rollback to any previous deployment

## Scaling

Vercel automatically scales:

- **Bandwidth**: Unlimited
- **Requests**: Based on plan
- **Edge Functions**: Globally distributed

For high traffic:

1. Upgrade Vercel plan if needed
2. Enable ISR for static content
3. Optimize images (Next.js Image)
4. Use CDN for heavy assets

## Cost Estimation

### Vercel

- **Pro Plan**: ~$20/month
- **Bandwidth**: Included
- **Edge Functions**: Included

### External Services

- **Resend**: ~$10/month (1,000 emails)
- **hCaptcha**: Free tier sufficient
- **PostHog**: Free tier or ~$20/month
- **Domain**: ~R100/year (.co.za)

**Total**: ~R500-800/month

## Support

### Vercel Support

- Documentation: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Email: support@vercel.com

### EduSitePro Issues

- GitHub Issues: Create ticket in repo
- Email: support@edusitepro.co.za

## Maintenance Schedule

### Weekly

- [ ] Review analytics
- [ ] Check error logs
- [ ] Monitor form submissions

### Monthly

- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Check SSL certificate status

### Quarterly

- [ ] Security audit
- [ ] Content updates
- [ ] SEO review
- [ ] Competitor analysis

---

**Last Updated**: 2025-10-13
**Maintained By**: EduSitePro Team
