# EduSitePro Tenant Onboarding Guide

## Overview
EduSitePro is a multi-tenant platform where each organization (preschool, daycare, etc.) gets their own branded website with a backend admin panel.

## How the Multi-Tenant System Works

### 1. **Organizations Table**
- Central registry of all schools/centres
- Contains: name, slug, type, logo, contact info, location
- Example: Young Eagles Preschool (slug: `young-eagles`)

### 2. **Centres Table**
- Links organizations to the EduSitePro platform
- Each organization gets a centre record
- Contains: domains, branding, plan tier, onboarding status

### 3. **Pages Table**
- Each centre can have multiple pages
- Pages belong to a specific `centre_id` (multi-tenant isolation)
- Contains: slug, title, meta description, published status

### 4. **Page Blocks Table**
- Content blocks that make up each page
- Blocks have types: hero, stats, features, contact, gallery, testimonials, etc.
- Each block has JSON props for customization

### 5. **URL Routing**
- Format: `/{slug}` → resolves to organization's home page
- Middleware checks subdomain or slug → sets tenant ID
- Page component fetches data filtered by `centre_id`

---

## Onboarding a New Tenant

### Step 1: Create Organization
```sql
INSERT INTO organizations (
  id,
  name,
  slug,
  organization_type,
  country,
  city,
  province,
  logo_url,
  primary_color,
  tagline,
  established_year,
  total_students,
  total_teachers,
  is_public,
  directory_listing,
  featured
) VALUES (
  gen_random_uuid(),
  'School Name',
  'school-slug',
  'preschool'::organization_type,
  'ZA',
  'City',
  'Province',
  'https://via.placeholder.com/150',
  '#FF6B6B',
  'School tagline here',
  2020,
  50,
  5,
  true,
  true,
  false
);
```

### Step 2: Create Centre Entry
```sql
INSERT INTO centres (
  id,
  organization_id,
  slug,
  name,
  primary_domain,
  contact_email,
  contact_phone,
  status,
  plan_tier,
  default_subdomain,
  onboarding_status
) VALUES (
  '{organization_id}',  -- Use same ID as organization
  '{organization_id}',
  'school-slug',
  'School Name',
  'school-slug.edusitepro.org.za',
  'info@school.co.za',
  '+27 XX XXX XXXX',
  'active',
  'pro',
  'school-slug',
  'completed'
);
```

### Step 3: Create Landing Page Entry (Optional - for directory)
```sql
INSERT INTO organization_landing_pages (
  organization_id,
  hero_title,
  hero_subtitle,
  hero_cta_text,
  hero_cta_link,
  meta_title,
  meta_description,
  stats,
  published
) VALUES (
  '{organization_id}',
  'Welcome to School Name',
  'Your school subtitle/tagline',
  'Enroll Now',
  '/register',
  'School Name - Quality Education',
  'School description for SEO',
  '{"students": 50, "teachers": 5}'::jsonb,
  true
);
```

### Step 4: Create Home Page
```sql
INSERT INTO pages (
  centre_id,
  slug,
  title,
  meta_description,
  is_published
) VALUES (
  '{centre_id}',
  'school-slug',
  'School Name - Home',
  'School description',
  true
) RETURNING id;
```

### Step 5: Add Content Blocks
```sql
-- Get the page ID from step 4, then:

-- Hero Block
INSERT INTO page_blocks (page_id, block_key, block_order, props)
VALUES (
  '{page_id}',
  'hero',
  1,
  jsonb_build_object(
    'title', 'Welcome to School Name',
    'subtitle', 'Your school motto',
    'ctaText', 'Enroll Now',
    'ctaLink', '/register',
    'backgroundImage', 'https://school-image-url.jpg',
    'backgroundOverlay', 'gradient'
  )
);

-- Stats Block
INSERT INTO page_blocks (page_id, block_key, block_order, props)
VALUES (
  '{page_id}',
  'stats',
  2,
  jsonb_build_object(
    'title', 'Our Achievements',
    'stats', jsonb_build_array(
      jsonb_build_object('label', 'Students', 'value', '50', 'icon', 'users'),
      jsonb_build_object('label', 'Teachers', 'value', '5', 'icon', 'graduationCap')
    )
  )
);
```

---

## Available Block Types

### 1. **hero**
- Full-width hero section
- Props: title, subtitle, ctaText, ctaLink, backgroundImage, backgroundOverlay

### 2. **stats**
- Statistics/metrics display
- Props: title, stats (array of {label, value, icon})

### 3. **features**
- Feature grid with icons
- Props: title, subtitle, features (array of {title, description, icon, color})

### 4. **contactCTA**
- Contact section with form
- Props: title, subtitle, email, phone, address, showContactForm

### 5. **programGrid**
- Educational programs display
- Props: title, programs (array)

### 6. **gallery**
- Photo/video gallery
- Props: images (array of URLs)

### 7. **testimonials**
- Parent testimonials
- Props: testimonials (array of {name, text, rating, photo})

### 8. **staffCards**
- Team members
- Props: staff (array of {name, role, bio, photo})

---

## Admin Access Setup

### Create Admin User
1. User signs up via Supabase Auth: `/login` or `/register`
2. Link user to organization:

```sql
INSERT INTO user_organizations (
  user_id,
  organization_id,
  role
) VALUES (
  '{supabase_auth_user_id}',
  '{organization_id}',
  'owner'  -- or 'admin', 'editor'
);
```

3. User can now access `/admin` panel
4. Admin panel allows:
   - Page management (create, edit, delete pages)
   - Block editing (drag-and-drop page builder)
   - Media library
   - Organization settings
   - Centre settings

---

## Example: Young Eagles Setup

### Database State
- **Organization ID**: `6b92f8a5-48e7-4865-b85f-4b92c174e0ef`
- **Centre ID**: Same as organization ID
- **Slug**: `young-eagles`
- **URL**: `http://localhost:3002/young-eagles`
- **Admin URL**: `http://localhost:3002/admin`

### Content Blocks
1. Hero: "Welcome to Young Eagles Day Care" with Society 5.0 messaging
2. Stats: 200 children, 15 years, 10 staff, 98% satisfaction
3. Features: Society 5.0 Learning, Expert Caregivers, Safe Environment, Loving Care
4. Contact: Form + email/phone/address

---

## Future Tenant Checklist

✅ Create organization in `organizations` table  
✅ Create centre in `centres` table (same ID)  
✅ Create landing page in `organization_landing_pages` (for directory)  
✅ Create home page in `pages` table  
✅ Add content blocks in `page_blocks` table  
✅ Create admin user and link to organization  
✅ Test page loads at `/{slug}`  
✅ Test admin access at `/admin`  
✅ Verify tenant isolation (can only see own data)  

---

## Customization

### Theme Colors
- Set in `centres.brand_theme` (JSON)
- Or use `organizations.primary_color`

### Custom Domains
- Set in `centres.primary_domain`
- Configure DNS to point to EduSitePro servers
- Middleware will resolve tenant by domain

### Branding
- Logo: `organizations.logo_url`
- Colors: `organizations.primary_color`
- Fonts: Set in `centres.brand_theme`

---

## Security & Multi-Tenancy

- **RLS (Row Level Security)** enforced on all tables
- Pages filtered by `centre_id`
- Blocks filtered by `page_id` → `centre_id`
- Users only see organizations they're linked to
- Middleware sets tenant context per request

---

## Next Steps for Platform Admin

1. Create `/admin/onboarding` wizard for new schools
2. Add template library (pre-built pages/blocks)
3. Add domain verification system
4. Add billing/subscription management
5. Add analytics dashboard (per-tenant metrics)
6. Add bulk import tool (CSV → organizations)

---

## Support

For issues or questions:
- Email: support@edusitepro.org.za
- Docs: https://docs.edusitepro.org.za
- Admin Portal: https://admin.edusitepro.org.za
