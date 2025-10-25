# MongoDB Shell MapReduce Scripts

This folder contains MongoDB shell scripts for running MapReduce operations on climate data.

## 📋 MapReduce Scripts

| Script | Description | Output Collection |
|--------|-------------|-------------------|
| `1_avg_temp_by_country.js` | Average temperatures by country | `avg_temp_by_country` |
| `2_temp_trends_by_year.js` | Temperature trends by year | `temp_trends_by_year` |
| `3_seasonal_analysis.js` | Seasonal temperature patterns | `seasonal_analysis` |
| `4_extreme_temps.js` | Extreme temperature records | `extreme_temps` |
| `5_decade_analysis.js` | Temperature by decade | `decade_analysis` |
| `6_records_by_country.js` | Record count by country | `records_by_country` |
| `run_all.js` | **Run all scripts at once** | All collections |

## 🚀 How to Run

### Run All MapReduce Operations

```bash
# From the mongo_scripts folder
mongosh < run_all.js
```

### Run Individual Scripts

```bash
mongosh < 1_avg_temp_by_country.js
mongosh < 2_temp_trends_by_year.js
mongosh < 3_seasonal_analysis.js
mongosh < 4_extreme_temps.js
mongosh < 5_decade_analysis.js
mongosh < 6_records_by_country.js
```

### Run from MongoDB Shell

```bash
# Start mongo shell
mongosh

# Switch to database
use climate_db

# Load and run script
load("1_avg_temp_by_country.js")
```

## 📊 After Running MapReduce

Fetch results in Python:

```bash
cd ..
python scripts/mapreduce_operations.py
```

This will:
1. ✅ Display results in console
2. ✅ Save results to JSON files in `output/reports/`
3. ✅ Generate a summary report

## 📁 Output Collections

All MapReduce operations create output collections in the `climate_db` database:

- `avg_temp_by_country` - Average, min, max temperatures per country
- `temp_trends_by_year` - Yearly temperature trends with ranges
- `seasonal_analysis` - Temperature by season (Spring, Summer, Autumn, Winter)
- `extreme_temps` - Hottest and coldest records per country
- `decade_analysis` - Temperature trends by decade
- `records_by_country` - Number of records per country

## 🔍 View Results in MongoDB Shell

```javascript
// Count results
db.avg_temp_by_country.countDocuments()

// View all results
db.avg_temp_by_country.find().pretty()

// Sort by average temperature (warmest first)
db.avg_temp_by_country.find().sort({"value.average": -1}).limit(10)

// Sort by average temperature (coldest first)
db.avg_temp_by_country.find().sort({"value.average": 1}).limit(10)
```

## ⚙️ Prerequisites

- MongoDB must be running
- Database `climate_db` must exist
- Collection `country_temps` must have data

Verify setup:

```bash
mongosh
> use climate_db
> db.country_temps.countDocuments()
```

## 📝 MapReduce Pattern

Each script follows this pattern:

```javascript
// Map function - emit key-value pairs
var mapFunction = function() {
    emit(key, value);
};

// Reduce function - aggregate values
var reduceFunction = function(key, values) {
    return aggregated_value;
};

// Finalize function - post-process results
var finalizeFunction = function(key, reducedValue) {
    return final_value;
};

// Execute MapReduce
db.collection.mapReduce(
    mapFunction,
    reduceFunction,
    {
        out: "output_collection",
        finalize: finalizeFunction
    }
);
```

## 🎯 Example Output

```
==============================================================
MapReduce #1: Average Temperature by Country
==============================================================

✓ MapReduce completed
Results saved in collection: avg_temp_by_country
Total countries: 243

Top 5 warmest countries:
  Djibouti: 28.83°C
  Burkina Faso: 28.71°C
  Mali: 28.65°C
  Mauritania: 28.27°C
  Senegal: 28.25°C
```

## 🔄 Re-running MapReduce

MapReduce output collections are replaced each time you run the scripts. Previous results will be overwritten.

To keep historical results, rename output collections:

```javascript
db.avg_temp_by_country.renameCollection("avg_temp_by_country_backup")
```

## 🐛 Troubleshooting

**Error: Collection not found**
- Ensure data is uploaded: `python scripts/upload_dataset.py`

**Error: Cannot connect to MongoDB**
- Start MongoDB: `brew services start mongodb-community`

**No results returned**
- Check if data exists: `db.country_temps.countDocuments()`

---

**Ready to run? Execute:** `mongosh < run_all.js` 🚀
