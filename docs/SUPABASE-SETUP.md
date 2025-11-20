# Supabase Database Setup Guide

## 📋 Quick Setup Checklist

- [ ] Get Supabase credentials
- [ ] Update .env.local with correct values
- [ ] Run database schema in Supabase SQL Editor
- [ ] Add environment variables to Vercel
- [ ] Test lead submission

---

## Step 1: Get Supabase Credentials

### 🔑 Find Your Keys

1. Go to your Supabase project: https://app.supabase.com/project/bppuzibjlxgfwrujzfsz
2. Click **Settings** (⚙️ gear icon in sidebar)
3. Click **API** in the settings menu

You'll see three important values:

### Project URL (NEXT_PUBLIC_SUPABASE_URL)

```
URL: https://bppuzibjlxgfwrujzfsz.supabase.co
```

⚠️ **Important:** Use the **HTTPS URL**, NOT the PostgreSQL connection string!

### Anon (Public) Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

```
Starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ Safe to expose in client-side code (already have this!)

### Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

```
Starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(different from anon key)
```

🔒 **SECRET** - Server-side only, never expose!

---

## Step 2: Update .env.local

Replace the values in `/home/king/Desktop/edusitepro/.env.local`:

```bash
# ============================================
# DATABASE (SUPABASE)
# ============================================
# IMPORTANT: Use HTTPS URL, not PostgreSQL connection string
NEXT_PUBLIC_SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDM3MzAsImV4cCI6MjA2OTMxOTczMH0.LcoKy-VzT6nKLPjcb6BXKHocj4E7DuUQPyH_bmfGbWA
SUPABASE_SERVICE_ROLE_KEY=[PASTE YOUR SERVICE ROLE KEY HERE]
```

---

## Step 3: Create Database Tables

### 🗄️ Run SQL Schema

1. Go to Supabase Dashboard: https://app.supabase.com/project/bppuzibjlxgfwrujzfsz
2. Click **SQL Editor** in the sidebar (looks like </> icon)
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)

### ✅ Verify Tables Created

After running the schema, you should see these tables in the **Table Editor**:

- `leads` - Stores bulk quote submissions
- `lead_notes` - CRM notes for leads
- `tenants` - Multi-tenant configuration

---

## Step 4: Add to Vercel (Production)

Add these environment variables in Vercel Dashboard:

**Vercel Dashboard → Your Project → Settings → Environment Variables**

| Key                             | Value                                      | Environment               |
| ------------------------------- | ------------------------------------------ | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://bppuzibjlxgfwrujzfsz.supabase.co` | ✅ Production, ✅ Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` (your anon key)                | ✅ Production, ✅ Preview |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJhbG...` (your service role key)        | ✅ Production only        |

Then **Redeploy** your project.

---

## Step 5: Test It Works

### 🧪 Local Test

```bash
# Start dev server
cd /home/king/Desktop/edusitepro
npm run dev

# Open browser
# Visit: http://localhost:3000/bulk
# Fill out the form and submit
```

### ✅ Check Database

1. Go to Supabase **Table Editor**
2. Click on `leads` table
3. You should see your test submission!

### 🎯 What Gets Stored

When someone submits the bulk quote form:

```javascript
{
  id: "uuid-generated-by-supabase",
  contact_name: "John Smith",
  email: "john@example.com",
  phone: "+27821234567",
  centre_count: 5,
  provinces: ["gauteng", "western-cape"],
  preferred_languages: ["en", "af"],
  message: "Looking for websites...",
  interested_in_edudash_pro: true,
  estimated_value: 150000.00,
  status: "new",
  ip_address: "102.177.xxx.xxx",
  user_agent: "Mozilla/5.0...",
  created_at: "2025-10-14T18:20:45+00:00"
}
```

**AND** they still get the email notification! (Database + Email = Best of both worlds)

---

## 🎉 Benefits You Now Have

### ✅ Lead Management

- All leads stored in database
- Track conversion status
- Add follow-up notes
- See analytics

### ✅ CRM Features

```sql
-- View all new leads
SELECT * FROM leads WHERE status = 'new' ORDER BY created_at DESC;

-- See conversion funnel
SELECT * FROM lead_funnel;

-- Monthly lead stats
SELECT * FROM monthly_leads;
```

### ✅ Multi-Tenant Ready

When you add bulk clients, you can store their configuration:

```javascript
// Add a new client
INSERT INTO tenants (slug, domain, name, primary_color)
VALUES ('happy-days', 'happydays.edusitepro.co.za', 'Happy Days ECD', '#3B82F6');
```

---

## 🔍 Troubleshooting

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL"

- Check `.env.local` has correct HTTPS URL (not PostgreSQL string)
- Restart dev server: `npm run dev`

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"

- Copy from Supabase Dashboard → Settings → API → Service Role Key
- Add to `.env.local`
- **Never commit this to Git!**

### Database Insert Fails

- Check Supabase logs: Dashboard → Logs
- Verify Row Level Security policies are set up
- Ensure service role key is correct

### Tables Don't Exist

- Run the schema SQL in Supabase SQL Editor
- Check for SQL errors in the output
- Verify you're in the correct project

---

## 📊 Next Steps

### Build a CRM Dashboard (Future)

You can now build an admin dashboard to:

1. **View all leads** - with filtering and search
2. **Update lead status** - new → contacted → qualified → converted
3. **Add notes** - track conversations
4. **See analytics** - conversion rates, revenue
5. **Manage tenants** - add/edit bulk clients

Example endpoint:

```typescript
// /app/api/admin/leads/route.ts
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getServiceRoleClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return Response.json({ leads });
}
```

---

## 🔐 Security Notes

### ✅ Safe (Public)

- `NEXT_PUBLIC_SUPABASE_URL` - Just your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Designed for client-side

### 🔒 Secret (Server-Only)

- `SUPABASE_SERVICE_ROLE_KEY` - Never expose!
- Only use in API routes
- Bypasses Row Level Security

### Row Level Security (RLS)

We've enabled RLS on all tables with policies:

- **Service role** = full access (for your API routes)
- **Public/anon** = read-only for active tenants

This means even if someone gets your anon key, they can't modify data!

---

**You're all set!** 🎉

Your leads will now be stored in Supabase AND emailed to you. Best of both worlds!
