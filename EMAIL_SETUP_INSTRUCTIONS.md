# Email Setup Instructions for EduSitePro

## Issue
The registration confirmation emails are failing with 500 errors because:
1. The `send-email` Edge Function doesn't exist in EduSitePro
2. The RESEND_API_KEY is not configured in Supabase secrets

## Solution

### Step 1: Get Resend API Key

1. Go to [Resend.com](https://resend.com) and sign up/login
2. Navigate to **API Keys** section
3. Create a new API key with name "EduSitePro Production"
4. Copy the API key (starts with `re_...`)

### Step 2: Deploy Edge Function

```bash
cd /home/king/Desktop/edusitepro

# Deploy the send-email function
npx supabase functions deploy send-email

# Set the Resend API key in Supabase secrets
npx supabase secrets set RESEND_API_KEY=re_YOUR_ACTUAL_KEY_HERE

# Set the FROM email address
npx supabase secrets set FROM_EMAIL=noreply@youngeagles.org.za
```

### Step 3: Verify Domain in Resend

1. In Resend dashboard, go to **Domains**
2. Add domain: `youngeagles.org.za`
3. Add the DNS records provided by Resend to your domain provider
4. Wait for verification (usually 5-10 minutes)

**Alternative**: Use Resend's shared domain initially:
- FROM_EMAIL=`onboarding@resend.dev` (works immediately, no DNS setup needed)

### Step 4: Test Email Sending

```bash
# Test the Edge Function
curl -X POST 'https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/send-email' \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "king@youngeagles.org.za",
    "subject": "Test Email",
    "body": "<h1>Hello!</h1><p>This is a test email from EduSitePro</p>",
    "is_html": true,
    "confirmed": true
  }'
```

### Step 5: Fix Marketing Campaigns RLS

Run the SQL script to fix 406 errors:

```bash
# In Supabase SQL Editor, run:
psql $DATABASE_URL < fix-marketing-campaigns-rls.sql

# Or via Supabase Dashboard:
# 1. Open SQL Editor
# 2. Paste contents of fix-marketing-campaigns-rls.sql
# 3. Run Query
```

## Quick Commands

```bash
# Deploy everything at once
cd /home/king/Desktop/edusitepro
npx supabase functions deploy send-email
npx supabase secrets set RESEND_API_KEY=re_YOUR_KEY_HERE
npx supabase secrets set FROM_EMAIL=onboarding@resend.dev
```

## Environment Variables Needed

Add to `.env.local` (already present):
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co
```

## Verification

After setup, test a registration at:
`http://localhost:3002/registration/young-eagles`

You should:
1. ✅ See no 406 errors for marketing_campaigns
2. ✅ Receive confirmation email after submission
3. ✅ Email should contain payment reference and banking details
