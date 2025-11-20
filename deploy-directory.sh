#!/bin/bash

# =====================================================
# Organizations Directory - Deployment Script
# =====================================================
# Purpose: Deploy the organizations directory feature
# Created: November 16, 2025
# =====================================================

set -e  # Exit on error

echo "=================================================="
echo "🚀 EduSitePro Organizations Directory Deployment"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =====================================================
# Step 1: Verify psql
# =====================================================
echo -e "${BLUE}Step 1: Verifying psql...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql not found!${NC}"
    echo "Install it with: sudo apt-get install postgresql-client"
    exit 1
fi

echo -e "${GREEN}✓ psql found${NC}"
echo ""

# =====================================================
# Step 2: Check Migration File
# =====================================================
echo -e "${BLUE}Step 2: Checking migration file...${NC}"

MIGRATION_FILE="supabase/migrations/20251116_organizations_directory.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Migration file found${NC}"
echo ""

# =====================================================
# Step 3: Deploy to Supabase
# =====================================================
echo -e "${BLUE}Step 3: Deploying database migration...${NC}"
echo -e "${YELLOW}This will:${NC}"
echo "  - Add directory fields to organizations table"
echo "  - Create public_organizations_directory view"
echo "  - Create get_organizations_by_category() function"
echo "  - Create get_directory_stats() function"
echo "  - Add sample organizations (Little Stars, Sunshine, Excellence)"
echo "  - Set up RLS policies"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Run migration via psql
echo "Running migration via psql..."
echo -e "${YELLOW}You will be prompted for the Supabase database password${NC}"
echo ""

psql -h aws-0-ap-southeast-1.pooler.supabase.com \
     -p 6543 \
     -U postgres.bppuzibjlxgfwrujzfsz \
     -d postgres \
     -f "$MIGRATION_FILE" || {
    echo -e "${RED}❌ Migration failed!${NC}"
    echo "Try running manually via Supabase Dashboard SQL Editor"
    exit 1
}

echo -e "${GREEN}✓ Database migration deployed${NC}"
echo ""

# =====================================================
# Step 4: Verify Deployment
# =====================================================
echo -e "${BLUE}Step 4: Verifying deployment...${NC}"

# Check if view exists
echo "Checking if view exists..."
psql -h aws-0-ap-southeast-1.pooler.supabase.com \
     -p 6543 \
     -U postgres.bppuzibjlxgfwrujzfsz \
     -d postgres \
     -c "SELECT COUNT(*) FROM public_organizations_directory;" &> /dev/null && \
    echo -e "${GREEN}✓ View created successfully${NC}" || \
    echo -e "${RED}❌ View creation failed${NC}"

# Check if functions exist
echo "Checking if functions exist..."
psql -h aws-0-ap-southeast-1.pooler.supabase.com \
     -p 6543 \
     -U postgres.bppuzibjlxgfwrujzfsz \
     -d postgres \
     -c "SELECT get_directory_stats();" &> /dev/null && \
    echo -e "${GREEN}✓ Functions created successfully${NC}" || \
    echo -e "${RED}❌ Function creation failed${NC}"

echo ""

# =====================================================
# Step 5: Display Sample Data
# =====================================================
echo -e "${BLUE}Step 5: Sample organizations in directory:${NC}"

psql -h aws-0-ap-southeast-1.pooler.supabase.com \
     -p 6543 \
     -U postgres.bppuzibjlxgfwrujzfsz \
     -d postgres \
     -c "SELECT name, organization_type, city, province, total_students, featured FROM public_organizations_directory ORDER BY featured DESC, name;" || \
     echo -e "${YELLOW}Could not fetch sample data${NC}"

echo ""

# =====================================================
# Step 6: Build Frontend
# =====================================================
echo -e "${BLUE}Step 6: Building frontend...${NC}"

npm run build || {
    echo -e "${YELLOW}⚠️ Build failed. Fix errors before deploying to Vercel${NC}"
    exit 1
}

echo -e "${GREEN}✓ Frontend build successful${NC}"
echo ""

# =====================================================
# Step 7: Summary & Next Steps
# =====================================================
echo "=================================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo "📊 What was deployed:"
echo "  ✓ Database schema updates"
echo "  ✓ Public directory view"
echo "  ✓ Search and filter functions"
echo "  ✓ Sample organizations (4 schools)"
echo "  ✓ RLS policies for public access"
echo "  ✓ Frontend components"
echo ""
echo "🌐 Test the directory:"
echo "  Local:  http://localhost:3002/organizations"
echo "  Live:   https://edusitepro.org.za/organizations"
echo ""
echo "📚 Documentation:"
echo "  - ORGANIZATIONS_DIRECTORY_GUIDE.md (complete guide)"
echo "  - supabase/migrations/20251116_organizations_directory.sql (SQL)"
echo "  - src/app/organizations/page.tsx (main page)"
echo "  - src/components/directory/OrganizationCard.tsx (card component)"
echo ""
echo "🚀 Next steps:"
echo "  1. Test locally: npm run dev"
echo "  2. Visit: http://localhost:3002/organizations"
echo "  3. Test search, filters, and category tabs"
echo "  4. Deploy to Vercel: vercel --prod"
echo "  5. Test live site"
echo ""
echo "📈 Marketing:"
echo "  - Add to homepage as featured section"
echo "  - Promote in school onboarding emails"
echo "  - Share on social media"
echo "  - Add to sales presentations"
echo ""
echo -e "${GREEN}Happy launching! 🎉${NC}"
echo ""
