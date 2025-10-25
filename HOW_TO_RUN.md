# 🚀 How to Run This Project

## Prerequisites

1. **MongoDB installed and running**
   ```bash
   # Check if MongoDB is installed
   mongosh --version
   
   # If not installed (macOS):
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb-community
   ```

2. **Python 3.8+ installed**
   ```bash
   python3 --version
   ```

---

## Step-by-Step Execution

### Step 1: Setup Virtual Environment

```bash
# Navigate to project root
cd /Users/priscillajosping/Downloads/Mapreduce-MongoDB-BDTT

# Create virtual environment (if not exists)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
# Navigate to backend folder
cd backend

# Install Python packages
pip install -r requirements.txt
```

### Step 3: Upload Data to MongoDB

```bash
# Upload all CSV datasets to MongoDB
python scripts/upload_dataset.py
```

**Expected Output:**
```
✓ Connected to MongoDB: climate_db
============================================================
Uploading COUNTRY dataset...
============================================================
Reading CSV file: ../Dataset/GlobalLandTemperaturesByCountry.csv
✓ Loaded 577,463 records from CSV
...
```

**Time:** ~5-10 minutes (depending on dataset size)

---

### Step 4: Preprocess Data

```bash
# Clean and validate data
python scripts/preprocess_data.py
```

**Expected Output:**
```
✓ Connected to MongoDB: climate_db
============================================================
Preprocessing collection: country_temps
============================================================
Initial record count: 577,463
1. Removing invalid temperature records...
2. Extracting year and month fields...
...
```

**Time:** ~3-5 minutes

---

### Step 5: Run MapReduce Operations

```bash
# Navigate to mongo_scripts folder
cd mongo_scripts

# Run all MapReduce operations
mongosh < run_all.js
```

**Expected Output:**
```
======================================================================
MONGODB MAPREDUCE - CLIMATE ANALYSIS PROJECT
======================================================================

============================================================
MapReduce #1: Average Temperature by Country
============================================================
✓ MapReduce completed
Results saved in collection: avg_temp_by_country
Total countries: 243
...
```

**Time:** ~10-15 minutes (processing millions of records)

---

### Step 6: Fetch Results (Optional)

```bash
# Navigate back to backend
cd ..

# Fetch MapReduce results to JSON files
python scripts/mapreduce_operations.py
```

**Output:** JSON files in `output/mapreduce_results/`

---

### Step 7: Visualize Data (Optional)

```bash
# Generate charts
python scripts/visualize_data.py
```

**Output:** Charts in `output/visualizations/`
- PNG files (static charts)
- HTML files (interactive charts)

---

## Quick Run (All Steps)

```bash
# From project root
cd /Users/priscillajosping/Downloads/Mapreduce-MongoDB-BDTT

# Activate virtual environment
source venv/bin/activate

# Go to backend
cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Upload data
python scripts/upload_dataset.py

# Preprocess
python scripts/preprocess_data.py

# Run MapReduce
cd mongo_scripts
mongosh < run_all.js

# Fetch results
cd ..
python scripts/mapreduce_operations.py

# Visualize
python scripts/visualize_data.py
```

---

## Alternative: Run Using Main Pipeline

```bash
# From backend folder
cd backend

# Run complete pipeline (interactive)
python main.py
```

This will guide you through each step interactively.

---

## Verify Results

### Check MongoDB Collections

```bash
mongosh
```

```javascript
// Switch to database
use climate_db

// List all collections
show collections

// View sample results
db.avg_temp_by_country.find().limit(5)
db.temp_trends_by_year.find().limit(5)
db.seasonal_analysis.find().limit(5)
```

### Check Output Files

```bash
# View generated JSON files
ls -lh output/mapreduce_results/

# View generated charts
ls -lh output/visualizations/

# Open interactive chart in browser
open output/visualizations/temp_trends_by_year.html
```

---

## Troubleshooting

### MongoDB Not Running
```bash
# Start MongoDB
brew services start mongodb-community

# Check status
brew services list | grep mongodb
```

### Connection Error
```bash
# Check MongoDB is listening on default port
lsof -i :27017
```

### Import Errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Dataset Not Found
```bash
# Verify datasets exist
ls -lh ../Dataset/

# Should show:
# GlobalLandTemperaturesByCity.csv
# GlobalLandTemperaturesByCountry.csv
# etc.
```

---

## Expected Timeline

| Step | Description | Time |
|------|-------------|------|
| 1 | Setup environment | 2 min |
| 2 | Install dependencies | 3 min |
| 3 | Upload data | 5-10 min |
| 4 | Preprocess | 3-5 min |
| 5 | **MapReduce** | **10-15 min** |
| 6 | Fetch results | 1 min |
| 7 | Visualize | 2 min |
| **Total** | | **~30-40 min** |

---

## What You'll Get

After successful execution:

1. ✅ **MongoDB Collections:**
   - `country_temps`, `city_temps`, `state_temps`, etc. (raw data)
   - `avg_temp_by_country` (MapReduce output)
   - `temp_trends_by_year` (MapReduce output)
   - `seasonal_analysis` (MapReduce output)
   - `extreme_temps` (MapReduce output)
   - `decade_analysis` (MapReduce output)
   - `records_by_country` (MapReduce output)

2. ✅ **JSON Results:**
   - `output/mapreduce_results/avg_temp_by_country.json`
   - `output/mapreduce_results/temp_trends_by_year.json`
   - etc.

3. ✅ **Visualizations:**
   - `output/visualizations/avg_temp_by_country.png`
   - `output/visualizations/temp_trends_by_year.html`
   - etc.

---

## Need Help?

- Check `GETTING_STARTED.md` for detailed setup
- Check `REQUIREMENTS_CHECKLIST.md` for verification
- Check `mongo_scripts/README.md` for MapReduce details

**You're all set!** 🎉
