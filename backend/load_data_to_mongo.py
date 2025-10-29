"""
Script to load climate CSV data into MongoDB
Run this once to populate the MongoDB database
"""

import os
import sys
import pandas as pd
import numpy as np
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from tqdm import tqdm
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "climate_db"
DATASET_DIR = "../Dataset"

def connect_mongodb():
    """Connect to MongoDB"""
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()
        logger.info(f"✅ Connected to MongoDB at {MONGO_URI}")
        return client
    except ConnectionFailure:
        logger.error("❌ MongoDB is not running! Please start MongoDB first:")
        logger.error("   macOS: brew services start mongodb-community")
        logger.error("   Linux: sudo service mongod start")
        logger.error("   Docker: docker run -d -p 27017:27017 --name mongodb mongo")
        sys.exit(1)

def load_dataset(client, csv_file, collection_name):
    """Load a CSV file into MongoDB collection"""
    filepath = os.path.join(DATASET_DIR, csv_file)
    
    if not os.path.exists(filepath):
        logger.warning(f"⚠️  File not found: {filepath}")
        return False
    
    try:
        logger.info(f"📦 Loading {csv_file}...")
        
        # Read CSV
        df = pd.read_csv(filepath)
        df = df.dropna(subset=['AverageTemperature'])  # Remove rows with NaN temperatures
        
        # Convert to dictionary records
        records = df.to_dict('records')
        
        # Connect to database and collection
        db = client[DATABASE_NAME]
        collection = db[collection_name]
        
        # Clear existing data
        collection.drop()
        
        # Insert records in batches
        batch_size = 10000
        for i in tqdm(range(0, len(records), batch_size), desc=f"Inserting {collection_name}"):
            batch = records[i:i+batch_size]
            collection.insert_many(batch)
        
        # Create indexes
        collection.create_index('dt')
        collection.create_index('Country')
        if 'City' in df.columns:
            collection.create_index('City')
        
        count = collection.count_documents({})
        logger.info(f"✅ {collection_name}: {count:,} records loaded")
        
        return True
    
    except Exception as e:
        logger.error(f"❌ Error loading {csv_file}: {e}")
        return False

def verify_data(client):
    """Verify data was loaded correctly"""
    logger.info("\n📊 Verifying data...")
    db = client[DATABASE_NAME]
    
    collections = {
        'country_temps': 'GlobalLandTemperaturesByCountry.csv',
        'city_temps': 'GlobalLandTemperaturesByCity.csv',
        'state_temps': 'GlobalLandTemperaturesByState.csv',
        'major_city_temps': 'GlobalLandTemperaturesByMajorCity.csv',
        'global_temps': 'GlobalTemperatures.csv'
    }
    
    total_records = 0
    for collection_name in collections:
        try:
            count = db[collection_name].count_documents({})
            total_records += count
            logger.info(f"  • {collection_name}: {count:,} records")
        except Exception as e:
            logger.warning(f"  • {collection_name}: Not found - {e}")
    
    logger.info(f"\n✅ Total records in database: {total_records:,}")
    return total_records > 0

def main():
    """Main execution"""
    logger.info("=" * 60)
    logger.info("Climate Data MongoDB Loader")
    logger.info("=" * 60)
    
    # Connect to MongoDB
    client = connect_mongodb()
    
    try:
        # Load datasets
        datasets = [
            ('GlobalLandTemperaturesByCountry.csv', 'country_temps'),
            ('GlobalLandTemperaturesByCity.csv', 'city_temps'),
            ('GlobalLandTemperaturesByState.csv', 'state_temps'),
            ('GlobalLandTemperaturesByMajorCity.csv', 'major_city_temps'),
            ('GlobalTemperatures.csv', 'global_temps')
        ]
        
        logger.info(f"\n📂 Dataset directory: {DATASET_DIR}")
        logger.info(f"🗄️  Database: {DATABASE_NAME}\n")
        
        success_count = 0
        for csv_file, collection_name in datasets:
            if load_dataset(client, csv_file, collection_name):
                success_count += 1
        
        # Verify
        logger.info("")
        verify_data(client)
        
        logger.info("\n" + "=" * 60)
        if success_count > 0:
            logger.info(f"✅ Data loading completed! ({success_count}/5 datasets)")
        else:
            logger.info("❌ No datasets loaded successfully")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    
    finally:
        client.close()

if __name__ == '__main__':
    main()
