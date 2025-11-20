# Vercel Environment Variables - Required

## ✅ Required Client-Side Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://edusitepro.edudashpro.org.za

# Supabase (client-side - safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDM3MzAsImV4cCI6MjA2OTMxOTczMH0.LcoKy-VzT6nKLPjcb6BXKHocj4E7DuUQPyH_bmfGbWA

# hCaptcha (site key - public)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=1b669422-7516-4452-82aa-f29828247158

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_yvYvnGn7Cd9iTsUPobcDsa6E1L2R4AMzrrAutYguIIF
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# EduDash Pro Integration
NEXT_PUBLIC_ANDROID_STORE_URL=https://play.google.com/store/apps/details?id=com.edudashpro
NEXT_PUBLIC_IOS_STORE_URL=https://apps.apple.com/za/app/edudash-pro/id123456789
NEXT_PUBLIC_EDUDASH_DEEP_LINK_BASE=edudashpro://

# PWA
NEXT_PUBLIC_ENABLE_PWA=true
```

## ❌ DO NOT Add These to Vercel

These are now in Supabase Secrets (more secure):

```bash
# ❌ SUPABASE_SERVICE_ROLE_KEY - in Supabase
# ❌ HCAPTCHA_SECRET_KEY - in Supabase
# ❌ RESEND_API_KEY - in Supabase
```

## 📝 How to Add in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your `edusitepro` project
3. Click **Settings**
4. Click **Environment Variables**
5. For each variable:
   - Enter **Key** (e.g., `NEXT_PUBLIC_SITE_URL`)
   - Enter **Value**
   - Select **Production**, **Preview**, **Development** (check all 3)
   - Click **Add**
6. After adding all variables, click **Redeploy** in the Deployments tab

## ✅ Verification

After Vercel deploys, check that the form works:

1. Visit: https://edusitepro.edudashpro.org.za/bulk
2. Fill out the form
3. Submit
4. Check Supabase Table Editor for new lead

## 🔍 Troubleshooting

**If form doesn't work:**

- Open browser console (F12)
- Check for errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Ensure Edge Function is deployed: `supabase functions list`
