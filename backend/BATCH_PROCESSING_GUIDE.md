# Batch Processing All Datasets with PySpark

This guide explains how to process all 5 climate datasets through the complete PySpark pipeline automatically.

## 📊 Datasets

The project includes 5 climate datasets:

1. **Country** - GlobalLandTemperaturesByCountry.csv (~577K records)
2. **City** - GlobalLandTemperaturesByCity.csv (~8.6M records)
3. **Major City** - GlobalLandTemperaturesByMajorCity.csv (~239K records)
4. **State** - GlobalLandTemperaturesByState.csv (~645K records)
5. **Global** - GlobalTemperatures.csv (~3.3K records)

**Total: ~10M+ records** ✅

## 🚀 Quick Start

### Option 1: Run Full Pipeline (Recommended)

Process all 5 datasets in one command:

```bash
cd backend
python scripts/run_full_pipeline.py
```

This will:
1. Load all 5 CSV files → Convert to Parquet (batch_load_all.py)
2. Preprocess all 5 datasets → Clean & transform (batch_preprocess_all.py)
3. Run 6 MapReduce operations × 5 datasets (batch_mapreduce_all.py)

**Expected duration: 20-30 minutes**

### Option 2: Run Steps Individually

Run each step separately to have more control:

```bash
# Step 1: Load all datasets
python scripts/batch_load_all.py

# Step 2: Preprocess all datasets
python scripts/batch_preprocess_all.py

# Step 3: MapReduce all datasets
python scripts/batch_mapreduce_all.py
```

### Option 3: Run Single Dataset (Original Scripts)

Process one dataset at a time:

```bash
# Interactive menu allows you to choose dataset (1-5)
python scripts/load_data.py              # Choose 1-5
python scripts/preprocess_data.py        # Choose 1-5
python scripts/mapreduce_operations.py   # Runs on all cleaned datasets
```

## 📁 Output Structure

### Processed Data Directory
```
backend/output/processed_data/
├── country_raw/          # Original CSV as Parquet
├── country_clean/        # Cleaned & transformed
├── city_raw/
├── city_clean/
├── major_city_raw/
├── major_city_clean/
├── state_raw/
├── state_clean/
├── global_raw/
└── global_clean/
```

### MapReduce Results Directory
```
backend/output/mapreduce_results/
├── country/
│   ├── op1_avg_temp_by_country/
│   ├── op2_temp_trends_by_year/
│   ├── op3_seasonal_analysis/
│   ├── op4_extreme_temps/
│   ├── op5_decade_analysis/
│   └── op6_records_by_country/
├── city/
│   ├── op1_avg_temp_by_country/
│   ├── ... (6 operations)
├── major_city/
├── state/
└── global/
```

## 🔍 The 6 MapReduce Operations

All operations run on each cleaned dataset:

### Operation 1: Average Temperature by Country
```python
df.groupBy("Country").agg(
    avg("AverageTemperature"),
    min("AverageTemperature"),
    max("AverageTemperature"),
    count("*")
).orderBy(desc("average"))
```
**Output:** Countries ranked by average temperature

### Operation 2: Temperature Trends by Year
```python
df.groupBy("year").agg(
    avg("AverageTemperature"),
    min("AverageTemperature"),
    max("AverageTemperature"),
    count("*")
).orderBy("year")
```
**Output:** Temperature trends from 1750 to 2016

### Operation 3: Seasonal Analysis
```python
df.groupBy("season").agg(
    avg("AverageTemperature"),
    min("AverageTemperature"),
    max("AverageTemperature")
)
```
**Output:** Average temps by season (Winter, Spring, Summer, Fall)

### Operation 4: Extreme Temperatures
```python
warmest = df.orderBy(desc("AverageTemperature")).limit(10)
coldest = df.orderBy(asc("AverageTemperature")).limit(10)
```
**Output:** Top 10 warmest and coldest temperatures

### Operation 5: Decade Analysis
```python
df.groupBy("decade").agg(
    avg("AverageTemperature"),
    count("*")
).orderBy("decade")
```
**Output:** Temperature trends by decade

### Operation 6: Records by Country
```python
df.groupBy("Country").agg(
    count("*").alias("record_count")
).orderBy(desc("record_count"))
```
**Output:** Number of records per country

## 📊 Monitoring

### Spark Web UI

While scripts are running, you can monitor Spark jobs in real-time:

```bash
# Open in browser
http://localhost:4040
```

Available information:
- Active jobs and stages
- Task execution timeline
- Executor metrics
- Storage (RDD/DataFrame cache status)
- SQL execution plans

### Log Files

Scripts output progress and statistics to console. Key metrics:
- Record counts before/after each step
- Processing time per operation
- Data quality metrics
- File sizes

## 🔧 Configuration

Edit `backend/config.py` to adjust:

```python
# Spark configuration
SPARK_DRIVER_MEMORY = "4g"          # Driver memory
SPARK_EXECUTOR_MEMORY = "4g"        # Executor memory
SPARK_SQL_SHUFFLE_PARTITIONS = 200  # Parallelism

# Data paths
PROCESSED_DATA_DIR = "output/processed_data"
MAPREDUCE_RESULTS_DIR = "output/mapreduce_results"
```

## 📈 Performance

Expected execution times per dataset:

| Dataset | Records | Load | Preprocess | MapReduce | Total |
|---------|---------|------|-----------|-----------|-------|
| Country | 577K | 3s | 5s | 10s | 18s |
| City | 8.6M | 15s | 25s | 45s | 85s |
| Major City | 239K | 2s | 4s | 8s | 14s |
| State | 645K | 3s | 6s | 12s | 21s |
| Global | 3.3K | 1s | 2s | 3s | 6s |
| **TOTAL** | **10M+** | **24s** | **42s** | **78s** | **144s** |

**Expected total time: ~2.5 minutes** ⚡

(Actual times vary based on system specs and resource availability)

## 🐛 Troubleshooting

### Java Not Found
```
Error: JAVA_HOME not set
Solution: brew install openjdk@11
         export JAVA_HOME=/usr/local/opt/openjdk@11
```

### PySpark Not Installed
```
Error: ModuleNotFoundError: No module named 'pyspark'
Solution: pip install -r requirements.txt
```

### Parquet Files Not Found
```
Error: Path does not exist
Solution: Run batch_load_all.py first to create Parquet files
```

### Out of Memory Error
```
Error: java.lang.OutOfMemoryError
Solution: Reduce SPARK_DRIVER_MEMORY or SPARK_EXECUTOR_MEMORY in config.py
```

### Timeout Error
```
Error: Process timed out
Solution: Increase timeout in run_full_pipeline.py (line with timeout=3600)
```

## 📚 Scripts Reference

### batch_load_all.py
Loads all 5 CSV files and converts to Parquet format
- Input: Dataset/ directory with 5 CSV files
- Output: processed_data/ with *_raw/ directories
- Time: ~25 seconds

### batch_preprocess_all.py
Cleans and transforms all preprocessed datasets
- Input: processed_data/ with *_raw/ directories
- Output: processed_data/ with *_clean/ directories
- Transformations:
  - Remove null temperatures
  - Filter invalid temperatures (-100 to 60°C)
  - Extract year/month from dates
  - Add season classification
  - Add decade classification
  - Remove duplicates
- Time: ~40 seconds

### batch_mapreduce_all.py
Executes all 6 MapReduce operations on each dataset
- Input: processed_data/ with *_clean/ directories
- Output: mapreduce_results/ with operation results
- Operations per dataset: 6
- Total operations: 30 (6 × 5 datasets)
- Time: ~80 seconds

### run_full_pipeline.py
Master orchestrator - runs all steps automatically
- Orchestrates: batch_load → batch_preprocess → batch_mapreduce
- With progress indicators and time tracking
- Error handling and recovery
- Comprehensive final report
- Time: ~20-30 minutes (includes overhead)

## 🎯 Next Steps

After processing all datasets:

1. **Analyze Results**
   - Read Parquet files from mapreduce_results/
   - Compare trends across datasets
   - Identify patterns and anomalies

2. **Create Visualizations**
   - Build visualization_all.py to read from Parquet
   - Generate charts for each operation
   - Create dashboards comparing datasets

3. **Generate Reports**
   - Aggregated statistics
   - Comparative analysis
   - Trend predictions

4. **Export Results**
   - Convert Parquet to CSV
   - Create JSON exports
   - Generate PDF reports

## 📖 Additional Resources

- [PySpark Documentation](https://spark.apache.org/docs/latest/api/python/)
- [Parquet Format](https://parquet.apache.org/)
- [PySpark SQL Guide](https://spark.apache.org/docs/latest/sql-programming-guide.html)
- [Spark DataFrame API](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql.html)

## ✅ Verification Checklist

Before running the pipeline:

- [ ] Java installed: `java -version`
- [ ] PySpark installed: `pip list | grep pyspark`
- [ ] Dataset files exist in Dataset/ directory
- [ ] Disk space available: ~5GB
- [ ] RAM available: 8GB+ recommended
- [ ] config.py configured correctly

Before sharing results:

- [ ] All 5 datasets processed successfully
- [ ] All 6 operations per dataset completed
- [ ] No errors in console output
- [ ] Output files exist and have reasonable sizes
- [ ] Parquet files can be read back

---

**Happy analyzing! 📊✨**
