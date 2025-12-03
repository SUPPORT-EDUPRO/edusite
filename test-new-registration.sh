#!/bin/bash

# Test New Organization Registration Flow
# Simulates registration from EduDashPro

set -e

echo "🧪 Testing New Organization Registration Flow"
echo "=============================================="
echo ""

# Configuration
ORG_NAME="Test Academy"
ORG_SLUG="test-academy"
ADMIN_EMAIL="testadmin@testacademy.org"
ADMIN_NAME="Test Admin"
DB_HOST="aws-0-ap-southeast-1.pooler.supabase.com"
DB_PORT="6543"
DB_USER="postgres.bppuzibjlxgfwrujzfsz"
DB_NAME="postgres"
DB_PASSWORD="Vh5643qenbxXizCQ"

# Generate UUID for organization
ORG_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

echo "📋 Registration Details:"
echo "   Organization: $ORG_NAME"
echo "   Slug: $ORG_SLUG"
echo "   Admin: $ADMIN_EMAIL"
echo "   UUID: $ORG_ID"
echo ""

# Step 1: Create organization in database
echo "Step 1: Creating organization in database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Create organization
INSERT INTO organizations (id, name, slug, custom_domain, domain_verified, created_at, updated_at)
VALUES (
  '$ORG_ID',
  '$ORG_NAME',
  '$ORG_SLUG',
  NULL,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Organization created: ' || name || ' (slug: ' || slug || ')' as result
FROM organizations WHERE id = '$ORG_ID';
EOF

if [ $? -eq 0 ]; then
    echo "✅ Step 1 Complete"
else
    echo "❌ Step 1 Failed"
    exit 1
fi

echo ""

# Step 2: Call sync API
echo "Step 2: Syncing to EduSitePro..."
SYNC_RESPONSE=$(curl -s -X POST https://edusitepro.edudashpro.org.za/api/organizations/sync \
  -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"$ORG_ID\",
    \"organization_name\": \"$ORG_NAME\",
    \"organization_slug\": \"$ORG_SLUG\",
    \"admin_email\": \"$ADMIN_EMAIL\",
    \"admin_name\": \"$ADMIN_NAME\"
  }")

echo "$SYNC_RESPONSE" | jq '.'

if echo "$SYNC_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo "✅ Step 2 Complete"
else
    echo "⚠️  Step 2 Warning: Check response above"
fi

echo ""

# Step 3: Create user with metadata
echo "Step 3: Creating user account..."
echo "⚠️  This step requires Supabase Admin API access"
echo "   You can create the user manually via:"
echo "   1. Supabase Dashboard → Authentication → Users → Create User"
echo "   2. Email: $ADMIN_EMAIL"
echo "   3. User Metadata (JSON):"
echo "      {
        \"full_name\": \"$ADMIN_NAME\",
        \"organization_id\": \"$ORG_ID\",
        \"role\": \"organization_admin\"
      }"
echo ""

# Step 4: Validate registration
echo "Step 4: Validating registration..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Run validation
SELECT * FROM validate_organization_registration('$ORG_ID', '$ADMIN_EMAIL');

-- Check health
SELECT 
  '🔍 Health Check' as check_type,
  health_status,
  user_count,
  admin_count,
  issues
FROM organization_health
WHERE id = '$ORG_ID';
EOF

if [ $? -eq 0 ]; then
    echo "✅ Step 4 Complete"
else
    echo "❌ Step 4 Failed"
    exit 1
fi

echo ""
echo "=============================================="
echo "✨ Registration Test Summary"
echo "=============================================="
echo ""
echo "✅ Organization Created: $ORG_NAME ($ORG_SLUG)"
echo "📧 Admin Email: $ADMIN_EMAIL"
echo "🔗 Dashboard URL: https://edusitepro.edudashpro.org.za/dashboard"
echo ""
echo "⏭️  Next Steps:"
echo "   1. Create user in Supabase Dashboard (see Step 3 above)"
echo "   2. Send invitation email with magic link"
echo "   3. User verifies email → Profile auto-created via trigger"
echo "   4. User logs in → Access dashboard"
echo ""
echo "🔍 To check status:"
echo "   SELECT * FROM organization_health WHERE slug = '$ORG_SLUG';"
echo ""
