# Supabase Edge Functions Deployment Guide

## Prerequisites

1. Supabase CLI installed
2. Logged into Supabase CLI
3. Project linked

## Step 1: Install Supabase CLI (if not installed)

```bash
# Install Supabase CLI
npm install -g supabase

# Or with homebrew on Mac
# brew install supabase/tap/supabase
```

## Step 2: Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
cd /home/king/Desktop/edusitepro
supabase link --project-ref bppuzibjlxgfwrujzfsz
```

## Step 3: Set Secrets in Supabase

All secrets are stored securely in Supabase (not in code or .env files):

```bash
# hCaptcha Secret Key
supabase secrets set HCAPTCHA_SECRET_KEY=your_hcaptcha_secret_key_here

# Resend API Key
supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# Marketing Email
supabase secrets set MARKETING_LEADS_EMAIL_TO=leads@edudashpro.org.za

# Supabase URL (auto-set, but confirm)
supabase secrets set SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co

# Supabase Service Role Key (from dashboard)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Where to Get These Keys:

**hCaptcha:**

1. Go to: https://dashboard.hcaptcha.com/sites
2. Find your site
3. Copy the "Secret Key"

**Resend:**

1. Go to: https://resend.com/api-keys
2. Create new API key or copy existing
3. Should start with `re_`

**Supabase Service Role Key:**

1. Go to: https://app.supabase.com/project/bppuzibjlxgfwrujzfsz/settings/api
2. Copy the "service_role" key (NOT anon key)
3. Starts with `eyJhbGciOiJIUzI1NiIs...`

## Step 4: Create Database Tables

Run the schema in Supabase SQL Editor:

1. Go to: https://app.supabase.com/project/bppuzibjlxgfwrujzfsz/sql
2. Open `supabase/schema.sql` in this project
3. Copy entire content
4. Paste in SQL Editor
5. Click "Run"

## Step 5: Deploy Edge Function

```bash
cd /home/king/Desktop/edusitepro

# Deploy the submit-lead function
supabase functions deploy submit-lead

# View logs (optional)
supabase functions logs submit-lead
```

## Step 6: Get Function URL

After deployment, you'll get a URL like:

```
https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/submit-lead
```

Copy this URL - you'll need it in the next step.

## Step 7: Update Frontend to Call Edge Function

Edit `src/components/forms/BulkQuoteForm.tsx`:

Change the fetch URL from:

```typescript
const response = await fetch('/api/lead', {
```

To:

```typescript
const SUPABASE_FUNCTION_URL = 'https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/submit-lead';

const response = await fetch(SUPABASE_FUNCTION_URL, {
```

## Step 8: Add to Vercel Environment Variables

Only client-side vars needed in Vercel now:

✅ **Already Set (from your current .env.local):**

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_ANDROID_STORE_URL`
- `NEXT_PUBLIC_IOS_STORE_URL`
- `NEXT_PUBLIC_EDUDASH_DEEP_LINK_BASE`
- `NEXT_PUBLIC_ENABLE_ANALYTICS`
- `NEXT_PUBLIC_ENABLE_PWA`

❌ **Remove from Vercel (now in Supabase):**

- `SUPABASE_SERVICE_ROLE_KEY` - not needed
- `HCAPTCHA_SECRET_KEY` - not needed
- `RESEND_API_KEY` - not needed

## Step 9: Test It

### Local Test (before deploying frontend):

```bash
# Test the edge function directly
curl -X POST https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "Test User",
    "email": "test@example.com",
    "centreCount": 5,
    "provinces": ["gauteng"],
    "preferredLanguages": ["en"],
    "captchaToken": "test_token"
  }'
```

### Full Test:

1. Deploy your Next.js app to Vercel
2. Visit: https://edusitepro.edudashpro.org.za/bulk
3. Fill out the form
4. Submit
5. Check Supabase Table Editor for new lead
6. Check email for notification

## Troubleshooting

### Check Edge Function Logs:

```bash
supabase functions logs submit-lead --tail
```

### List All Secrets:

```bash
supabase secrets list
```

### Update a Secret:

```bash
supabase secrets set KEY_NAME=new_value
```

### Common Issues:

**"Missing SUPABASE_URL"**

- Set secret: `supabase secrets set SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co`

**"Captcha verification failed"**

- Check hCaptcha secret key is correct
- Verify hCaptcha site allows your domain

**"Email not sending"**

- Check Resend API key is valid
- Verify Resend domain is authenticated

**"Database insert fails"**

- Run schema.sql in SQL Editor
- Check Row Level Security policies

## Benefits of This Architecture

✅ **All secrets in Supabase** - no secrets in Vercel or .env files  
✅ **Closer to database** - lower latency  
✅ **Simpler deployment** - no API routes to manage  
✅ **Built-in logging** - `supabase functions logs`  
✅ **Auto-scaling** - Supabase handles it  
✅ **Free tier** - 500K function invocations/month

## Next Steps

1. Deploy the Edge Function
2. Update frontend form to call the Edge Function URL
3. Remove old Next.js API route (`src/app/api/lead/route.ts`)
4. Test end-to-end
5. Monitor logs
