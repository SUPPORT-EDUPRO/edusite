# EduSitePro Deployment Guide

## Recommended Domain Structure

**Primary choice: Subdomain**

- **URL**: `edusitepro.edudashpro.org.za`
- **Rationale**: Separate brand identity, clean URLs, future flexibility

**Alternative: Subdirectory** (not recommended)

- **URL**: `edudashpro.org.za/edusitepro`
- **Use case**: If you want unified domain authority for SEO

---

## Deployment to Vercel (Subdomain Setup)

### Prerequisites

- Vercel account connected to GitHub
- Access to DNS management for `edudashpro.org.za`
- EduSitePro repository pushed to GitHub

### Step 1: Configure DNS

**In your DNS provider** (Cloudflare, GoDaddy, Namecheap, etc.):

1. Log in to DNS management
2. Navigate to DNS records for `edudashpro.org.za`
3. Add a new record:

```
Type:  CNAME
Name:  edusitepro  (or edusitepro.edudashpro.org.za depending on provider)
Value: cname.vercel-dns.com
TTL:   Auto (or 3600 seconds)
```

4. Save the record
5. Wait 5-10 minutes for DNS propagation (can take up to 48h in rare cases)

**Verification**: Check DNS propagation

```bash
dig edusitepro.edudashpro.org.za
# or visit: https://dnschecker.org/
```

---

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended for First Deploy)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Import Project**:
   - Click "Add New" → "Project"
   - Select your GitHub repository: `edusitepro`
   - Configure as follows:

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next (auto-detected)
Install Command: npm install
```

3. **Environment Variables** (if needed):
   - Add any `.env` variables
   - For now, leave empty unless you have API keys

4. **Click "Deploy"**
   - Vercel will build and deploy
   - Initial deploy takes 2-5 minutes
   - You'll get a URL like: `edusitepro-xyz123.vercel.app`

5. **Test the deployment**:
   - Visit the Vercel URL
   - Check that templates load: `/templates`
   - Verify: `/templates/coding-blocks`, `/templates/little-engineers`

#### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /home/king/Desktop/edusitepro
vercel

# Follow prompts:
# - Link to existing project? Yes (if you have one)
# - Set up and deploy? Yes

# For production deploy:
vercel --prod
```

---

### Step 3: Add Custom Domain to Vercel

1. **In Vercel Dashboard**, go to your project
2. Navigate to **Settings** → **Domains**
3. Click **"Add"**
4. Enter: `edusitepro.edudashpro.org.za`
5. Click **"Add"**

**Vercel will**:

- Verify DNS (checks for CNAME record)
- Issue SSL certificate automatically (Let's Encrypt)
- Set up HTTPS redirect
- Configure CDN

**Status will show**:

- ⏳ "Pending Verification" → Wait for DNS propagation
- ✅ "Valid Configuration" → Domain is live!

**Timeframe**: 5 minutes to 2 hours depending on DNS propagation

---

### Step 4: Set Primary Domain (Optional)

If you have multiple domains (e.g., the Vercel default + custom domain):

1. In Vercel **Domains** settings
2. Find `edusitepro.edudashpro.org.za`
3. Click **"..." menu** → **"Set as Primary"**
4. This redirects all other domains to your custom one

---

### Step 5: Configure Redirects (Optional)

If you want `www.edusitepro.edudashpro.org.za` to redirect:

**Option 1: Via DNS**
Add another CNAME:

```
Type:  CNAME
Name:  www.edusitepro
Value: edusitepro.edudashpro.org.za
```

**Option 2: Via Vercel**

- Add `www.edusitepro.edudashpro.org.za` as another domain
- Set main domain as primary
- Vercel auto-redirects

---

## Alternative: Subdirectory Deployment

If you choose `edudashpro.org.za/edusitepro` instead:

### Update Next.js Config

Edit `next.config.mjs`:

```javascript
const nextConfig = {
  basePath: '/edusitepro',
  assetPrefix: '/edusitepro',
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};
```

### Update All Internal Links

Add `basePath` to all `<Link>` components:

- `/templates` becomes `/edusitepro/templates`
- Or use `basePath` from `next.config.js`

### Deployment

- Deploy EduSitePro as separate Vercel project
- Use Vercel's **Rewrites** to route `/edusitepro/*` to this project
- Or deploy alongside main EduDash Pro codebase

**Not recommended due to complexity**.

---

## Environment Variables

### Required for Production

Create `.env.production` (or add in Vercel dashboard):

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://edusitepro.edudashpro.org.za
NEXT_PUBLIC_SITE_NAME=EduSitePro

# Links to EduDash Pro
NEXT_PUBLIC_EDUDASH_PRO_URL=https://edudashpro.org.za
NEXT_PUBLIC_EDUDASH_PRO_SIGNUP=https://edudashpro.org.za/signup

# Analytics (if using)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Email/Form Handling (if implemented)
# RESEND_API_KEY=re_xxxxxxxxxxxx
# ADMIN_EMAIL=admin@edudashpro.org.za

# hCaptcha (if using on contact form)
# NEXT_PUBLIC_HCAPTCHA_SITE_KEY=xxxxxxxxxxxx
# HCAPTCHA_SECRET_KEY=xxxxxxxxxxxx
```

### Adding to Vercel

1. **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://edusitepro.edudashpro.org.za`
   - **Environment**: Production (check the box)
4. Click **"Save"**
5. **Redeploy** for changes to take effect

---

## Post-Deployment Checklist

### Functional Testing

- [ ] Homepage loads correctly
- [ ] Navigation works (all links)
- [ ] Templates page displays all 6 templates
- [ ] Individual template pages load (test all 6)
- [ ] MDX content renders with proper styling
- [ ] Typography plugin working (prose styles applied)
- [ ] Images load (template covers)
- [ ] Forms work (if implemented)
- [ ] Mobile responsive (test on phone)
- [ ] Dark mode works (if implemented)

### Performance Testing

- [ ] Lighthouse score: 90+ Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] All 6 templates generate static pages (check build output)

### SEO Checklist

- [ ] Meta titles present on all pages
- [ ] Meta descriptions present
- [ ] Open Graph tags for social sharing
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt accessible: `/robots.txt`
- [ ] Canonical URLs set correctly
- [ ] 404 page works
- [ ] No broken links

### Security Checklist

- [ ] HTTPS enabled (SSL certificate valid)
- [ ] Security headers configured (Vercel defaults are good)
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed to client
- [ ] CORS configured if needed
- [ ] Rate limiting on forms (if applicable)

---

## Monitoring & Analytics

### Vercel Analytics (Built-in)

Automatically enabled for all Vercel projects:

- Page views
- Unique visitors
- Geographic data
- Device types

**Access**: Vercel Dashboard → Your Project → Analytics

### Google Analytics (Optional)

1. Create GA4 property for `edusitepro.edudashpro.org.za`
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to environment variables
4. Install Google Analytics component (if not already)

### Error Monitoring (Optional)

Consider adding:

- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay for debugging

---

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on:

- **Push to `main` branch** → Production deploy
- **Pull requests** → Preview deployments (unique URL per PR)
- **Push to other branches** → Development deploys

### Manual Deployment

If you need to manually trigger:

```bash
# From project directory
vercel --prod

# Or redeploy from Vercel dashboard
# Deployments → Latest → "..." menu → Redeploy
```

---

## Rollback Procedure

If something goes wrong after deployment:

### Option 1: Rollback via Dashboard

1. **Vercel Dashboard** → Your Project → **Deployments**
2. Find the previous working deployment
3. Click **"..." menu** → **"Promote to Production"**
4. Confirm rollback

### Option 2: Rollback via Git

```bash
# Find the last working commit
git log --oneline

# Revert to that commit
git reset --hard <commit-hash>

# Force push (careful!)
git push origin main --force

# Vercel will auto-deploy the reverted version
```

---

## Troubleshooting

### Issue: DNS not resolving

**Check**:

```bash
dig edusitepro.edudashpro.org.za
nslookup edusitepro.edudashpro.org.za
```

**Solutions**:

- Wait longer (DNS can take 24-48 hours in rare cases)
- Clear DNS cache: `sudo systemd-resolve --flush-caches` (Linux)
- Try from different network/device
- Verify CNAME record is correct in DNS provider

### Issue: SSL certificate error

**Symptoms**: "Your connection is not private"

**Solutions**:

- Wait 10-30 minutes for certificate provisioning
- In Vercel, remove and re-add the domain
- Check that DNS is correctly pointed to Vercel
- Contact Vercel support if issue persists

### Issue: 404 on all pages

**Causes**:

- Deployment failed (check Vercel build logs)
- `basePath` misconfigured (if using subdirectory)
- DNS pointing to wrong Vercel project

**Solutions**:

- Check Vercel deployment logs for build errors
- Verify domain is added to correct Vercel project
- Test with Vercel preview URL first

### Issue: Template pages not loading

**Causes**:

- MDX files not included in build
- Dynamic import issues
- Missing dependencies

**Solutions**:

- Check build logs for MDX compilation errors
- Verify all MDX files are in `content/templates/`
- Ensure `MDXRenderer` component has all slugs mapped
- Clear build cache and redeploy

### Issue: Styles not loading

**Causes**:

- Tailwind CSS not compiling
- Missing `@tailwindcss/typography` plugin
- CSS import order issues

**Solutions**:

- Check `globals.css` has `@import 'tailwindcss';`
- Verify `@plugin '@tailwindcss/typography';` is present
- Clear `.next` folder and rebuild locally
- Check browser console for CSS errors

---

## Performance Optimization

### Vercel Edge Network

By default, Vercel serves your site via global CDN. No configuration needed.

### Image Optimization

If you add real images later:

1. Use Next.js `<Image>` component (already implemented)
2. Images auto-optimized by Vercel
3. WebP format served to supported browsers
4. Lazy loading automatic

### Caching Strategy

Vercel handles caching automatically:

- **Static pages**: Cached at edge, revalidated on new deploy
- **API routes**: Configurable cache headers
- **Images**: Cached for 1 year

---

## Cost Estimates (Vercel)

### Hobby Plan (Free)

- ✅ Perfect for EduSitePro
- Unlimited deployments
- 100GB bandwidth/month
- Custom domains
- Automatic HTTPS
- **Cost**: R0/month

### Pro Plan (R$20/month per user)

Only needed if:

- High traffic (>100GB bandwidth)
- Need team collaboration features
- Want advanced analytics

**Recommendation**: Start with Hobby plan, upgrade if needed.

---

## Launch Checklist

### Pre-Launch (Today)

- [ ] Fix 404 errors (✅ Done!)
- [ ] Build passes locally: `npm run build`
- [ ] All tests pass (if you have tests)
- [ ] Commit all changes to `main` branch
- [ ] Push to GitHub

### Launch Day (Next)

- [ ] Configure DNS CNAME record
- [ ] Deploy to Vercel
- [ ] Add custom domain in Vercel
- [ ] Wait for SSL certificate (10-30 min)
- [ ] Test site thoroughly on production URL
- [ ] Update EduDash Pro links to point to new subdomain

### Post-Launch (Week 1)

- [ ] Monitor analytics (traffic, errors)
- [ ] Fix any reported issues
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (optional)
- [ ] Announce launch on social media
- [ ] Send email to existing EduDash Pro users

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Status**: https://www.vercel-status.com/

---

**Last Updated**: 2025-01-14  
**Version**: 1.0  
**Maintained by**: EduSitePro Team
