# Young Eagles Registration Integration - Deployment Checklist

## Current Status

### ✅ Completed
- [x] Student registration schema deployed to Supabase
- [x] Organization types support (preschool, K-12, FET, training)
- [x] Young Eagles organization created in database
- [x] Registration form component with 38 fields
- [x] Dynamic class loading
- [x] Organization branding support
- [x] Registration dashboard for admins
- [x] Multi-domain architecture documented
- [x] Young Eagles PWA updated with registration link

### 🔄 In Progress
- [ ] Deploy EduSitePro to Vercel production
- [ ] Configure custom domain routing
- [ ] Remove old PWA components (if any)

### 📋 Next Steps

## Phase 1: Immediate Deployment (This Week)

### 1. Deploy EduSitePro to Vercel
```bash
cd /Desktop/edusitepro
vercel --prod
```

**Environment Variables Needed**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Update Young Eagles PWA Links

**File**: `youngeagles-education-platform/src/pages/Home.jsx`
**Line**: ~95

**Current** (localhost):
```jsx
<a href="http://localhost:3002/register">
  📝 Register for 2026
</a>
```

**Update to Production**:
```jsx
<a href="https://edusitepro.vercel.app/register">
  📝 Register for 2026
</a>
```

### 3. Deploy Updated Young Eagles PWA
```bash
cd /Desktop/youngeagles-education-platform
npm run build
# Deploy to youngeagles.org.za hosting
```

### 4. Test End-to-End Flow
1. Visit `youngeagles.org.za`
2. Click "Register for 2026"
3. Should open `edusitepro.vercel.app/register` in new tab
4. Form should show Young Eagles branding
5. Submit test registration
6. Check Supabase database for entry

## Phase 2: Custom Domain Integration (Next Week)

### 1. Add Custom Domain to Vercel

**In Vercel Dashboard**:
1. Go to Project Settings → Domains
2. Add domain: `youngeagles.org.za`
3. Vercel provides DNS records

### 2. Update DNS Records

**At Domain Registrar** (e.g., GoDaddy, Namecheap):
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 3. Verify Domain in Database

```sql
UPDATE organizations 
SET 
  custom_domain = 'youngeagles.org.za',
  domain_verified = true
WHERE slug = 'young-eagles';
```

### 4. Update All Links

**Young Eagles PWA** → Update registration link:
```jsx
<a href="https://youngeagles.org.za/register">
```

**Benefits**:
- Parents stay on youngeagles.org.za domain
- Seamless branded experience
- No "leaving site" messaging needed

## Phase 3: Unified Deployment (Future)

### Option A: Keep Separate Sites
- Marketing: `youngeagles.org.za` (Vite PWA)
- Registration: `youngeagles.org.za/register` (Next.js)
- Requires: Vercel routing or reverse proxy

### Option B: Migrate to Single Site
- Everything on Next.js
- Marketing pages as Next.js routes
- Single deployment, single domain
- Full admin control of content

**Recommended**: Start with Option A, migrate to Option B later

## File Changes Summary

### 1. Young Eagles PWA
**File**: `src/pages/Home.jsx`
**Changes**:
- ✅ Updated "Register for 2026" to link to EduSitePro
- ✅ Changed from internal route to external link
- ✅ Added external link icon
- ✅ Opens in new tab (target="_blank")

**Before**:
```jsx
<Link to="/register">Enroll Your Child</Link>
```

**After**:
```jsx
<a 
  href="http://localhost:3002/register" 
  target="_blank"
  rel="noopener noreferrer"
>
  📝 Register for 2026
</a>
```

**Production Update Needed**:
Change `localhost:3002` → `edusitepro.vercel.app`

### 2. EduSitePro
**New Files**:
- `/src/app/register/page.tsx` - Registration page route
- `/supabase/migrations/20251116_add_organization_types.sql` - Org types
- `/supabase/migrations/20251116_add_custom_domains.sql` - Custom domains
- `/MULTI_DOMAIN_ARCHITECTURE.md` - Documentation

**Updated Files**:
- `/src/components/registration/PublicRegistrationForm.tsx` - Enhanced with branding
- Organization branding state and UI
- Dynamic class loading with org type support

## Database Schema Updates

### Organizations Table
```sql
-- New columns added
organization_type        -- enum: preschool, k12, fet, etc.
slug                     -- URL-friendly identifier
custom_domain            -- e.g., youngeagles.org.za
domain_verified          -- boolean
logo_url                 -- organization logo
primary_color           -- brand color #1
secondary_color         -- brand color #2
registration_open       -- boolean
registration_message    -- custom welcome text
min_age / max_age      -- age restrictions
grade_levels           -- array of available grades
```

### Classes Table
```sql
-- New columns added
class_type              -- 'grade', 'course', 'module'
age_range              -- '2-3 years', '16+ years'
duration               -- 'Full Year', '6 Months'
prerequisites          -- array of required courses
```

## Testing Checklist

### Local Development
- [ ] Young Eagles PWA runs on localhost:5174
- [ ] EduSitePro runs on localhost:3002
- [ ] Click "Register for 2026" opens registration
- [ ] Form shows Young Eagles branding
- [ ] Dynamic classes load correctly
- [ ] Form submission saves to database

### Production Testing
- [ ] Deploy EduSitePro to Vercel
- [ ] Update PWA registration link
- [ ] Test full registration flow
- [ ] Verify email notifications (when implemented)
- [ ] Check mobile responsiveness
- [ ] Test with different browsers

### Custom Domain Testing (Phase 2)
- [ ] Add youngeagles.org.za to Vercel
- [ ] Update DNS records
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Test SSL certificate
- [ ] Verify domain resolves correctly
- [ ] Update database domain_verified flag
- [ ] Test registration at youngeagles.org.za/register

## Known Issues & Solutions

### Issue 1: 404 on /register
**Problem**: Registration route not found
**Solution**: Ensure `/src/app/register/page.tsx` exists and server is restarted

### Issue 2: No Organization Branding
**Problem**: Form doesn't show Young Eagles logo/colors
**Solution**: Run custom domain migration and verify organization exists in database

### Issue 3: No Classes Available
**Problem**: Class dropdown is empty
**Solution**: Insert classes for Young Eagles organization:
```sql
INSERT INTO classes (name, grade_level, max_students, organization_id, academic_year)
VALUES 
  ('Pre-Primary A', 'Pre-Primary A', 20, 'young-eagles-org-id', '2026'),
  ('Pre-Primary B', 'Pre-Primary B', 20, 'young-eagles-org-id', '2026'),
  ('Reception', 'Reception', 25, 'young-eagles-org-id', '2026'),
  ('Grade R', 'Grade R', 25, 'young-eagles-org-id', '2026');
```

### Issue 4: Middleware Tenant Resolution
**Problem**: Wrong organization loads or 404
**Solution**: Check middleware logs, verify tenant ID in database, confirm domain mapping

## For New School Onboarding

When a new school signs up:

### 1. Create Organization
```sql
INSERT INTO organizations (
  name, slug, school_code, organization_type,
  contact_email, contact_phone, address,
  registration_open, primary_color, secondary_color
) VALUES (
  'Sunrise Primary School',
  'sunrise-primary',
  'SPS-2026',
  'primary_school',
  'info@sunriseprimary.co.za',
  '+27 11 234 5678',
  '123 School Street, JHB',
  true,
  '#3b82f6',
  '#8b5cf6'
);
```

### 2. Create Classes
```sql
INSERT INTO classes (name, grade_level, organization_id, academic_year)
SELECT 
  'Grade ' || i,
  'Grade ' || i,
  org.id,
  '2026'
FROM organizations org
CROSS JOIN generate_series(1, 7) AS i
WHERE org.slug = 'sunrise-primary';
```

### 3. Setup Access
**Option A**: Use platform subdomain
- URL: `sunrise-primary.edusitepro.vercel.app/register`
- No DNS setup required
- Works immediately

**Option B**: Use custom domain
- URL: `sunriseprimary.co.za/register`
- Requires: DNS setup + Vercel domain add
- Takes 24-48 hours

### 4. Notify School
Email template:
```
Subject: Your Registration Portal is Ready! 🎓

Hi [School Name],

Your student registration portal is now live!

Registration Link: https://edusitepro.vercel.app/[your-slug]/register
(or https://[your-domain]/register if custom domain configured)

Admin Dashboard: https://edusitepro.vercel.app/admin
Login: [admin-email]

Next Steps:
1. Test the registration form
2. Add your school's classes
3. Share the link with parents

Need help? Reply to this email.

- EduSitePro Team
```

## Support & Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -h aws-0-ap-southeast-1.pooler.supabase.com -p 6543 -U postgres.bppuzibjlxgfwrujzfsz -d postgres

# Check organizations
SELECT id, name, slug, custom_domain FROM organizations;

# Check classes
SELECT id, name, organization_id FROM classes WHERE academic_year = '2026';
```

### Vercel Deployment Issues
```bash
# Check deployment logs
vercel logs

# Redeploy
vercel --prod --force
```

### DNS Issues
```bash
# Check DNS propagation
dig youngeagles.org.za

# Check nameservers
nslookup youngeagles.org.za
```

---

## Quick Reference URLs

### Development
- Young Eagles PWA: `http://localhost:5174`
- EduSitePro: `http://localhost:3002`
- Registration: `http://localhost:3002/register`

### Production (After Deployment)
- EduSitePro Platform: `https://edusitepro.vercel.app`
- Young Eagles Registration: `https://edusitepro.vercel.app/register`
- With Custom Domain: `https://youngeagles.org.za/register`

### Database
- Supabase Dashboard: `https://supabase.com/dashboard`
- Project ID: `bppuzibjlxgfwrujzfsz`
- Database Host: `aws-0-ap-southeast-1.pooler.supabase.com:6543`

---

**Last Updated**: November 16, 2025
**Status**: Phase 1 Ready for Deployment ✅
