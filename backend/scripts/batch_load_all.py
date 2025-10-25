#!/usr/bin/env python3
"""
Batch Load All Datasets into Parquet Format
Loads all 5 datasets and converts them to Parquet files for efficient processing
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_date, year, month
from config import *


def create_spark_session():
    """Initialize and return a Spark session"""
    spark = SparkSession.builder \
        .appName(SPARK_APP_NAME) \
        .master(SPARK_MASTER) \
        .config("spark.driver.memory", SPARK_DRIVER_MEMORY) \
        .config("spark.executor.memory", SPARK_EXECUTOR_MEMORY) \
        .config("spark.sql.shuffle.partitions", SPARK_SQL_SHUFFLE_PARTITIONS) \
        .getOrCreate()
    
    spark.sparkContext.setLogLevel(LOG_LEVEL)
    return spark


def load_and_save_dataset(spark, dataset_name, file_path, output_path):
    """
    Load CSV and save as Parquet
    
    Args:
        spark: SparkSession
        dataset_name: Name of dataset
        file_path: Path to CSV file
        output_path: Path to save Parquet
    
    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"\n{'='*70}")
        print(f"  Loading: {dataset_name}")
        print(f"{'='*70}")
        
        # Load CSV
        print(f"Reading CSV from: {file_path}")
        df = spark.read.csv(
            file_path,
            header=True,
            inferSchema=True,
            dateFormat="yyyy-MM-dd"
        )
        
        # Show schema and sample
        print(f"\n📊 Schema for {dataset_name}:")
        df.printSchema()
        
        record_count = df.count()
        print(f"\n📈 Total records: {record_count:,}")
        
        print(f"\n🔍 Sample data:")
        df.show(5, truncate=False)
        
        # Save as Parquet
        print(f"\n💾 Saving to Parquet: {output_path}")
        df.write.mode("overwrite").parquet(output_path)
        
        print(f"✅ Successfully saved {dataset_name} to Parquet")
        print(f"   Location: {output_path}")
        
        return df.count()
        
    except Exception as e:
        print(f"❌ Error loading {dataset_name}: {str(e)}")
        return 0


def main():
    """Load all datasets"""
    print("\n" + "="*70)
    print("  BATCH LOAD ALL DATASETS → PARQUET FORMAT")
    print("="*70)
    
    # Create Spark session
    print("\n🔧 Initializing Spark Session...")
    spark = create_spark_session()
    print("✅ Spark session created successfully")
    print(f"   Master: {spark.sparkContext.master()}")
    print(f"   App Name: {spark.sparkContext.appName}")
    
    # Ensure output directories exist
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    os.makedirs(MAPREDUCE_RESULTS_DIR, exist_ok=True)
    
    # Dataset configurations
    datasets = [
        {
            "name": "Country",
            "csv": "GlobalLandTemperaturesByCountry.csv",
            "output_dir": "country_raw"
        },
        {
            "name": "City",
            "csv": "GlobalLandTemperaturesByCity.csv",
            "output_dir": "city_raw"
        },
        {
            "name": "Major City",
            "csv": "GlobalLandTemperaturesByMajorCity.csv",
            "output_dir": "major_city_raw"
        },
        {
            "name": "State",
            "csv": "GlobalLandTemperaturesByState.csv",
            "output_dir": "state_raw"
        },
        {
            "name": "Global",
            "csv": "GlobalTemperatures.csv",
            "output_dir": "global_raw"
        }
    ]
    
    # Process each dataset
    print("\n" + "="*70)
    print("  PROCESSING DATASETS")
    print("="*70)
    
    results = []
    dataset_path = Path(__file__).resolve().parent.parent.parent / "Dataset"
    
    for dataset_config in datasets:
        csv_file = dataset_path / dataset_config["csv"]
        output_dir = Path(PROCESSED_DATA_DIR) / dataset_config["output_dir"]
        
        if not csv_file.exists():
            print(f"\n❌ File not found: {csv_file}")
            results.append({
                "name": dataset_config["name"],
                "success": False,
                "records": 0
            })
            continue
        
        record_count = load_and_save_dataset(
            spark,
            dataset_config["name"],
            str(csv_file),
            str(output_dir)
        )
        
        results.append({
            "name": dataset_config["name"],
            "success": record_count > 0,
            "records": record_count
        })
    
    # Print summary
    print("\n" + "="*70)
    print("  SUMMARY")
    print("="*70)
    
    successful = sum(1 for r in results if r["success"])
    total_records = sum(r["records"] for r in results if r["success"])
    
    print(f"\n✅ Successfully loaded: {successful}/{len(datasets)} datasets")
    print(f"📊 Total records: {total_records:,}\n")
    
    for result in results:
        status = "✅" if result["success"] else "❌"
        count = f"{result['records']:,}" if result["records"] > 0 else "N/A"
        print(f"   {status} {result['name']:<15} {count:>12} records")
    
    print("\n📁 Parquet files saved to: " + PROCESSED_DATA_DIR)
    print("\n" + "="*70)
    
    spark.stop()
    
    return 0 if successful == len(datasets) else 1


if __name__ == "__main__":
    sys.exit(main())
