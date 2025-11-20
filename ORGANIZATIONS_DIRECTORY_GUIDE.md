# 🏫 Organizations Directory Feature - Complete Guide

## Overview

The Organizations Directory is a public-facing feature that allows visitors to browse and discover all educational institutions registered with EduSitePro. Think of it as a "marketplace" or "directory" where schools can showcase themselves to attract new students and parents.

---

## 🎯 Purpose

**For Schools:**
- Free marketing exposure
- Attract new students
- Showcase their unique offerings
- Display active promotions/discounts
- Build credibility through stats

**For Parents:**
- Discover schools by category
- Compare pricing across institutions
- Find schools with active promotions
- Filter by location (province/city)
- See school stats (students, teachers, established year)

**For EduSitePro:**
- Showcase platform growth
- Drive organic traffic
- Demonstrate network effect
- Encourage new school signups

---

## 📁 Files Created

### 1. Database Migration
**File:** `supabase/migrations/20251116_organizations_directory.sql`

**What it does:**
- Adds public listing fields to `organizations` table
- Creates `public_organizations_directory` view
- Creates `get_organizations_by_category()` function
- Creates `get_directory_stats()` function
- Sets up RLS policies for public access
- Adds sample organizations (Little Stars, Sunshine Primary, Excellence High)

**Key fields added:**
```sql
is_public BOOLEAN           -- Controls if org appears in directory
directory_listing BOOLEAN   -- Opt-in to directory
featured BOOLEAN            -- Featured schools appear first
listing_order INTEGER       -- Manual ordering for featured
city VARCHAR(100)           -- City location
province VARCHAR(100)       -- Province location
tagline TEXT                -- Short marketing tagline
established_year INTEGER    -- Year founded
total_students INTEGER      -- Student count (for display)
total_teachers INTEGER      -- Teacher count (for display)
```

### 2. Organization Card Component
**File:** `src/components/directory/OrganizationCard.tsx`

**Features:**
- Displays organization logo or initial
- Shows organization type badge (color-coded)
- Featured badge for premium listings
- Active discount badge (animated)
- Stats grid (students, teachers, established year)
- Location display (city, province)
- Pricing preview (registration + tuition)
- Discount calculation display
- Links to organization landing page
- Hover animations and transitions

**Visual Design:**
- Gradient header with logo
- Color-coded category badges
- Stats icons with colors
- Price comparison (original vs discounted)
- Responsive card layout

### 3. Organizations Directory Page
**File:** `src/app/organizations/page.tsx`

**Features:**
- **Hero Section:**
  - Platform statistics banner
  - Total organizations, students, teachers, provinces
  - Gradient background with engaging copy

- **Search & Filters:**
  - Search by name or location
  - Province dropdown filter
  - Sort options (Featured, A-Z, Z-A, Most Students, Newest)
  - Mobile-responsive filter toggle

- **Category Navigation:**
  - 6 category tabs: All, Preschools, Primary, High Schools, FET, Training
  - Icon-based navigation
  - Live counts per category
  - Active state highlighting

- **Results Grid:**
  - 3-column grid (responsive: 1 col mobile, 2 tablet, 3 desktop)
  - Loading skeleton states
  - Empty state messaging
  - Results count display

- **CTA Section:**
  - Encourages schools to join
  - Contact sales button
  - View pricing button

### 4. Header Navigation Update
**File:** `src/components/site/Header.tsx`

**Changes:**
- Added "Schools" link to main navigation (first position)
- Added to mobile menu
- Maintains consistent styling with other nav items

---

## 🚀 How It Works

### 1. Database View (Performance Optimized)

The `public_organizations_directory` view pre-calculates:
- Active campaigns count
- Best discount percentage
- Lowest registration fee
- Lowest monthly tuition

**Benefits:**
- Single query for all data
- No N+1 query problems
- Cached by database
- Fast page loads

### 2. Public Access (RLS Security)

Organizations are visible if:
```sql
directory_listing = true AND is_public = true
```

**RLS Policy:**
```sql
CREATE POLICY "Public organizations are viewable by everyone"
ON organizations FOR SELECT
TO anon, authenticated
USING (directory_listing = true AND is_public = true);
```

**Security:**
- No authentication required to view
- Only public data exposed
- Schools control their own visibility
- Admins can unpublish anytime

### 3. Category Filtering

**Function signature:**
```typescript
get_organizations_by_category(
  p_category VARCHAR,      // 'preschool', 'primary_school', etc.
  p_search VARCHAR,        // Search term
  p_province VARCHAR,      // Province filter
  p_limit INTEGER,         // Pagination limit
  p_offset INTEGER         // Pagination offset
)
```

**Client-side usage:**
```typescript
const { data } = await supabase.rpc('get_organizations_by_category', {
  p_category: 'preschool',
  p_search: 'young eagles',
  p_province: 'Gauteng',
  p_limit: 50,
  p_offset: 0,
});
```

### 4. Stats Dashboard

**Function:** `get_directory_stats()`

**Returns JSON:**
```json
{
  "total_organizations": 4,
  "by_type": {
    "preschool": 2,
    "primary_school": 1,
    "high_school": 1
  },
  "by_province": {
    "Gauteng": 2,
    "Western Cape": 1,
    "KwaZulu-Natal": 1
  },
  "total_students": 1455,
  "total_teachers": 81,
  "featured_count": 1
}
```

---

## 🎨 Design Features

### Organization Type Colors

```typescript
preschool       → Pink (#ec4899)
primary_school  → Blue (#2563eb)
high_school     → Purple (#9333ea)
fet_college     → Green (#16a34a)
training_center → Orange (#ea580c)
```

### Featured Schools
- Gold "Featured" badge (top-right)
- Appear first in results
- Sorted by `listing_order` then alphabetically

### Active Campaigns
- Red animated "X% OFF" badge (top-left)
- Shows best discount percentage
- Pulses to attract attention

### Pricing Display
- Shows registration + monthly tuition
- Applies discount calculation
- Strikethrough original price
- Green discounted price

---

## 📊 Sample Data Created

### Young Eagles Preschool (Updated)
```sql
City: Pretoria
Province: Gauteng
Tagline: "Nurturing young minds through quality early childhood education"
Established: 2020
Students: 120
Teachers: 8
Featured: true
Listing Order: 1
```

### Little Stars Preschool (New)
```sql
City: Johannesburg
Province: Gauteng
Tagline: "Where every child is a star"
Established: 2015
Students: 85
Teachers: 6
Registration Fee: R450
Monthly Tuition: R2,200
```

### Sunshine Primary School (New)
```sql
City: Cape Town
Province: Western Cape
Tagline: "Empowering learners for a bright future"
Established: 2010
Students: 450
Teachers: 22
Registration Fee: R600
Monthly Tuition: R3,200
```

### Excellence High School (New)
```sql
City: Durban
Province: KwaZulu-Natal
Tagline: "Excellence in education, character in service"
Established: 2005
Students: 800
Teachers: 45
Registration Fee: R800
Monthly Tuition: R4,500
```

---

## 🔧 Admin Control

### How Schools Opt In/Out

**Option 1: Via SQL**
```sql
UPDATE organizations 
SET directory_listing = true, is_public = true, featured = false
WHERE slug = 'my-school';
```

**Option 2: Via Admin Dashboard** (Future Feature)
```
Settings → Public Listing
☑ List in public directory
☑ Visible to public
☐ Featured listing (premium)
```

### Set Featured Status
```sql
UPDATE organizations 
SET featured = true, listing_order = 1
WHERE slug = 'premium-school';
```

### Update Stats
```sql
UPDATE organizations 
SET 
  total_students = 150,
  total_teachers = 12,
  city = 'Johannesburg',
  province = 'Gauteng',
  tagline = 'Our new tagline'
WHERE slug = 'my-school';
```

---

## 🌐 User Journey

### Parent/Student Discovery Flow

1. **Homepage:** Click "Schools" in navigation
2. **Directory Page:** See hero with platform stats
3. **Browse Categories:** Click "Preschools" tab
4. **Filter Location:** Select "Gauteng" province
5. **Search:** Type "young eagles"
6. **View Results:** See filtered cards
7. **Click Card:** Redirected to organization landing page (`/young-eagles`)
8. **See Promotion:** Notice 20% OFF badge
9. **Register:** Click "Register Now" button
10. **Complete:** Fill registration form with promo code

### School Marketing Flow

1. **Sign up:** School joins EduSitePro
2. **Auto-listed:** Automatically appears in directory
3. **Customize:** Admin updates stats, logo, tagline
4. **Create Campaign:** Set up Early Bird 20% OFF
5. **Featured (Optional):** Upgrade to featured listing
6. **Track Traffic:** View analytics on page views
7. **Conversions:** See registrations from directory

---

## 📈 SEO Benefits

### Page Metadata (Add to `page.tsx`)
```typescript
export const metadata = {
  title: 'Schools Directory | Find Quality Education in South Africa | EduSitePro',
  description: 'Browse 100+ preschools, primary schools, high schools, and colleges across South Africa. Compare fees, find promotions, and discover the perfect school for your child.',
  keywords: 'schools, preschools, primary schools, high schools, South Africa, Gauteng, Cape Town, Durban, education directory',
  openGraph: {
    title: 'Discover Quality Schools in South Africa',
    description: 'Browse our directory of registered educational institutions',
    images: ['/og-directory.jpg'],
  }
};
```

### Dynamic Sitemap Entry
```xml
<url>
  <loc>https://edusitepro.org.za/organizations</loc>
  <priority>0.9</priority>
  <changefreq>daily</changefreq>
</url>
```

### Rich Snippets (Future)
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Educational Institutions Directory",
  "itemListElement": [...]
}
```

---

## 🚦 Deployment Steps

### 1. Deploy Database Migration
```bash
cd edusitepro
supabase db push
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `20251116_organizations_directory.sql`
3. Run query
4. Verify tables and views created

### 2. Verify Sample Data
```sql
SELECT * FROM public_organizations_directory;
-- Should return 4 organizations
```

### 3. Test RPC Functions
```sql
SELECT * FROM get_organizations_by_category('preschool', NULL, NULL, 10, 0);
SELECT get_directory_stats();
```

### 4. Deploy Frontend
```bash
npm run build
vercel --prod
```

### 5. Test Live
```
Visit: https://edusitepro.org.za/organizations
```

---

## 🧪 Testing Checklist

- [ ] Directory page loads without errors
- [ ] All 4 sample organizations visible
- [ ] Search filters results correctly
- [ ] Province filter works
- [ ] Category tabs update counts
- [ ] Sort options reorder cards
- [ ] Clicking card navigates to landing page
- [ ] Featured badge shows on Young Eagles
- [ ] Discount badge shows if campaign active
- [ ] Stats display correctly
- [ ] Mobile responsive layout works
- [ ] Header "Schools" link navigates correctly
- [ ] Empty state shows when no results

---

## 🔮 Future Enhancements

### Phase 2: Enhanced Features
- [ ] Map view with location pins
- [ ] Advanced filters (age range, facilities, curriculum)
- [ ] Reviews and ratings
- [ ] Comparison tool (side-by-side)
- [ ] Save favorites (wishlist)
- [ ] Email alerts for new schools
- [ ] Verified badge for premium schools

### Phase 3: Premium Listings
- [ ] Featured placement (paid)
- [ ] Larger cards with video
- [ ] Priority search ranking
- [ ] Analytics dashboard for schools
- [ ] A/B testing for landing pages
- [ ] Custom directory URLs

### Phase 4: Social Features
- [ ] Parent community forums
- [ ] School ambassador programs
- [ ] Referral tracking
- [ ] Social sharing buttons
- [ ] Testimonial integration

---

## 📊 Analytics Tracking

### Events to Track
```typescript
// Page view
trackEvent('directory_page_view');

// Category filter
trackEvent('directory_category_filter', { category: 'preschool' });

// Search
trackEvent('directory_search', { query: 'young eagles' });

// Card click
trackEvent('directory_organization_click', { 
  organization_id: 'xxx',
  organization_name: 'Young Eagles',
  featured: true,
  has_discount: true
});

// CTA click
trackEvent('directory_cta_contact_sales');
```

### Metrics to Monitor
- Page views per day
- Unique visitors
- Click-through rate (directory → landing page)
- Conversion rate (directory → registration)
- Most popular categories
- Most searched terms
- Top provinces
- Featured vs non-featured performance

---

## 🎓 Examples

### Example 1: Find Preschools in Gauteng with Discounts

**User Action:**
1. Click "Preschools" tab
2. Select "Gauteng" province
3. See results sorted by featured first

**SQL Query Generated:**
```sql
SELECT * FROM get_organizations_by_category(
  'preschool',
  NULL,
  'Gauteng',
  50,
  0
);
```

**Results:**
- Young Eagles (Featured, 20% OFF, Pretoria)
- Little Stars (Johannesburg)

### Example 2: Search All Schools Named "Eagles"

**User Action:**
1. Type "eagles" in search
2. Keep category on "All"
3. Keep province on "All"

**SQL Query:**
```sql
SELECT * FROM get_organizations_by_category(
  NULL,
  'eagles',
  NULL,
  50,
  0
);
```

**Results:**
- Young Eagles Preschool (Pretoria)

### Example 3: Compare Primary Schools

**User Action:**
1. Click "Primary Schools" tab
2. Sort by "Most Students"
3. Compare pricing

**Results:**
- Sunshine Primary: 450 students, R600 reg, R3200/mo
- (Other primary schools if added)

---

## 🔐 Security & Privacy

### What's Public
- Organization name, logo, tagline
- Organization type, location (city/province)
- Total students/teachers (aggregate numbers)
- Established year
- Registration fees, tuition fees
- Active campaigns (discount %)

### What's Private
- Individual student data
- Contact details (unless on landing page)
- Financial transactions
- Staff personal information
- Internal admin data
- User account information

### RLS Protection
- Only organizations with `directory_listing=true` visible
- No way to query private org data through directory
- View is read-only for public
- Admin mutations still require authentication

---

## 💰 Monetization Opportunities

### Featured Listings
```
Regular Listing:  FREE (included in subscription)
Featured Listing: +R500/month
  - Appears first in results
  - Gold "Featured" badge
  - Priority in search results
  - Larger card size (future)
```

### Premium Directory Add-ons
```
Video Tour:        +R200/month
Reviews Display:   +R150/month
Map Pin Upgrade:   +R100/month
Analytics Access:  +R300/month
```

### Tiered Pricing
```
Starter:    Listed, no features
Growth:     Listed + Featured + Analytics
Enterprise: All features + dedicated support
```

---

## 📞 Support & Maintenance

### Common Admin Questions

**Q: How do I appear in the directory?**
A: You're automatically listed when you sign up. Ensure `directory_listing=true`.

**Q: How do I become featured?**
A: Contact sales@edusitepro.org.za for featured placement.

**Q: Can I hide my school temporarily?**
A: Yes, set `is_public=false` in settings.

**Q: How do I update my stats?**
A: Go to Admin → Settings → Public Profile.

**Q: Why isn't my discount showing?**
A: Ensure your campaign is active and `starts_at <= NOW()`.

---

## 🎉 Success Metrics

### Launch Goals (Month 1)
- 10+ organizations listed
- 1,000+ page views
- 50+ click-throughs to landing pages
- 10+ registrations from directory

### Growth Goals (Month 3)
- 50+ organizations listed
- 10,000+ page views
- 500+ click-throughs
- 100+ registrations from directory

### Maturity Goals (Month 6)
- 200+ organizations listed
- 50,000+ page views
- 5,000+ click-throughs
- 1,000+ registrations from directory
- 10+ featured schools (paying)

---

**Created:** November 16, 2025  
**Feature:** Organizations Public Directory  
**Status:** ✅ Complete and ready for deployment  
**Next Step:** Deploy migration, test on production, add to marketing materials
