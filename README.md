# Mapreduce-MongoDB-BDTT

# MongoDB MapReduce Climate Analysis Project

A comprehensive Big Data project demonstrating **MongoDB MapReduce** operations on a large climate dataset (10M+ records from Kaggle).

## 🎯 Project Overview

This project analyzes global temperature data using MongoDB's native MapReduce framework. It processes historical climate data from multiple datasets, performs data cleaning using Python, executes MapReduce operations in MongoDB shell, and generates insightful visualizations.

### Key Features

- ✅ **Large Dataset Processing**: 10,064,723 temperature records across 5 datasets
- ✅ **MongoDB Integration**: Efficient data storage using PyMongo
- ✅ **Data Preprocessing**: Automated cleaning and validation with Python
- ✅ **Native MapReduce**: 6 MapReduce operations executed in MongoDB shell (JavaScript)
- ✅ **Data Visualization**: Interactive (Plotly) and static (Matplotlib) charts
- ✅ **Modular Architecture**: Clean separation between data processing and MapReduce
- ✅ **Interactive Upload**: Choose specific datasets or upload all at once

---

## 📁 Project Structure

```
Mapreduce-MongoDB-BDTT/
├── Dataset/                                    # Kaggle climate datasets (10M+ records)
│   ├── GlobalLandTemperaturesByCountry.csv    # 577K records
│   ├── GlobalLandTemperaturesByCity.csv       # 8.6M records
│   ├── GlobalLandTemperaturesByMajorCity.csv  # 239K records
│   ├── GlobalLandTemperaturesByState.csv      # 645K records
│   └── GlobalTemperatures.csv                 # 3K records
│
├── backend/
│   ├── scripts/
│   │   ├── upload_dataset.py          # Upload datasets to MongoDB (Python + PyMongo)
│   │   ├── preprocess_data.py         # Data cleaning & preprocessing (Python)
│   │   ├── mapreduce_operations.py    # Fetch MapReduce results (Python)
│   │   └── visualize_data.py          # Generate charts (Python)
│   │
│   ├── mongo_scripts/                 # MapReduce operations (MongoDB Shell)
│   │   ├── 1_avg_temp_by_country.js   # Average temperature by country
│   │   ├── 2_temp_trends_by_year.js   # Temperature trends by year
│   │   ├── 3_seasonal_analysis.js     # Seasonal temperature patterns
│   │   ├── 4_extreme_temps.js         # Extreme temperature records
│   │   ├── 5_decade_analysis.js       # Temperature analysis by decade
│   │   ├── 6_records_by_country.js    # Record count by country
│   │   ├── run_all.js                 # Execute all MapReduce operations
│   │   └── README.md                  # MapReduce documentation
│   │
│   ├── config.py                      # Configuration settings
│   ├── utils.py                       # Database utilities
│   ├── main.py                        # Pipeline orchestrator
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment variables template
│   ├── GETTING_STARTED.md             # Quick start guide
│   ├── QUICK_START.md                 # One-page reference
│   └── REQUIREMENTS_CHECKLIST.md      # Project verification
│
├── venv/                              # Python virtual environment
├── HOW_TO_RUN.md                      # Detailed execution guide
└── README.md                          # This file
```

---

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** installed
   ```bash
   python3 --version
   ```

2. **MongoDB 4.4+** installed and running
   ```bash
   # Install MongoDB (macOS)
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB service
   brew services start mongodb-community
   
   # Verify MongoDB is running
   mongosh --version
   ```

3. **Dataset files** already in the `Dataset/` folder ✓
   - Total records: **10,064,723**
   - Format: CSV (semi-structured data)

### Installation & Setup

```bash
# 1. Navigate to project directory
cd /Users/priscillajosping/Downloads/Mapreduce-MongoDB-BDTT

# 2. Activate virtual environment
source venv/bin/activate

# 3. Navigate to backend
cd backend

# 4. Install Python dependencies
pip install -r requirements.txt
```

---

## 🎮 Usage

### Method 1: Step-by-Step Execution (Recommended)

**Step 1: Upload Dataset (Interactive Menu)**
```bash
python scripts/upload_dataset.py
```
- Choose which dataset to upload (1-5) or upload all (6)
- Batch processing with progress bars
- ~5-10 minutes for single dataset

**Step 2: Preprocess Data**
```bash
python scripts/preprocess_data.py
```
- Removes missing values
- Validates temperature ranges
- Extracts year/month fields
- ~3-5 minutes

**Step 3: Run MapReduce Operations** ⭐ **IMPORTANT**
```bash
cd mongo_scripts
mongosh < run_all.js
```
- Executes 6 MapReduce operations in MongoDB shell
- Native JavaScript MapReduce (Map/Reduce/Finalize)
- ~10-15 minutes
- Creates 6 output collections

**Step 4: Fetch Results (Optional)**
```bash
cd ..
python scripts/mapreduce_operations.py
```
- Fetches MapReduce results from MongoDB
- Exports to JSON files
- ~1 minute

**Step 5: Visualize (Optional)**
```bash
python scripts/visualize_data.py
```
- Generates PNG and HTML charts
- ~2 minutes

---

### Method 2: Run All Steps with One Command

```bash
# From backend folder
python scripts/upload_dataset.py && \
python scripts/preprocess_data.py && \
cd mongo_scripts && mongosh < run_all.js && cd .. && \
python scripts/mapreduce_operations.py && \
python scripts/visualize_data.py
```

**Total Time: ~30-40 minutes**

---

## 📊 Pipeline Steps Explained

### 1. **Upload Datasets** (`upload_dataset.py`)
**Technology:** Python + PyMongo
- Interactive menu to choose dataset(s)
- Reads CSV files from the `Dataset/` folder
- Removes records with missing temperature values
- Converts dates to MongoDB-friendly format
- Batch insertion (5000 records/batch) with progress bars
- Creates indexes for optimized queries
- **Output**: Data stored in MongoDB `climate_db` database

**Collections Created:**
- `country_temps` - Country temperature records
- `city_temps` - City temperature records
- `major_city_temps` - Major city records
- `state_temps` - State temperature records
- `global_temps` - Global temperature records

---

### 2. **Preprocess & Clean Data** (`preprocess_data.py`)
**Technology:** Python + PyMongo
- Removes invalid temperature records (< -100°C)
- Extracts `year` and `month` fields from date strings
- Validates date ranges (configurable in `config.py`)
- Removes duplicate entries using aggregation pipeline
- Bulk updates with progress tracking
- **Output**: Cleaned data ready for MapReduce analysis

---

### 3. **MapReduce Operations** (MongoDB Shell - JavaScript)
**Technology:** MongoDB Native MapReduce (mongosh)

**⚠️ IMPORTANT:** MapReduce runs in MongoDB shell, NOT Python!

#### Six MapReduce Operations:

| Script | Operation | Description | Output Collection |
|--------|-----------|-------------|-------------------|
| `1_avg_temp_by_country.js` | **Averaging** | Avg/min/max temperature per country | `avg_temp_by_country` |
| `2_temp_trends_by_year.js` | **Grouping** | Temperature trends by year | `temp_trends_by_year` |
| `3_seasonal_analysis.js` | **Grouping** | Seasonal patterns (Winter/Spring/Summer/Fall) | `seasonal_analysis` |
| `4_extreme_temps.js` | **Min/Max** | Extreme temperature records | `extreme_temps` |
| `5_decade_analysis.js` | **Grouping** | Temperature by decade | `decade_analysis` |
| `6_records_by_country.js` | **Counting** | Record count per country | `records_by_country` |

**Execution:**
```bash
cd mongo_scripts
mongosh < run_all.js  # Runs all 6 operations
# OR
mongosh < 1_avg_temp_by_country.js  # Run individually
```

**Output**: 6 new MongoDB collections with aggregated results

---

### 4. **Fetch Results** (`mapreduce_operations.py`)
**Technology:** Python + PyMongo
- Fetches MapReduce results from MongoDB collections
- Exports to JSON files for further analysis
- **Output**: JSON files in `output/mapreduce_results/`

---

### 5. **Generate Visualizations** (`visualize_data.py`)
**Technology:** Python + Matplotlib + Plotly

Creates both static (PNG) and interactive (HTML) visualizations:

- 📊 **Bar charts**: Temperature rankings by country
- 📈 **Line charts**: Temperature trends over time
- 🔄 **Seasonal charts**: Seasonal distribution patterns
- 📉 **Area charts**: Decade-wise analysis
- �️ **Extreme charts**: Hottest and coldest records

**Output**: Charts saved to `output/visualizations/`
- Static: `*.png` files
- Interactive: `*.html` files (open in browser)

---

## 📈 MapReduce Examples

### Example 1: Average Temperature by Country

**File:** `mongo_scripts/1_avg_temp_by_country.js`

**Map Function:**
```javascript
var mapFunction = function() {
    if (this.AverageTemperature && this.Country) {
        emit(this.Country, {
            sum: parseFloat(this.AverageTemperature),
            count: 1,
            min: parseFloat(this.AverageTemperature),
            max: parseFloat(this.AverageTemperature)
        });
    }
};
```

**Reduce Function:**
```javascript
var reduceFunction = function(key, values) {
    var result = {
        sum: 0,
        count: 0,
        min: Infinity,
        max: -Infinity
    };
    
    values.forEach(function(value) {
        result.sum += value.sum;
        result.count += value.count;
        result.min = Math.min(result.min, value.min);
        result.max = Math.max(result.max, value.max);
    });
    
    return result;
};
```

**Finalize Function:**
```javascript
var finalizeFunction = function(key, reducedValue) {
    reducedValue.average = reducedValue.sum / reducedValue.count;
    return reducedValue;
};
```

**Execution:**
```javascript
db.country_temps.mapReduce(
    mapFunction,
    reduceFunction,
    {
        out: "avg_temp_by_country",
        finalize: finalizeFunction
    }
);
```

**Sample Output:**
```javascript
{
    _id: "India",
    value: {
        sum: 6234567.89,
        count: 245678,
        min: 8.45,
        max: 35.67,
        average: 25.38
    }
}
```

---

## 🔧 Configuration

Edit `backend/config.py` to customize:

```python
# MongoDB settings
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "climate_db"

# Collections
COLLECTIONS = {
    'country': 'country_temps',
    'city': 'city_temps',
    'major_city': 'major_city_temps',
    'state': 'state_temps',
    'global': 'global_temps'
}

# Dataset paths
DATASET_PATHS = {
    'country': '../Dataset/GlobalLandTemperaturesByCountry.csv',
    'city': '../Dataset/GlobalLandTemperaturesByCity.csv',
    'major_city': '../Dataset/GlobalLandTemperaturesByMajorCity.csv',
    'state': '../Dataset/GlobalLandTemperaturesByState.csv',
    'global': '../Dataset/GlobalTemperatures.csv'
}

# Data filtering
MIN_YEAR = 1750
MAX_YEAR = 2025
TEMPERATURE_THRESHOLD = -100  # Minimum valid temperature (°C)

# Output directories
OUTPUT_DIR = "output"
MAPREDUCE_RESULTS_DIR = "output/mapreduce_results"
VISUALIZATIONS_DIR = "output/visualizations"
```

**Environment Variables** (optional):
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
# Edit .env with your settings
```

---

## 📦 Key Dependencies

**Python Libraries:**
- **pymongo 4.6.1**: MongoDB driver for Python (data upload/fetch)
- **pandas 2.1.4**: Data manipulation and CSV processing
- **numpy 1.26.3**: Numerical operations
- **matplotlib 3.8.2**: Static visualizations (PNG charts)
- **seaborn 0.13.1**: Statistical data visualization
- **plotly 5.18.0**: Interactive visualizations (HTML charts)
- **tqdm 4.66.1**: Progress bars for batch operations
- **python-dotenv 1.0.0**: Environment variable management

**MongoDB:**
- **MongoDB 4.4+**: NoSQL database with MapReduce support
- **MongoDB Shell (mongosh)**: JavaScript execution environment for MapReduce

**Complete list:** See `backend/requirements.txt`

---

## 🎯 Sample Output

### Step 1: Upload Dataset (Console Output)

```bash
✓ Connected to MongoDB: climate_db

============================================================
SELECT DATASET TO UPLOAD
============================================================

Available datasets:
  1. country
  2. city
  3. major_city
  4. state
  5. global
  6. Upload ALL datasets

Enter your choice (1-6): 1

============================================================
Uploading COUNTRY dataset...
============================================================
Reading CSV file: ../Dataset/GlobalLandTemperaturesByCountry.csv
✓ Loaded 577,462 records from CSV
✓ Removed 32,651 records with missing temperatures
✓ Cleared existing data in collection 'country_temps'
Inserting 544,811 records into MongoDB...
Progress: 100%|████████████████████████| 109/109 [00:03<00:00, 35.82it/s]
✓ Successfully inserted 544,811 records into 'country_temps'
✓ Created indexes for optimized queries

✓ Dataset 'country' uploaded successfully!
✓ MongoDB connection closed
```

### Step 3: MapReduce Execution (Console Output)

```bash
$ cd mongo_scripts
$ mongosh < run_all.js

======================================================================
MONGODB MAPREDUCE - CLIMATE ANALYSIS PROJECT
======================================================================

============================================================
MapReduce #1: Average Temperature by Country
============================================================
✓ MapReduce completed
Results saved in collection: avg_temp_by_country
Total countries: 243

Top 5 warmest countries:
  Djibouti: 28.34°C
  Burkina Faso: 28.12°C
  Mali: 28.09°C
  Mauritania: 27.98°C
  Senegal: 27.85°C

============================================================
MapReduce #2: Temperature Trends by Year
============================================================
✓ MapReduce completed
Results saved in collection: temp_trends_by_year
Total years: 266

...

======================================================================
ALL MAPREDUCE OPERATIONS COMPLETED SUCCESSFULLY
======================================================================
```

### Generated Files

**MongoDB Collections (after MapReduce):**
- `avg_temp_by_country` - 243 countries with statistics
- `temp_trends_by_year` - 266 years of data
- `seasonal_analysis` - 4 seasons (Winter, Spring, Summer, Fall)
- `extreme_temps` - Hottest & coldest records
- `decade_analysis` - Temperature by decade (1750s-2010s)
- `records_by_country` - Record counts per country

**JSON Export Files** (optional):
- `output/mapreduce_results/avg_temp_by_country.json`
- `output/mapreduce_results/temp_trends_by_year.json`
- `output/mapreduce_results/seasonal_analysis.json`
- `output/mapreduce_results/extreme_temps.json`
- `output/mapreduce_results/decade_analysis.json`
- `output/mapreduce_results/records_by_country.json`

**Visualization Files** (optional):
- `output/visualizations/avg_temp_by_country.png`
- `output/visualizations/avg_temp_by_country.html` (interactive)
- `output/visualizations/temp_trends_by_year.png`
- `output/visualizations/temp_trends_by_year.html` (interactive)
- `output/visualizations/seasonal_analysis.png`
- `output/visualizations/extreme_temps.png`
- `output/visualizations/decade_analysis.png`
```

---

## 🐛 Troubleshooting

### ❌ MongoDB Connection Error

**Error:** `ServerSelectionTimeoutError` or `Connection refused`

**Solution:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community

# Verify connection
mongosh --eval "db.version()"

# Check if MongoDB is listening
lsof -i :27017
```

---

### ❌ "use climate_db" Error in MongoDB Shell

**Error:** `SyntaxError: Missing semicolon` when running MapReduce scripts

**Solution:** Already fixed! All scripts now use `db.getSiblingDB('climate_db')`

---

### ❌ Python Import Errors

**Error:** `ModuleNotFoundError: No module named 'pymongo'`

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Verify you're in the right directory
pwd  # Should show: .../Mapreduce-MongoDB-BDTT/backend

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

### ❌ Dataset File Not Found

**Error:** `File not found: ../Dataset/GlobalLandTemperaturesByCountry.csv`

**Solution:**
```bash
# Verify dataset files exist
ls -lh ../Dataset/

# Should show all 5 CSV files
# If missing, download from Kaggle:
# https://www.kaggle.com/berkeleyearth/climate-change-earth-surface-temperature-data
```

---

### ❌ Memory Issues with Large Datasets

**Error:** `MemoryError` when uploading city dataset (8.6M records)

**Solution:**
Reduce batch size in upload script:
```python
# In upload_dataset.py, modify:
self.upload_dataset(dataset_type, abs_path, collection_name, batch_size=1000)
# Default is 5000, reduce to 1000 or 500
```

---

### ❌ MapReduce Takes Too Long

**Issue:** MapReduce operations running for hours

**Solution:**
- Start with smaller datasets (country, global) first
- Create indexes before MapReduce:
  ```javascript
  db.country_temps.createIndex({ Country: 1 })
  db.country_temps.createIndex({ dt: 1 })
  db.country_temps.createIndex({ year: 1 })
  ```
- Use only one dataset instead of all 5

---

## 📚 Learning Outcomes

This project demonstrates:

1. ✅ **MongoDB CRUD Operations**: Insert, update, delete, query using PyMongo
2. ✅ **Native MapReduce Framework**: Map, Reduce, Finalize functions in JavaScript
3. ✅ **Data Preprocessing**: Cleaning, validation, deduplication, field extraction
4. ✅ **Big Data Processing**: Handling 10M+ records efficiently
5. ✅ **Batch Processing**: Memory-efficient data uploads with progress tracking
6. ✅ **Data Visualization**: Static (Matplotlib) and interactive (Plotly) charts
7. ✅ **Python Best Practices**: Modular architecture, error handling, configuration management
8. ✅ **MongoDB Shell Scripting**: Automating MapReduce operations with JavaScript
9. ✅ **ETL Pipeline**: Extract (CSV) → Transform (Python) → Load (MongoDB) → Analyze (MapReduce)

---

## � Documentation

- **`HOW_TO_RUN.md`** - Comprehensive step-by-step execution guide with troubleshooting
- **`backend/QUICK_START.md`** - One-page quick reference for running the project
- **`backend/GETTING_STARTED.md`** - Setup and installation instructions
- **`backend/REQUIREMENTS_CHECKLIST.md`** - Verification that all requirements are met
- **`backend/mongo_scripts/README.md`** - Detailed MapReduce operations documentation

---

## �👥 Authors

**Big Data Technologies Project**  
MongoDB & MapReduce Climate Analysis  
**Course:** Big Data Technologies and Tools (BDTT)

---

## 📄 License

This project is for educational purposes.

**Dataset Source:**  
[Kaggle - Climate Change: Earth Surface Temperature Data](https://www.kaggle.com/berkeleyearth/climate-change-earth-surface-temperature-data)
- **Records:** 10,064,723
- **Format:** CSV (semi-structured)
- **Time Range:** 1750 - 2015
- **License:** CC0 Public Domain

---

## � Project Requirements Met

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 1. Large Dataset (50K+ records) | ✅ **EXCEEDED** | 10,064,723 records (200x more!) |
| 2. Store in MongoDB (Python + PyMongo) | ✅ **SATISFIED** | `upload_dataset.py` with batch processing |
| 3. Preprocess & Clean Data | ✅ **SATISFIED** | `preprocess_data.py` with 5 cleaning operations |
| 4. Run MapReduce in MongoDB | ✅ **SATISFIED** | 6 MapReduce scripts in `mongo_scripts/` |

**All Requirements: 100% SATISFIED** ✅

See `backend/REQUIREMENTS_CHECKLIST.md` for detailed verification.

---

## �🌟 Future Enhancements

- [ ] Add more MapReduce operations (correlation analysis, anomaly detection)
- [ ] Implement MongoDB aggregation pipeline as alternative to MapReduce
- [ ] Add web dashboard using Flask/Streamlit for interactive analysis
- [ ] Deploy to cloud (MongoDB Atlas + Heroku/AWS)
- [ ] Add machine learning predictions (temperature forecasting)
- [ ] Implement sharding for horizontal scaling (handle billions of records)
- [ ] Add real-time data ingestion from weather APIs
- [ ] Create Docker containerization for easy deployment

---

## 🚀 Quick Links

- **📘 Detailed Guide:** See `HOW_TO_RUN.md`
- **⚡ Quick Start:** See `backend/QUICK_START.md`
- **✅ Verification:** See `backend/REQUIREMENTS_CHECKLIST.md`
- **🗺️ MapReduce Docs:** See `backend/mongo_scripts/README.md`

---

**Happy Analyzing! 🌍📊🚀**
