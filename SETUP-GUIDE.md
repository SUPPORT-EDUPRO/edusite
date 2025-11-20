# EduSitePro Setup Guide

## ✅ Completed Features

### 1. Theme Customizer ✅

- Theme API with multi-tenant filtering
- Color customization UI
- Typography and layout controls
- Save/activate themes
- **Next**: Add logo upload integration

### 2. Media Library ✅ (Backend Ready)

- File upload API (`/api/media/upload`)
- List/delete media API (`/api/media`)
- Storage migration file created
- Media Library UI exists
- **Next**: Deploy storage buckets to Supabase

### 3. Template System ✅

- 6 NCF-aligned templates with branded images
- Clickable pillar tiles on homepage
- Amber/stone color scheme applied

## 🚀 Deployment Steps

### Step 1: Deploy Storage Buckets

Run the storage migration to create media and logos buckets:

```bash
cd /media/king/0758576e-6f1e-485f-b9e0-00b44a1d3259/home/king/Desktop/edusitepro

# Push the storage buckets migration
supabase db push
```

**What this does:**

- Creates `media` bucket (10MB limit, images only)
- Creates `logos` bucket (5MB limit, logos only)
- Sets up RLS policies for multi-tenant isolation
- Files organized as: `{centre_id}/{filename}`

### Step 2: Verify Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Confirm `media` and `logos` buckets exist
3. Check RLS policies are enabled

### Step 3: Test Media Upload

1. Navigate to `http://localhost:3002/admin/media`
2. Click "Upload Files"
3. Select an image
4. Verify upload success and file appears in grid

### Step 4: Test Theme Customizer

1. Navigate to `http://localhost:3002/admin/themes`
2. Select a theme or create new one
3. Modify colors, fonts, layout
4. Click "Save Changes"
5. Verify save success message

## 📋 Remaining Tasks (Priority Order)

### High Priority

**1. Authentication & Authorization** ⚠️ CRITICAL

- [ ] Set up Supabase Auth
- [ ] Create login/registration pages
- [ ] Protect admin routes with middleware
- [ ] Implement role-based access control
- [ ] User management interface

**Why critical**: Currently, anyone can access `/admin` routes. Need to secure before deployment.

**2. Logo Upload Integration**

- [ ] Add logo upload to Theme Customizer
- [ ] Preview uploaded logo
- [ ] Save logo URL to theme settings

**3. Image Picker for Block Editor**

- [ ] Create reusable ImagePicker modal component
- [ ] Integrate with Gallery, Hero, and Staff blocks
- [ ] Replace hardcoded image URLs with uploaded media

### Medium Priority

**4. File Management Polish**

- [ ] Add rename file functionality
- [ ] Bulk delete selection
- [ ] Search and filter improvements
- [ ] Pagination for large libraries

**5. Custom Domain Management**

- [ ] Domain verification UI
- [ ] DNS configuration instructions
- [ ] SSL certificate handling

### Lower Priority

**6. Testing & Quality**

- [ ] Write unit tests for API routes
- [ ] Integration tests for upload/delete
- [ ] E2E tests for page builder

**7. Performance Optimization**

- [ ] Thumbnail generation for images
- [ ] CDN integration
- [ ] Image lazy loading

## 🔐 Authentication Implementation Plan

### Step 1: Supabase Auth Setup

Create auth helpers:

```typescript
// src/lib/auth.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createServerClient() {
  const cookieStore = cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );
}
```

### Step 2: Login Page

Create `/app/(auth)/login/page.tsx`:

- Email/password form
- Error handling
- Redirect to `/admin` on success

### Step 3: Middleware Protection

Update `src/middleware.ts`:

- Check for valid session
- Redirect to `/login` if not authenticated
- Allow anonymous access to public routes only

### Step 4: Role-Based Access

Add to `cms_users` table:

- `role` column: `super_admin`, `centre_admin`, `editor`, `viewer`
- RLS policies based on role

## 📊 Current Database Schema

### Tables Created ✅

- `centres` - Multi-tenant centres
- `pages` - Content pages
- `page_sections` - Block instances
- `themes` - Theme configurations
- `navigation_menus` - Nav structures
- `centre_domains` - Custom domains

### Tables Needed 🔜

- `cms_users` - User accounts (exists but needs roles)
- `memberships` - User-centre assignments
- `media_library` (optional) - File metadata tracking

## 🎯 Quick Wins

These can be completed in 15-30 minutes each:

1. **Add "View Site" button** in admin header → Opens centre's public site
2. **Dark mode toggle** in Theme Customizer → Test themes in dark mode
3. **Duplicate theme** button → Clone existing theme for quick customization
4. **Recent uploads** widget on admin dashboard → Show last 5 uploaded images
5. **File size warnings** → Alert when approaching 10MB limit

## 🐛 Known Issues

1. **Media Library**: Uses database approach but Storage API created - need to reconcile
2. **Theme activation**: May need cache clearing after activating new theme
3. **Navigation menu**: Created but not integrated with site renderer yet
4. **Seed demo content**: Works but blocks use placeholder image URLs

## 📞 Support & Next Steps

**Immediate Next Step**: Deploy storage migration and test media upload

```bash
supabase db push
npm run dev
# Navigate to http://localhost:3002/admin/media
# Upload a test image
```

**After that**: Implement authentication (highest priority for security)

---

**Questions or issues?** Check the WARP.md file for detailed architecture and patterns.
