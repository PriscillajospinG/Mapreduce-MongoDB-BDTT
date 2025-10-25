# Mapreduce-MongoDB-BDTT

# MongoDB MapReduce Climate Analysis Project

A comprehensive Big Data project demonstrating **MongoDB** and **MapReduce** operations on a large climate dataset (50,000+ records).

## 🎯 Project Overview

This project analyzes global temperature data using MongoDB's MapReduce framework. It processes historical climate data from multiple datasets, performs data cleaning, executes various MapReduce operations, and generates insightful visualizations.

### Key Features

- ✅ **Large Dataset Processing**: Handles 50,000+ temperature records
- ✅ **MongoDB Integration**: Efficient data storage using PyMongo
- ✅ **Data Preprocessing**: Automated cleaning and validation
- ✅ **MapReduce Operations**: 6 different analytical operations
- ✅ **Data Visualization**: Interactive and static charts
- ✅ **Modular Architecture**: Clean, reusable code structure

---

## 📁 Project Structure

```
backend/
├── main.py                          # Main orchestrator script
├── config.py                        # Configuration settings
├── requirements.txt                 # Python dependencies
├── scripts/
│   ├── upload_dataset.py           # Dataset upload to MongoDB
│   ├── preprocess_data.py          # Data cleaning & preprocessing
│   ├── mapreduce_operations.py     # MapReduce analysis operations
│   └── visualize_data.py           # Data visualization
└── output/                          # Generated outputs
    ├── reports/                     # JSON results from MapReduce
    └── charts/                      # PNG and HTML visualizations
```

---

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** installed
2. **MongoDB** installed and running locally
   ```bash
   # Install MongoDB (macOS)
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB service
   brew services start mongodb-community
   ```

3. **Dataset files** in the `Dataset/` folder:
   - `GlobalLandTemperaturesByCountry.csv`
   - `GlobalLandTemperaturesByCity.csv`
   - `GlobalLandTemperaturesByMajorCity.csv`
   - `GlobalLandTemperaturesByState.csv`
   - `GlobalTemperatures.csv`

### Installation

1. **Activate the virtual environment:**
   ```bash
   source ../venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify MongoDB is running:**
   ```bash
   mongosh --eval "db.version()"
   ```

---

## 🎮 Usage

### Run the Full Pipeline

Execute all steps automatically (Upload → Preprocess → MapReduce → Visualize):

```bash
python main.py
```

### Run Individual Steps

**Upload datasets only:**
```bash
python main.py --step upload
```

**Preprocess data only:**
```bash
python main.py --step preprocess
```

**Run MapReduce operations only:**
```bash
python main.py --step mapreduce
```

**Generate visualizations only:**
```bash
python main.py --step visualize
```

### Run Scripts Directly

```bash
# Upload datasets
python scripts/upload_dataset.py

# Preprocess data
python scripts/preprocess_data.py

# Run MapReduce
python scripts/mapreduce_operations.py

# Create visualizations
python scripts/visualize_data.py
```

---

## 📊 Pipeline Steps Explained

### 1. **Upload Datasets** (`upload_dataset.py`)
- Reads CSV files from the `Dataset/` folder
- Removes records with missing temperature values
- Converts dates to MongoDB-friendly format
- Inserts data into MongoDB collections in batches
- Creates indexes for optimized queries
- **Output**: Data stored in MongoDB `climate_db` database

### 2. **Preprocess & Clean Data** (`preprocess_data.py`)
- Removes invalid temperature records (< -100°C)
- Extracts year and month fields from date strings
- Filters records to valid date ranges (1850-2015)
- Removes duplicate entries
- Marks all records as preprocessed
- **Output**: Cleaned data ready for analysis

### 3. **MapReduce Operations** (`mapreduce_operations.py`)

Executes 6 different MapReduce operations:

| Operation | Description | Output |
|-----------|-------------|--------|
| **Avg Temp by Country** | Calculate average, min, max temperature per country | `avg_temp_by_country.json` |
| **Temperature Trend** | Global temperature trend by year | `temp_trend_by_year.json` |
| **Seasonal Analysis** | Average temperature by season | `seasonal_temps.json` |
| **City Rankings** | Warmest and coldest major cities | `city_temp_ranking_*.json` |
| **Record Count** | Number of temperature records per country | `records_by_country.json` |
| **Decade Analysis** | Temperature changes by decade | `decade_analysis.json` |

**All results saved to**: `output/reports/`

### 4. **Generate Visualizations** (`visualize_data.py`)

Creates both static (PNG) and interactive (HTML) visualizations:

- 📊 **Bar charts**: Country temperature rankings
- 📈 **Line charts**: Temperature trends over time
- 🥧 **Pie charts**: Seasonal distribution
- 📉 **Area charts**: Decade-wise analysis
- 🌍 **Comparative charts**: City rankings

**All charts saved to**: `output/charts/`

---

## 📈 MapReduce Examples

### Example 1: Average Temperature by Country

**Map Function:**
```javascript
function() {
    if (this.Country && this.AverageTemperature) {
        emit(this.Country, {
            sum: this.AverageTemperature,
            count: 1,
            min: this.AverageTemperature,
            max: this.AverageTemperature
        });
    }
}
```

**Reduce Function:**
```javascript
function(key, values) {
    var result = {sum: 0, count: 0, min: Infinity, max: -Infinity};
    values.forEach(function(value) {
        result.sum += value.sum;
        result.count += value.count;
        result.min = Math.min(result.min, value.min);
        result.max = Math.max(result.max, value.max);
    });
    return result;
}
```

**Finalize Function:**
```javascript
function(key, reducedValue) {
    reducedValue.average = reducedValue.sum / reducedValue.count;
    return reducedValue;
}
```

---

## 🔧 Configuration

Edit `config.py` to customize:

```python
# MongoDB settings
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "climate_db"

# Data filtering
MIN_YEAR = 1850
MAX_YEAR = 2015
TEMPERATURE_THRESHOLD = -100  # Minimum valid temperature

# Output directories
OUTPUT_DIR = "output"
```

---

## 📦 Key Dependencies

- **pymongo**: MongoDB driver for Python
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical operations
- **matplotlib**: Static visualizations
- **seaborn**: Statistical data visualization
- **plotly**: Interactive visualizations
- **tqdm**: Progress bars

---

## 🎯 Sample Output

### Console Output Example

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║         MAPREDUCE MONGODB CLIMATE ANALYSIS PROJECT                  ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

STEP 1: Upload Datasets to MongoDB
✓ Loaded 577,462 records from CSV
✓ Successfully inserted 577,462 records into 'country_temps'

STEP 2: Preprocess & Clean Data
✓ Removed 0 records with temperature < -100°C
✓ Added year/month fields to 577,462 records
✓ Removed 0 records with invalid dates

STEP 3: Execute MapReduce Operations
✓ MapReduce #1: Average Temperature by Country
✓ MapReduce #2: Global Temperature Trend by Year
✓ MapReduce #3: Average Temperature by Season
...

🎉 PIPELINE COMPLETED SUCCESSFULLY! 🎉
```

### Generated Files

**Reports (JSON):**
- `output/reports/avg_temp_by_country.json`
- `output/reports/temp_trend_by_year.json`
- `output/reports/seasonal_temps.json`
- `output/reports/city_temp_ranking_warmest.json`
- `output/reports/city_temp_ranking_coldest.json`
- `output/reports/records_by_country.json`
- `output/reports/decade_analysis.json`
- `output/reports/summary_statistics.json`

**Charts:**
- `output/charts/avg_temp_by_country.png`
- `output/charts/avg_temp_by_country_interactive.html`
- `output/charts/temp_trend_by_year.png`
- `output/charts/temp_trend_by_year_interactive.html`
- `output/charts/seasonal_temps.png`
- `output/charts/seasonal_temps_interactive.html`
- `output/charts/city_rankings.png`
- `output/charts/decade_analysis.png`
- `output/charts/decade_analysis_interactive.html`

---

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community

# Check connection
mongosh
```

### Import Errors

```bash
# Ensure virtual environment is activated
source ../venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Memory Issues with Large Datasets

If you encounter memory errors, modify the batch size in `upload_dataset.py`:

```python
# Reduce batch size from 5000 to 1000
self.upload_dataset(dataset_type, file_path, collection_name, batch_size=1000)
```

---

## 📚 Learning Outcomes

This project demonstrates:

1. ✅ **MongoDB CRUD Operations**: Insert, update, delete, query
2. ✅ **MapReduce Framework**: Map, Reduce, Finalize functions
3. ✅ **Data Preprocessing**: Cleaning, validation, normalization
4. ✅ **Aggregation Pipeline**: Alternative to MapReduce
5. ✅ **Data Visualization**: Static and interactive charts
6. ✅ **Python Best Practices**: Modular code, error handling, logging

---

## 👥 Authors

**Big Data Technologies Project**  
MongoDB & MapReduce Climate Analysis

---

## 📄 License

This project is for educational purposes.

Dataset Source: [Kaggle Climate Change: Earth Surface Temperature Data](https://www.kaggle.com/berkeleyearth/climate-change-earth-surface-temperature-data)

---

## 🌟 Future Enhancements

- [ ] Add more MapReduce operations (correlation analysis)
- [ ] Implement real-time data streaming
- [ ] Add web dashboard using Flask/Django
- [ ] Deploy to cloud (MongoDB Atlas)
- [ ] Add machine learning predictions
- [ ] Implement sharding for horizontal scaling

---

**Happy Analyzing! 🚀**
