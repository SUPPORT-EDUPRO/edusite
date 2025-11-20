# EduSitePro Admin Guide

**Simple step-by-step guide to manage your ECD centre websites**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a New Centre Site](#creating-a-new-centre-site)
3. [Managing Content](#managing-content)
4. [Common Tasks](#common-tasks)
5. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### What You Need

1. **Admin Token** - Your secret password (set in `.env.local` as `INTERNAL_ADMIN_TOKEN`)
2. **Centre Slug** - A short name for the centre (e.g., `little-stars`, `bright-minds`)
3. **Vercel Account** - For hosting the centre websites

### Accessing the Admin Panel

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Open your browser and go to:

   ```
   http://localhost:3000/admin
   ```

3. You'll see two main options:
   - **Centres** - Create and manage centre sites
   - **Content** - Add pages and sections to centres

---

## Creating a New Centre Site

### Step 1: Set Up Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Important:** Set **Root Directory** to `centre-template`
5. Add these environment variables (click "Add" for each):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
CENTRE_SLUG=little-stars
```

**Replace:**

- `your-project.supabase.co` with your actual Supabase URL
- `your-anon-key-here` with your Supabase anon key
- `little-stars` with your centre's slug

6. Click **"Deploy"**

### Step 2: Create Deploy Hook

1. In Vercel, go to your project → **Settings** → **Git**
2. Scroll to **Deploy Hooks**
3. Click **"Create Hook"**
4. Name it: `Centre Redeploy`
5. **Copy the URL** - it looks like:
   ```
   https://api.vercel.com/v1/integrations/deploy/prj_abc123/hook_xyz789
   ```

### Step 3: Register Centre in Admin Panel

1. Go to `http://localhost:3000/admin/centres`
2. Fill in the form:

   | Field               | Example                      | Required?   |
   | ------------------- | ---------------------------- | ----------- |
   | **Admin Token**     | `your-secret-token`          | ✅ Yes      |
   | **Slug**            | `little-stars`               | ✅ Yes      |
   | **Name**            | `Little Stars ECD Centre`    | ✅ Yes      |
   | **Primary Domain**  | `littlestars.co.za`          | ❌ Optional |
   | **Contact Email**   | `info@littlestars.co.za`     | ❌ Optional |
   | **Contact Phone**   | `+27 82 123 4567`            | ❌ Optional |
   | **Deploy Hook URL** | `https://api.vercel.com/...` | ❌ Optional |

3. Click **"Create / Update Centre"**
4. You should see: `Success`

---

## Managing Content

### Step 1: Load Centre Pages

1. Go to `http://localhost:3000/admin/content`
2. Enter your **Admin Token**
3. Enter the **Centre Slug** (e.g., `little-stars`)
4. Click **"Load Pages"**

### Step 2: Create a New Page

**Example: Creating a "Home" page**

1. In the "Add / Update Page" section, fill in:
   - **Slug:** `home` (lowercase, no spaces)
   - **Title:** `Home`
   - **Sort:** `1` (lower numbers appear first)
   - **Published:** ✅ Check this box

2. Click **"Save Page"**
3. The page will appear in your pages list

### Step 3: Add Sections to a Page

**Sections are the building blocks of your pages.** Think of them like LEGO pieces:

#### Text Section

Perfect for: Paragraphs, descriptions, announcements

1. Select the page from the dropdown
2. Choose **Section Type:** `Text`
3. In the **Text / HTML** field, type your content:
   ```
   Welcome to Little Stars! We provide quality early childhood education.
   ```
4. Click **"Add Section"**

#### Hero Section

Perfect for: Homepage banner with image and button

1. Choose **Section Type:** `Hero`
2. Fill in:
   - **Headline:** `Welcome to Little Stars`
   - **Subheadline:** `Caring for every child`
   - **Button Text:** `Contact Us`
   - **Button Link:** `/contact`
   - **Image URL:** `https://example.com/image.jpg`
3. Click **"Add Section"**

#### Gallery Section

Perfect for: Photo gallery

1. Choose **Section Type:** `Gallery`
2. In **Image URLs**, enter comma-separated links:
   ```
   https://example.com/pic1.jpg, https://example.com/pic2.jpg, https://example.com/pic3.jpg
   ```
3. Click **"Add Section"**

#### Contact Section

Perfect for: Contact information

1. Choose **Section Type:** `Contact`
2. Fill in:
   - **Address:** `123 Main Road, Cape Town`
   - **Phone:** `+27 82 123 4567`
   - **Email:** `info@littlestars.co.za`
3. Click **"Add Section"**

### Step 4: Trigger Redeploy

**After adding/changing content, you MUST trigger a redeploy for changes to go live:**

1. Click the **"Trigger Redeploy"** button
2. Wait 2-3 minutes for Vercel to rebuild the site
3. Visit your centre's website to see the changes

---

## Common Tasks

### Task 1: Update Centre Contact Details

```
Location: Admin → Centres
1. Enter Admin Token
2. Fill in centre slug and name
3. Update contact email and phone
4. Click "Create / Update Centre"
```

### Task 2: Create an "About Us" Page

```
Location: Admin → Content
1. Load pages for your centre
2. Add new page:
   - Slug: about
   - Title: About Us
   - Sort: 2
   - Published: ✅
3. Click "Save Page"
4. Add a text section with your story
5. Trigger Redeploy
```

### Task 3: Add Photos to Homepage

```
Location: Admin → Content
1. Load pages
2. Select "Home" page
3. Add a Gallery section
4. Paste image URLs (comma-separated)
5. Click "Add Section"
6. Trigger Redeploy
```

### Task 4: Update Centre Information

```
Location: Admin → Content
1. Load pages
2. Select page to edit
3. View "Existing Sections"
4. To change content:
   - Note what you want to change
   - Add a new section with updated content
   - Trigger Redeploy
```

---

## Tips & Tricks

### ✅ Best Practices

1. **Use Simple Slugs**
   - ✅ Good: `home`, `about`, `contact`
   - ❌ Bad: `Home Page`, `about-us-page-2024`

2. **Save Often**
   - Click "Save Page" after every change
   - Don't refresh the page or you'll lose work

3. **Test Before Publishing**
   - Uncheck "Published" to hide a page
   - Check "Published" when ready to show it

4. **Organize with Sort Order**
   - Homepage: Sort = 1
   - About: Sort = 2
   - Contact: Sort = 3
   - Lower numbers appear first in navigation

### ⚠️ Common Mistakes

1. **Forgetting to Trigger Redeploy**
   - Changes won't appear until you redeploy!
   - Always click "Trigger Redeploy" after changes

2. **Wrong Admin Token**
   - Double-check your `.env.local` file
   - Make sure you're using the correct token

3. **Centre Not Loading**
   - Verify the centre slug is correct
   - Check that the centre was created in Step 3

4. **Images Not Showing**
   - Make sure image URLs are public (not behind login)
   - Use full URLs: `https://example.com/image.jpg`

### 💡 Pro Tips

- **Dark Mode Works Automatically** - Your admin panel supports both light and dark themes
- **Use Vercel Preview** - Deploy to preview before going live
- **Keep Notes** - Write down your centre slugs and deploy hook URLs
- **Backup Important URLs** - Save your Supabase credentials safely

---

## Need Help?

### Quick Checks

1. ✅ Is the dev server running? (`npm run dev`)
2. ✅ Did you enter the correct admin token?
3. ✅ Did you trigger a redeploy after changes?
4. ✅ Is the centre slug spelled correctly?

### Still Stuck?

Check the `TROUBLESHOOTING.md` file in the `docs/` folder for common solutions.

---

**Last Updated:** 2025-10-15
