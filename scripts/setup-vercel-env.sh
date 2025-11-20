#!/bin/bash

# EduSitePro - Vercel Environment Variables Setup Script
# Run this after installing vercel CLI: npm i -g vercel

echo "🚀 Setting up Vercel environment variables for EduSitePro..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Link to project (if not already linked)
echo "📦 Linking to Vercel project..."
vercel link

echo ""
echo "⚙️  Adding environment variables..."
echo ""

# Site Configuration
echo "1️⃣  Site URL..."
vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://edusitepro.edudashpro.org.za"
vercel env add NEXT_PUBLIC_SITE_URL preview <<< "https://edusitepro.edudashpro.org.za"

# hCaptcha (you'll need to paste keys when prompted)
echo ""
echo "2️⃣  hCaptcha Keys (you'll be prompted to enter)..."
echo "   Get keys from: https://www.hcaptcha.com/"
vercel env add NEXT_PUBLIC_HCAPTCHA_SITE_KEY production
vercel env add NEXT_PUBLIC_HCAPTCHA_SITE_KEY preview
vercel env add HCAPTCHA_SECRET_KEY production

# Resend Email
echo ""
echo "3️⃣  Resend Email API (you'll be prompted to enter)..."
echo "   Get API key from: https://resend.com/"
vercel env add RESEND_API_KEY production
vercel env add MARKETING_LEADS_EMAIL_TO production <<< "leads@edudashpro.org.za"
vercel env add MARKETING_LEADS_EMAIL_TO preview <<< "leads@edudashpro.org.za"

# EduDash Pro Integration
echo ""
echo "4️⃣  EduDash Pro Integration..."
vercel env add NEXT_PUBLIC_EDUDASH_APP_URL production <<< "https://edudashpro.org.za"
vercel env add NEXT_PUBLIC_EDUDASH_APP_URL preview <<< "https://edudashpro.org.za"
vercel env add NEXT_PUBLIC_ANDROID_STORE_URL production <<< "https://play.google.com/store/apps/details?id=com.edudashpro"
vercel env add NEXT_PUBLIC_ANDROID_STORE_URL preview <<< "https://play.google.com/store/apps/details?id=com.edudashpro"
vercel env add NEXT_PUBLIC_IOS_STORE_URL production <<< "https://apps.apple.com/za/app/edudash-pro/id123456789"
vercel env add NEXT_PUBLIC_IOS_STORE_URL preview <<< "https://apps.apple.com/za/app/edudash-pro/id123456789"
vercel env add NEXT_PUBLIC_EDUDASH_DEEP_LINK_BASE production <<< "edudashpro://"
vercel env add NEXT_PUBLIC_EDUDASH_DEEP_LINK_BASE preview <<< "edudashpro://"

# Analytics
echo ""
echo "5️⃣  Analytics (PostHog)..."
vercel env add NEXT_PUBLIC_POSTHOG_KEY production <<< "phc_yvYvnGn7Cd9iTsUPobcDsa6E1L2R4AMzrrAutYguIIF"
vercel env add NEXT_PUBLIC_POSTHOG_KEY preview <<< "phc_yvYvnGn7Cd9iTsUPobcDsa6E1L2R4AMzrrAutYguIIF"
vercel env add NEXT_PUBLIC_POSTHOG_HOST production <<< "https://us.i.posthog.com"
vercel env add NEXT_PUBLIC_POSTHOG_HOST preview <<< "https://us.i.posthog.com"
vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production <<< "true"
vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS preview <<< "true"

# PWA
echo ""
echo "6️⃣  PWA..."
vercel env add NEXT_PUBLIC_ENABLE_PWA production <<< "true"
vercel env add NEXT_PUBLIC_ENABLE_PWA preview <<< "true"

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📝 Note: Some values are placeholders. Update them with real values:"
echo "   - hCaptcha keys: https://www.hcaptcha.com/"
echo "   - Resend API key: https://resend.com/"
echo "   - iOS Store URL: Get real URL from EduDash Pro developers"
echo ""
echo "🚀 To apply changes, redeploy:"
echo "   vercel --prod"
echo ""
