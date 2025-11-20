#!/bin/bash

# Script to add hCaptcha keys to .env.local
# Run this after creating your hCaptcha site

echo "🔐 hCaptcha Key Setup"
echo ""
echo "After creating your site, copy the keys from:"
echo "https://dashboard.hcaptcha.com/sites/new"
echo ""

# Get the .env.local file path
ENV_FILE="/home/king/Desktop/edusitepro/.env.local"

# Check if file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env.local not found at $ENV_FILE"
    exit 1
fi

# Prompt for Site Key
echo "📝 Paste your SITE KEY (public key):"
read -r SITE_KEY

# Prompt for Secret Key
echo "📝 Paste your SECRET KEY (private key):"
read -r SECRET_KEY

# Update .env.local
echo ""
echo "✍️  Updating .env.local..."

# Use sed to replace the values
sed -i "s|NEXT_PUBLIC_HCAPTCHA_SITE_KEY=.*|NEXT_PUBLIC_HCAPTCHA_SITE_KEY=$SITE_KEY|g" "$ENV_FILE"
sed -i "s|HCAPTCHA_SECRET_KEY=.*|HCAPTCHA_SECRET_KEY=$SECRET_KEY|g" "$ENV_FILE"

echo "✅ Done! Your .env.local has been updated."
echo ""
echo "🎯 Next steps:"
echo "1. Add the same keys to Vercel (for production)"
echo "2. Test locally: npm run dev"
echo "3. Visit: http://localhost:3000/bulk"
echo ""
