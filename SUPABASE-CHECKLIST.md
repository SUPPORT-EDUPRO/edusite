# 🚀 Supabase Edge Functions - Quick Checklist

## ✅ Current Status

You said you've already:

- [x] Stored all secrets in Supabase Secrets (not .env)
- [x] Have Supabase database ready
- [x] Have hCaptcha site created (refuses localhost - that's fine, use production domain only)

## 📋 Next Steps (In Order)

### 1. Verify Vercel Has Only Client-Side Vars

Go to Vercel Dashboard → Settings → Environment Variables

**Should have these NEXT*PUBLIC*\* vars:**

```
✅ NEXT_PUBLIC_SITE_URL=https://edusitepro.edudashpro.org.za
✅ NEXT_PUBLIC_SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ NEXT_PUBLIC_HCAPTCHA_SITE_KEY=1b669422-7516-4452-82aa-f29828247158
✅ NEXT_PUBLIC_POSTHOG_KEY=phc_yvYvnGn7Cd9iTsUPobcDsa6E1L2R4AMzrrAutYguIIF
✅ NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
✅ NEXT_PUBLIC_ENABLE_ANALYTICS=true
✅ NEXT_PUBLIC_ANDROID_STORE_URL=https://play.google.com/store/apps/details?id=com.edudashpro
✅ NEXT_PUBLIC_IOS_STORE_URL=https://apps.apple.com/za/app/edudash-pro/id123456789
✅ NEXT_PUBLIC_EDUDASH_DEEP_LINK_BASE=edudashpro://
✅ NEXT_PUBLIC_ENABLE_PWA=true
```

**Should NOT have these (now in Supabase):**

```
❌ SUPABASE_SERVICE_ROLE_KEY (remove from Vercel)
❌ HCAPTCHA_SECRET_KEY (remove from Vercel)
❌ RESEND_API_KEY (remove from Vercel)
```

### 2. Install Supabase CLI

```bash
npm install -g supabase
```

### 3. Login and Link Project

```bash
cd /home/king/Desktop/edusitepro
supabase login
supabase link --project-ref bppuzibjlxgfwrujzfsz
```

### 4. Verify Secrets in Supabase

```bash
# List all secrets
supabase secrets list
```

**Should see:**

- HCAPTCHA_SECRET_KEY
- RESEND_API_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_URL
- MARKETING_LEADS_EMAIL_TO

If any are missing, set them:

```bash
supabase secrets set HCAPTCHA_SECRET_KEY=your_key_here
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
supabase secrets set SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co
supabase secrets set MARKETING_LEADS_EMAIL_TO=leads@edudashpro.org.za
```

### 5. Run Database Schema

1. Go to: https://app.supabase.com/project/bppuzibjlxgfwrujzfsz/sql
2. Click "New Query"
3. Copy contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Check Table Editor for: `leads`, `lead_notes`, `tenants`

### 6. Deploy Edge Function

```bash
cd /home/king/Desktop/edusitepro
supabase functions deploy submit-lead
```

**Expected output:**

```
Deploying function submit-lead...
Function URL: https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/submit-lead
```

### 7. Update Frontend Form

Edit `src/components/forms/BulkQuoteForm.tsx`

**Find this line (around line 39):**

```typescript
const response = await fetch('/api/lead', {
```

**Replace with:**

```typescript
const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-lead`;

const response = await fetch(EDGE_FUNCTION_URL, {
```

### 8. Test Edge Function

```bash
# Test with curl
curl -X POST https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "Test User",
    "email": "test@example.com",
    "centreCount": 5,
    "provinces": ["gauteng"],
    "preferredLanguages": ["en"],
    "captchaToken": "10000000-aaaa-bbbb-cccc-000000000001"
  }'
```

Expected: `{"success":false,"message":"Captcha verification failed"}`
(because test token won't work, but it means function is running!)

### 9. Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Migrate to Supabase Edge Functions"
git push origin main

# Vercel will auto-deploy
```

### 10. Test End-to-End

1. Visit: https://edusitepro.edudashpro.org.za/bulk
2. Fill out form (use real hCaptcha)
3. Submit
4. Check Supabase Table Editor → `leads` table for new row
5. Check email inbox for notification

### 11. Monitor Logs

```bash
# Watch logs in real-time
supabase functions logs submit-lead --tail

# Or view in dashboard
# https://app.supabase.com/project/bppuzibjlxgfwrujzfsz/functions
```

## 🎯 Summary of Changes

### Before (Next.js API Routes):

- Secrets in Vercel Environment Variables
- API route at `/api/lead` on Vercel servers
- More complex to manage

### After (Supabase Edge Functions):

- Secrets in Supabase (secure vault)
- Edge function at Supabase
- Simpler, closer to database
- Better for serverless architecture

## 📝 hCaptcha Note

You mentioned hCaptcha refused `localhost`. That's fine!

**For local development without hCaptcha:**

- Use production URL testing
- Or add `127.0.0.1` to hCaptcha domains
- Or use hCaptcha test keys (they accept any domain)

**hCaptcha test keys (for development):**

- Site Key: `10000000-ffff-ffff-ffff-000000000001`
- Secret Key: `0x0000000000000000000000000000000000000000`

## ✅ When Complete

You'll have:

- ✅ All secrets stored securely in Supabase
- ✅ Edge function handling form submissions
- ✅ Leads stored in database
- ✅ Email notifications via Resend
- ✅ No secrets in Vercel or code
- ✅ Simpler architecture

**Ready? Let's go to Supabase and finish this!** 🚀
