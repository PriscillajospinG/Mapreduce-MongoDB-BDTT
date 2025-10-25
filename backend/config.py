"""
Configuration settings for MongoDB MapReduce Climate Analysis Project
"""
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "climate_db"

# Collection Names
COLLECTIONS = {
    "country": "country_temps",
    "city": "city_temps",
    "major_city": "major_city_temps",
    "state": "state_temps",
    "global": "global_temps"
}

# Dataset Paths (relative to project root)
DATASET_PATHS = {
    "country": "../Dataset/GlobalLandTemperaturesByCountry.csv",
    "city": "../Dataset/GlobalLandTemperaturesByCity.csv",
    "major_city": "../Dataset/GlobalLandTemperaturesByMajorCity.csv",
    "state": "../Dataset/GlobalLandTemperaturesByState.csv",
    "global": "../Dataset/GlobalTemperatures.csv"
}

# Data Processing Configuration
TEMPERATURE_THRESHOLD = -100  # Minimum valid temperature in Celsius
MIN_YEAR = 1850  # Minimum year to consider for analysis
MAX_YEAR = 2015  # Maximum year to consider

# Visualization Configuration
OUTPUT_DIR = "output"
CHARTS_DIR = f"{OUTPUT_DIR}/charts"
REPORTS_DIR = f"{OUTPUT_DIR}/reports"

# MapReduce Configuration
MAPREDUCE_TIMEOUT = 300000  # 5 minutes in milliseconds
