#!/bin/bash

# 🌍 Climate Analysis Full Stack - Startup Script
# Starts MongoDB, loads data, runs FastAPI backend, and React frontend

set -e  # Exit on error

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Header
clear
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🌍 Climate Analysis - Full Stack Startup                  ║"
echo "║     MongoDB + FastAPI + React with MapReduce Analytics       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check MongoDB
log_info "Step 1/5: Checking MongoDB..."
if ! pgrep -q mongod; then
    log_warning "MongoDB not running"
    if command -v mongod &> /dev/null; then
        log_info "Starting MongoDB..."
        mongod --dbpath /usr/local/var/mongodb > /dev/null 2>&1 &
        sleep 2
        log_success "MongoDB started"
    elif command -v docker &> /dev/null; then
        log_warning "MongoDB not installed. Starting with Docker..."
        docker run -d -p 27017:27017 --name mongodb mongo > /dev/null 2>&1 || true
        sleep 3
        log_success "MongoDB started with Docker"
    else
        log_error "MongoDB not found and Docker not available"
        exit 1
    fi
else
    log_success "MongoDB is running"
fi

# Step 2: Load data into MongoDB
log_info "Step 2/5: Loading climate data into MongoDB..."
cd "$BACKEND_DIR"
python3 load_data_to_mongo.py > /dev/null 2>&1 || log_warning "Data load had issues (may already be loaded)"
log_success "Climate data ready"

# Step 3: Start FastAPI backend
log_info "Step 3/5: Starting FastAPI backend on port 5001..."
# Kill any existing process on port 5001
lsof -ti :5001 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

cd "$BACKEND_DIR"
python3 backend/api_server_fastapi.py > /tmp/fastapi.log 2>&1 &
BACKEND_PID=$!
sleep 2

if kill -0 $BACKEND_PID 2>/dev/null; then
    log_success "FastAPI backend started (PID: $BACKEND_PID)"
else
    log_error "Failed to start FastAPI backend"
    cat /tmp/fastapi.log
    exit 1
fi

# Step 4: Install frontend dependencies
log_info "Step 4/5: Preparing React frontend..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    log_info "Installing npm dependencies..."
    npm install --silent > /dev/null 2>&1
fi
log_success "Frontend dependencies ready"

# Step 5: Start React dev server
log_info "Step 5/5: Starting React frontend on port 3000..."
# Kill any existing process on port 3000
lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

if kill -0 $FRONTEND_PID 2>/dev/null; then
    log_success "React frontend started (PID: $FRONTEND_PID)"
else
    log_error "Failed to start React frontend"
    cat /tmp/frontend.log
    exit 1
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  🎉 System Started Successfully!              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}📊 Climate Analysis Stack is Running!${NC}"
echo ""
echo "🌐 Frontend:  ${BLUE}http://localhost:3000${NC}"
echo "🔌 API:       ${BLUE}http://localhost:5001${NC}"
echo "📚 API Docs:  ${BLUE}http://localhost:5001/docs${NC}"
echo "🗄️  MongoDB:   ${BLUE}mongodb://localhost:27017${NC}"
echo ""
echo "📊 Available Endpoints:"
echo "   • /api/health                           - Health check"
echo "   • /api/stats/summary                    - Summary statistics"
echo "   • /api/analytics/avg-temp-by-country    - Avg temp by country"
echo "   • /api/analytics/temp-trends-by-year    - Temperature trends"
echo "   • /api/analytics/seasonal-analysis      - Seasonal patterns"
echo "   • /api/analytics/extreme-temps          - Extreme temperatures"
echo "   • /api/analytics/decade-analysis        - Decade analysis"
echo "   • /api/analytics/records-by-country     - Records count"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for services
wait
