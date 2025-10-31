#!/bin/bash

# 🔍 System Health Check Script
# Verifies all components of the Climate Analysis system are working

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           🔍 Climate Analysis System Health Check              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Function to check service
check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    echo -n "Checking $name... "
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Running${NC}"
        
        # Try to get response
        if response=$(curl -s -m 2 "$url" 2>/dev/null); then
            echo "  └─ Response: OK"
            return 0
        else
            echo -e "  └─ ${YELLOW}Warning: No response${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Not Running${NC}"
        return 1
    fi
}

# Check MongoDB
echo "═══════════════════════════════════════════════════════════════"
echo "Database"
echo "═══════════════════════════════════════════════════════════════"
echo -n "Checking MongoDB... "

if pgrep -q mongod; then
    echo -e "${GREEN}✅ Running${NC}"
    # Check connection
    if echo "db.version()" | mongosh 2>/dev/null | grep -q "version"; then
        echo "  └─ Connection: OK"
    else
        echo -e "  └─ ${YELLOW}Warning: Could not connect${NC}"
    fi
else
    echo -e "${RED}❌ Not Running${NC}"
    echo "  └─ Start with: mongod --dbpath /usr/local/var/mongodb"
fi
echo ""

# Check Backend
echo "═══════════════════════════════════════════════════════════════"
echo "Backend Services"
echo "═══════════════════════════════════════════════════════════════"
check_service "FastAPI" "http://localhost:5001/api/health" 5001
echo ""

# Check Frontend
echo "═══════════════════════════════════════════════════════════════"
echo "Frontend Services"
echo "═══════════════════════════════════════════════════════════════"
check_service "React Dev Server" "http://localhost:3000" 3000
echo ""

# Check MongoDB Collections
echo "═══════════════════════════════════════════════════════════════"
echo "MongoDB Data"
echo "═══════════════════════════════════════════════════════════════"

get_collection_count() {
    local collection=$1
    mongosh --quiet --eval "db.climate_db.$collection.count()" 2>/dev/null | tail -1
}

echo "Collection Counts:"
echo "  • country_temps: $(get_collection_count 'country_temps') records"
echo "  • city_temps: $(get_collection_count 'city_temps') records"
echo "  • state_temps: $(get_collection_count 'state_temps') records"
echo "  • major_city_temps: $(get_collection_count 'major_city_temps') records"
echo ""

# Test API Endpoints
echo "═══════════════════════════════════════════════════════════════"
echo "API Endpoints"
echo "═══════════════════════════════════════════════════════════════"

echo -n "Testing /api/stats/summary... "
if response=$(curl -s -m 2 "http://localhost:5001/api/stats/summary" 2>/dev/null); then
    total=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('total_records', 'N/A'))" 2>/dev/null || echo "N/A")
    echo -e "${GREEN}✅ $total records${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "Testing /api/analytics/avg-temp-by-country... "
if response=$(curl -s -m 2 "http://localhost:5001/api/analytics/avg-temp-by-country" 2>/dev/null); then
    count=$(echo "$response" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ $count countries${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "Testing /api/analytics/seasonal-analysis... "
if response=$(curl -s -m 2 "http://localhost:5001/api/analytics/seasonal-analysis" 2>/dev/null); then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎯 Access Points"
echo "═══════════════════════════════════════════════════════════════"
echo "Frontend:      ${BLUE}http://localhost:3000${NC}"
echo "API:           ${BLUE}http://localhost:5001${NC}"
echo "API Docs:      ${BLUE}http://localhost:5001/docs${NC}"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✨ Health Check Complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
