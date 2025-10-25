"""
Configuration file for PySpark Climate Analysis Project
"""
import os
from pathlib import Path

# ============================================================================
# PYSPARK CONFIGURATION
# ============================================================================

# Spark Application Settings
SPARK_APP_NAME = "Climate_Analysis_MapReduce"
SPARK_MASTER = "local[*]"  # Use all available cores
SPARK_DRIVER_MEMORY = "4g"
SPARK_EXECUTOR_MEMORY = "4g"
SPARK_SQL_SHUFFLE_PARTITIONS = 200

# ============================================================================
# DATASET PATHS
# ============================================================================

# Base directory (parent of backend folder)
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "Dataset"

# Dataset file paths
DATASET_PATHS = {
    'country': str(DATASET_DIR / 'GlobalLandTemperaturesByCountry.csv'),
    'city': str(DATASET_DIR / 'GlobalLandTemperaturesByCity.csv'),
    'major_city': str(DATASET_DIR / 'GlobalLandTemperaturesByMajorCity.csv'),
    'state': str(DATASET_DIR / 'GlobalLandTemperaturesByState.csv'),
    'global': str(DATASET_DIR / 'GlobalTemperatures.csv')
}

# ============================================================================
# OUTPUT CONFIGURATION
# ============================================================================

# Output directories
OUTPUT_DIR = Path(__file__).resolve().parent / "output"
PROCESSED_DATA_DIR = OUTPUT_DIR / "processed_data"
MAPREDUCE_RESULTS_DIR = OUTPUT_DIR / "mapreduce_results"
VISUALIZATIONS_DIR = OUTPUT_DIR / "visualizations"

# Create output directories if they don't exist
for directory in [OUTPUT_DIR, PROCESSED_DATA_DIR, MAPREDUCE_RESULTS_DIR, VISUALIZATIONS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# ============================================================================
# DATA PROCESSING PARAMETERS
# ============================================================================

# Temperature validation
TEMPERATURE_THRESHOLD = -100.0  # Minimum valid temperature in Celsius
MAX_TEMPERATURE = 60.0  # Maximum reasonable temperature

# Date range filtering
MIN_YEAR = 1750
MAX_YEAR = 2025

# ============================================================================
# MAPREDUCE OUTPUT FILES
# ============================================================================

MAPREDUCE_OUTPUTS = {
    'avg_temp_by_country': str(MAPREDUCE_RESULTS_DIR / 'avg_temp_by_country'),
    'temp_trends_by_year': str(MAPREDUCE_RESULTS_DIR / 'temp_trends_by_year'),
    'seasonal_analysis': str(MAPREDUCE_RESULTS_DIR / 'seasonal_analysis'),
    'extreme_temps': str(MAPREDUCE_RESULTS_DIR / 'extreme_temps'),
    'decade_analysis': str(MAPREDUCE_RESULTS_DIR / 'decade_analysis'),
    'records_by_country': str(MAPREDUCE_RESULTS_DIR / 'records_by_country')
}

# ============================================================================
# VISUALIZATION SETTINGS
# ============================================================================

# Chart settings
CHART_DPI = 300
CHART_FIGSIZE = (12, 6)
TOP_N_COUNTRIES = 10  # Number of countries to show in rankings

# ============================================================================
# LOGGING
# ============================================================================

LOG_LEVEL = "WARN"  # Spark log level (ERROR, WARN, INFO, DEBUG)

print(f"✓ Configuration loaded")
print(f"  - Dataset directory: {DATASET_DIR}")
print(f"  - Output directory: {OUTPUT_DIR}")
print(f"  - Spark master: {SPARK_MASTER}")
