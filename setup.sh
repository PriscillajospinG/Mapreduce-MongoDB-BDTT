#!/bin/bash

# Setup script for MapReduce MongoDB Climate Analysis Project
# This script automates the setup process

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║      MapReduce MongoDB Climate Analysis - Setup Script              ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if MongoDB is installed
echo "🔍 Checking MongoDB installation..."
if command -v mongosh &> /dev/null; then
    echo "✓ MongoDB CLI (mongosh) found"
    mongosh --version | head -n 1
else
    echo "✗ MongoDB CLI (mongosh) not found"
    echo ""
    echo "Please install MongoDB:"
    echo "  brew tap mongodb/brew"
    echo "  brew install mongodb-community"
    exit 1
fi

# Check if MongoDB is running
echo ""
echo "🔍 Checking if MongoDB is running..."
if mongosh --eval "db.version()" --quiet &> /dev/null; then
    echo "✓ MongoDB is running"
else
    echo "⚠ MongoDB is not running. Starting MongoDB..."
    brew services start mongodb-community
    sleep 3
    
    if mongosh --eval "db.version()" --quiet &> /dev/null; then
        echo "✓ MongoDB started successfully"
    else
        echo "✗ Failed to start MongoDB"
        echo "Please start MongoDB manually:"
        echo "  brew services start mongodb-community"
        exit 1
    fi
fi

# Check Python version
echo ""
echo "🔍 Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo "✓ Python found: $PYTHON_VERSION"
else
    echo "✗ Python 3 not found"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if virtual environment exists
echo ""
echo "🔍 Checking virtual environment..."
if [ -d "../venv" ]; then
    echo "✓ Virtual environment found"
else
    echo "⚠ Virtual environment not found"
    echo "Please create it first:"
    echo "  python3 -m venv venv"
    exit 1
fi

# Activate virtual environment and install dependencies
echo ""
echo "📦 Installing Python dependencies..."
source ../venv/bin/activate

pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

echo "✓ All dependencies installed"

# Check if datasets exist
echo ""
echo "🔍 Checking dataset files..."
DATASET_DIR="../Dataset"
DATASETS=(
    "GlobalLandTemperaturesByCountry.csv"
    "GlobalLandTemperaturesByCity.csv"
    "GlobalLandTemperaturesByMajorCity.csv"
    "GlobalLandTemperaturesByState.csv"
    "GlobalTemperatures.csv"
)

MISSING_DATASETS=()
for dataset in "${DATASETS[@]}"; do
    if [ -f "$DATASET_DIR/$dataset" ]; then
        echo "  ✓ $dataset"
    else
        echo "  ✗ $dataset (missing)"
        MISSING_DATASETS+=("$dataset")
    fi
done

if [ ${#MISSING_DATASETS[@]} -ne 0 ]; then
    echo ""
    echo "⚠ Warning: ${#MISSING_DATASETS[@]} dataset file(s) missing"
    echo "Please download them from Kaggle:"
    echo "https://www.kaggle.com/berkeleyearth/climate-change-earth-surface-temperature-data"
else
    echo ""
    echo "✓ All dataset files found"
fi

# Create output directories
echo ""
echo "📁 Creating output directories..."
mkdir -p output/reports
mkdir -p output/charts
echo "✓ Output directories created"

# Test MongoDB connection
echo ""
echo "🔗 Testing MongoDB connection..."
python utils.py check

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                    ✓ SETUP COMPLETE!                                ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Activate the virtual environment:"
echo "     source venv/bin/activate"
echo ""
echo "  2. Navigate to the backend folder:"
echo "     cd backend"
echo ""
echo "  3. Run the pipeline:"
echo "     python main.py"
echo ""
echo "For quick reference, see: backend/QUICKSTART.md"
echo ""
