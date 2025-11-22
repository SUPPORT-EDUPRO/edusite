#!/bin/bash

# Deploy email function and setup secrets for EduSitePro

set -e

echo "🚀 Deploying send-email Edge Function..."

cd /home/king/Desktop/edusitepro

# Deploy the function
npx supabase functions deploy send-email

echo "✅ Edge Function deployed!"
echo ""
echo "📧 Now set up your Resend API key:"
echo ""
echo "1. Get API key from https://resend.com"
echo "2. Run: npx supabase secrets set RESEND_API_KEY=re_YOUR_KEY_HERE"
echo "3. Run: npx supabase secrets set FROM_EMAIL=onboarding@resend.dev"
echo ""
echo "4. Test with a registration at: http://localhost:3002/registration/young-eagles"
echo ""
echo "📝 For custom domain email (noreply@youngeagles.org.za):"
echo "   - Add youngeagles.org.za in Resend dashboard"
echo "   - Configure DNS records"
echo "   - Update FROM_EMAIL secret"
