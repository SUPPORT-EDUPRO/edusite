#!/bin/bash
#
# Quick Deployment Script for Automated Registration Sync
# 
# This script automates the deployment of Edge Functions and webhook setup
# for the bidirectional sync between EduSitePro and EduDashPro
#
# Usage: ./deploy-automated-sync.sh
#

set -e  # Exit on error

echo "🚀 EduDashPro Automated Sync Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "next.config.js" ] && [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: Must run from /home/king/Desktop/edusitepro${NC}"
  exit 1
fi

# Ensure we're in edusitepro, not edudashpro
if [[ ! "$PWD" =~ edusitepro ]]; then
  echo -e "${RED}❌ Error: Must run from /home/king/Desktop/edusitepro directory${NC}"
  echo "Current directory: $PWD"
  exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo -e "${RED}❌ Error: Supabase CLI not installed${NC}"
  echo "Install with: npm install -g supabase"
  exit 1
fi

echo -e "${YELLOW}📋 Step 1: Verify Supabase Project${NC}"
# Check if already linked
if supabase projects list 2>/dev/null | grep -q bppuzibjlxgfwrujzfsz; then
  echo -e "${GREEN}✅ Already linked to EduSitePro (bppuzibjlxgfwrujzfsz)${NC}"
else
  echo "Linking to EduSitePro (bppuzibjlxgfwrujzfsz)..."
  supabase link --project-ref bppuzibjlxgfwrujzfsz --debug
fi

echo ""
echo -e "${YELLOW}📋 Step 2: Set Environment Variables${NC}"
echo "You need to provide service role keys for both databases."
echo ""

# Prompt for keys if not already set
read -p "Enter EduSitePro Service Role Key: " EDUSITE_KEY
read -p "Enter EduDashPro Service Role Key: " EDUDASH_KEY

echo "Setting secrets..."
supabase secrets set EDUSITE_SUPABASE_URL="https://bppuzibjlxgfwrujzfsz.supabase.co"
supabase secrets set EDUSITE_SERVICE_ROLE_KEY="$EDUSITE_KEY"
supabase secrets set EDUDASH_SUPABASE_URL="https://lvvvjywrmpcqrpvuptdi.supabase.co"
supabase secrets set EDUDASH_SERVICE_ROLE_KEY="$EDUDASH_KEY"

echo ""
echo -e "${YELLOW}📋 Step 3: Deploy Edge Functions${NC}"
echo "Deploying sync-registration-to-edudash..."
supabase functions deploy sync-registration-to-edudash

echo "Deploying sync-approval-to-edusite..."
supabase functions deploy sync-approval-to-edusite

echo ""
echo -e "${GREEN}✅ Edge Functions deployed successfully!${NC}"
echo ""

echo -e "${YELLOW}📋 Step 4: Setup Database Webhooks${NC}"
echo "You need to run SQL migrations in both databases:"
echo ""
echo "1. In EduSitePro (https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/editor):"
echo "   - Run migrations/setup_automated_sync_webhooks.sql (PART 1, 3, 4)"
echo ""
echo "2. In EduDashPro (https://supabase.com/dashboard/project/lvvvjywrmpcqrpvuptdi/editor):"
echo "   - Run migrations/setup_automated_sync_webhooks.sql (PART 2, 3, 4)"
echo ""

read -p "Press Enter after running migrations in both databases..."

echo ""
echo -e "${YELLOW}📋 Step 5: Test the Sync${NC}"
echo "Running test registration..."

# Create test registration in EduSitePro
cat > /tmp/test-registration.sql <<EOF
-- Test Registration
INSERT INTO registration_requests (
  organization_id,
  centre_id,
  class_id,
  student_first_name,
  student_last_name,
  student_dob,
  guardian_first_name,
  guardian_last_name,
  guardian_email,
  guardian_phone,
  status
) VALUES (
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1',  -- Young Eagles
  (SELECT id FROM centres WHERE organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1' LIMIT 1),
  (SELECT id FROM classes WHERE class_name = 'Curious Cubs' AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1' LIMIT 1),
  'Test',
  'Child',
  '2023-01-15',
  'Test',
  'Guardian',
  'test-sync@example.com',
  '0123456789',
  'pending'
)
RETURNING id, student_first_name, guardian_email;
EOF

echo "SQL test file created at /tmp/test-registration.sql"
echo ""
echo "Run this in EduSitePro SQL Editor and check EduDashPro for the synced record."
echo ""

echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Submit a test registration via Young Eagles PWA"
echo "2. Check EduDashPro mobile app for the new registration"
echo "3. Approve/reject the registration in the app"
echo "4. Verify status updates back in EduSitePro"
echo ""
echo "Logs & Monitoring:"
echo "- Edge Function Logs: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/functions"
echo "- Sync Logs Query: SELECT * FROM sync_logs ORDER BY synced_at DESC LIMIT 20;"
echo ""
echo "For full details, see: AUTOMATED_SYNC_DEPLOYMENT_GUIDE.md"
