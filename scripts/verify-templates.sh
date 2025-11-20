#!/bin/bash

# EduSitePro Template Verification Script
# Tests that all templates are working correctly

echo "🔍 EduSitePro Template Verification"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PORT=${1:-3000}
BASE_URL="http://localhost:$PORT"

# Wait for server to be ready
echo "⏳ Waiting for server on port $PORT..."
for i in {1..30}; do
  if curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Server is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}✗${NC} Server not responding after 30 seconds"
    exit 1
  fi
  sleep 1
done

echo ""
echo "Testing pages..."
echo "----------------"

# Test homepage
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/" | grep -q "200"; then
  echo -e "${GREEN}✓${NC} Homepage (/) - OK"
else
  echo -e "${RED}✗${NC} Homepage (/) - FAILED"
fi

# Test templates listing
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/templates" | grep -q "200"; then
  echo -e "${GREEN}✓${NC} Templates listing (/templates) - OK"
else
  echo -e "${RED}✗${NC} Templates listing (/templates) - FAILED"
fi

# Test individual templates
TEMPLATES=(
  "welcome-play"
  "bright-start"
  "storytime"
  "coding-blocks"
  "little-engineers"
  "digital-storytellers"
)

echo ""
echo "Testing individual templates..."
echo "------------------------------"

FAILED=0
for template in "${TEMPLATES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/templates/$template")
  if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} /templates/$template - OK"
  else
    echo -e "${RED}✗${NC} /templates/$template - FAILED (HTTP $STATUS)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "Summary"
echo "-------"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All 6 templates working correctly!${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAILED template(s) failed${NC}"
  exit 1
fi
