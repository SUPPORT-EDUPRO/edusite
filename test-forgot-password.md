# Forgot Password Testing Guide

## What Was Fixed

### 1. Organization Slug Update
✅ **davecon12martin@outlook.com** now linked to **SOA** organization (slug: `soa`)
- Previous: davecon-tertiary 
- Current: soa

### 2. Email Service Configuration
✅ **RESEND_API_KEY** is configured: `re_V3Ntetbw_K1QLsXPtaQS8KM7RAUmnvCpB`
- Service: Resend API
- From: `EduSitePro <noreply@edudashpro.org.za>`
- Template: `/src/lib/email/templates/password-reset.tsx`

## Forgot Password Flow

### User Flow:
1. **Navigate to**: https://edusitepro.edudashpro.org.za/forgot-password
2. **Enter email**: User's registered email address
3. **API Call**: POST `/api/auth/forgot-password`
4. **Email Sent**: Via Resend API with password reset link
5. **User Clicks Link**: In email (action_link from Supabase)
6. **Redirects to**: `/auth/callback?type=recovery&code=...`
7. **Callback Exchanges Code**: Creates recovery session
8. **Final Redirect**: `/reset-password` page
9. **User Sets Password**: Updates password in Supabase
10. **Success**: Redirected to `/login`

### Technical Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User submits email at /forgot-password                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. POST /api/auth/forgot-password                               │
│    - Checks if user exists in profiles table                    │
│    - Generates recovery link via Supabase Admin API             │
│    - Gets action_link with embedded token                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Send email via Resend API                                    │
│    - Template: password-reset.tsx                               │
│    - From: noreply@edudashpro.org.za                            │
│    - Link includes: code + redirect_to=/reset-password          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. User clicks link in email                                    │
│    URL: /auth/callback?type=recovery&code=xxx&redirect_to=...   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Auth callback page exchanges code for session                │
│    - supabase.auth.exchangeCodeForSession(code)                 │
│    - Creates recovery session (valid for 1 hour)                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Redirect to /reset-password                                  │
│    - Page checks for valid recovery session                     │
│    - Shows password reset form                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. User submits new password                                    │
│    - supabase.auth.updateUser({ password })                     │
│    - Password updated in auth.users table                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Success! Redirect to /login                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Potential Issues & Solutions

### Issue 1: Email Not Received
**Symptoms**: User submits forgot password but doesn't receive email

**Debugging**:
```bash
# Check server logs for email service
# Look for these log lines:
[Email Service] Starting password reset email send to: user@example.com
[Email Service] RESEND_API_KEY present: true
[Email Service] Using Resend API
[Email Service] Resend API response status: 200
[Email Service] Password reset email sent successfully via Resend: <email_id>
```

**Possible Causes**:
1. ❌ Email not in `profiles` table
   - Solution: User must be registered first
   
2. ❌ Resend API key invalid/expired
   - Check: Resend dashboard at https://resend.com/emails
   - Verify: API key has send permissions
   
3. ❌ Email blocked by spam filter
   - Check: User's spam/junk folder
   - Verify: Sender domain configured in Resend
   
4. ❌ Resend domain not verified
   - Check: https://resend.com/domains
   - Add DNS records for edudashpro.org.za

### Issue 2: Link Expires or Invalid
**Symptoms**: "Invalid or expired reset link" error

**Causes**:
1. ❌ Link older than 1 hour (Supabase default expiry)
2. ❌ Link already used
3. ❌ Code exchange failed

**Solution**: Request new reset link

### Issue 3: Redirect Issues
**Symptoms**: After clicking link, user not reaching reset page

**Check**:
1. ✅ Redirect URL matches: `/auth/callback?type=recovery&redirect_to=/reset-password`
2. ✅ Callback page exchanges code correctly
3. ✅ Recovery session created

## Testing Checklist

### Test 1: Valid Email
- [ ] Go to https://edusitepro.edudashpro.org.za/forgot-password
- [ ] Enter: `davecon12martin@outlook.com`
- [ ] Submit form
- [ ] Verify: "Password reset link sent successfully" message
- [ ] Check email inbox
- [ ] Click reset link
- [ ] Verify: Redirected to /reset-password
- [ ] Enter new password (min 8 chars)
- [ ] Submit
- [ ] Verify: "Password Reset Successfully!" message
- [ ] Verify: Redirected to /login
- [ ] Login with new password

### Test 2: Invalid Email
- [ ] Go to forgot-password page
- [ ] Enter: `nonexistent@example.com`
- [ ] Submit form
- [ ] Verify: Generic success message (security: don't reveal if email exists)
- [ ] Verify: No email sent (check server logs)

### Test 3: Expired Link
- [ ] Request reset link
- [ ] Wait 61+ minutes
- [ ] Click link
- [ ] Verify: "Invalid or expired reset link" error
- [ ] Click "Request New Reset Link"
- [ ] Verify: New email sent

### Test 4: Link Reuse
- [ ] Request reset link
- [ ] Click link and reset password
- [ ] Try clicking same link again
- [ ] Verify: "Invalid or expired reset link" error

## Manual Testing (Production)

### Step 1: Check Email Service
```bash
# SSH into production or check Vercel logs
# Search for: [Email Service]
# Expected output:
[Email Service] Starting password reset email send to: user@example.com
[Email Service] RESEND_API_KEY present: true
[Email Service] Using Resend API
[Email Service] Resend API response status: 200
[Email Service] Password reset email sent successfully via Resend: abc123
```

### Step 2: Test with Real Email
1. Use your own email: `zanelemakunyane@gmail.com`
2. Submit forgot password form
3. Check inbox (and spam folder)
4. Click link within 1 hour
5. Set new password
6. Login with new password

### Step 3: Check Resend Dashboard
1. Go to: https://resend.com/emails
2. Login with your account
3. Check recent emails
4. Verify delivery status
5. Check bounce/complaint reports

## Environment Variables Required

### Production (.env.local or Vercel):
```env
RESEND_API_KEY=re_V3Ntetbw_K1QLsXPtaQS8KM7RAUmnvCpB
NEXT_PUBLIC_SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SITE_URL=https://edusitepro.edudashpro.org.za
```

## Supabase Email Settings

### Check Supabase Email Configuration:
1. Go to: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz
2. Navigate to: Authentication → Email Templates
3. Check "Reset Password" template
4. Verify redirect URL in template

### SMTP Settings (if using custom SMTP):
1. Dashboard → Project Settings → Auth
2. SMTP Settings → Enable Custom SMTP (optional)
3. If using Resend SMTP:
   - Host: smtp.resend.com
   - Port: 587
   - Username: resend
   - Password: <resend_api_key>

## Common Errors & Fixes

### Error: "Failed to send reset email"
**Cause**: Resend API error
**Fix**: 
1. Check API key validity
2. Check Resend dashboard for errors
3. Verify domain setup

### Error: "Invalid or expired reset link"
**Cause**: Token expired or already used
**Fix**: Request new reset link

### Error: "Passwords do not match"
**Cause**: User input error
**Fix**: Ensure password and confirm password match

### Error: "Password must be at least 8 characters"
**Cause**: Password too short
**Fix**: Use longer password

## Current Status

✅ **Email Service**: Configured with Resend API
✅ **API Endpoint**: `/api/auth/forgot-password` working
✅ **Email Template**: `password-reset.tsx` exists
✅ **Callback Handler**: `/auth/callback` properly exchanges code
✅ **Reset Page**: `/reset-password` validates session and updates password
✅ **Organization**: davecon12martin linked to SOA (slug: soa)

## Next Steps

1. **Test forgot password flow** on production
2. **Check email delivery** in Resend dashboard
3. **Verify DNS records** for edudashpro.org.za in Resend
4. **Check Supabase email template** configuration
5. **Test with multiple email providers** (Gmail, Outlook, etc.)

## Support

If issues persist:
1. Check Vercel deployment logs
2. Check Resend dashboard for email delivery status
3. Verify Supabase Auth settings
4. Test with different email addresses
5. Contact support via WhatsApp: +27 67 477 0975
