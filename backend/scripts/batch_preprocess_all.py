#!/usr/bin/env python3
"""
Batch Preprocess All Datasets
Cleans and transforms all datasets using PySpark
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_date, year, month, when, floor, isnan, isnull
from pyspark.sql.types import DoubleType
from config import *


# Configuration
MIN_YEAR = 1750
MAX_YEAR = 2016


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


def preprocess_dataset(spark, dataset_name, input_path, output_path):
    """
    Preprocess a dataset with 7 transformation steps
    
    Args:
        spark: SparkSession
        dataset_name: Name of dataset
        input_path: Path to input Parquet
        output_path: Path to save cleaned Parquet
    
    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"\n{'='*70}")
        print(f"  Preprocessing: {dataset_name}")
        print(f"{'='*70}")
        
        # Load Parquet
        print(f"\n📂 Loading from: {input_path}")
        df = spark.read.parquet(input_path)
        
        original_count = df.count()
        print(f"📊 Original records: {original_count:,}")
        
        # Step 1: Remove null temperatures
        print(f"\n🔧 Step 1: Removing null temperatures...")
        df = df.filter(col("AverageTemperature").isNotNull())
        step1_count = df.count()
        print(f"   Records after: {step1_count:,} ({original_count - step1_count:,} removed)")
        
        # Step 2: Filter invalid temperatures (realistic range)
        print(f"🔧 Step 2: Filtering invalid temperatures (-100 to 60°C)...")
        df = df.filter(
            (col("AverageTemperature").cast(DoubleType()) >= -100) &
            (col("AverageTemperature").cast(DoubleType()) <= 60)
        )
        step2_count = df.count()
        print(f"   Records after: {step2_count:,} ({step1_count - step2_count:,} removed)")
        
        # Step 3: Convert date and extract year/month
        print(f"🔧 Step 3: Converting date format and extracting year/month...")
        df = df.withColumn("dt", to_date(col("dt"), "yyyy-MM-dd"))
        df = df.withColumn("year", year(col("dt")))
        df = df.withColumn("month", month(col("dt")))
        print(f"   ✓ Date columns added")
        
        # Step 4: Filter by year range
        print(f"🔧 Step 4: Filtering by year range ({MIN_YEAR}-{MAX_YEAR})...")
        df = df.filter(
            (col("year") >= MIN_YEAR) &
            (col("year") <= MAX_YEAR)
        )
        step4_count = df.count()
        print(f"   Records after: {step4_count:,} ({step2_count - step4_count:,} removed)")
        
        # Step 5: Add season column
        print(f"🔧 Step 5: Adding season classification...")
        df = df.withColumn("season", 
            when(col("month").isin(12, 1, 2), "Winter")
            .when(col("month").isin(3, 4, 5), "Spring")
            .when(col("month").isin(6, 7, 8), "Summer")
            .when(col("month").isin(9, 10, 11), "Fall")
        )
        print(f"   ✓ Season column added")
        
        # Step 6: Add decade column
        print(f"🔧 Step 6: Adding decade classification...")
        df = df.withColumn("decade", (floor(col("year") / 10) * 10).cast("integer"))
        print(f"   ✓ Decade column added")
        
        # Step 7: Remove duplicates
        print(f"🔧 Step 7: Removing duplicate records...")
        
        # Determine unique columns based on dataset
        if "City" in dataset_name or "State" in dataset_name or "Country" in dataset_name:
            unique_cols = ["dt", "Country"]
            if "City" in dataset_name:
                unique_cols.extend(["City", "Latitude", "Longitude"])
            elif "State" in dataset_name:
                unique_cols.append("State")
        else:
            unique_cols = ["dt"]
        
        df = df.dropDuplicates(unique_cols)
        step7_count = df.count()
        print(f"   Records after: {step7_count:,} ({step4_count - step7_count:,} duplicates removed)")
        
        # Save cleaned data
        print(f"\n💾 Saving cleaned data to: {output_path}")
        df.write.mode("overwrite").parquet(output_path)
        
        # Show final schema and sample
        print(f"\n📋 Final schema:")
        df.printSchema()
        
        print(f"\n🔍 Sample cleaned data:")
        df.show(3, truncate=False)
        
        print(f"\n✅ {dataset_name} preprocessing completed")
        print(f"   Final records: {step7_count:,}")
        print(f"   Reduction: {((original_count - step7_count) / original_count * 100):.1f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ Error preprocessing {dataset_name}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Preprocess all datasets"""
    print("\n" + "="*70)
    print("  BATCH PREPROCESS ALL DATASETS")
    print("="*70)
    
    # Create Spark session
    print("\n🔧 Initializing Spark Session...")
    spark = create_spark_session()
    print("✅ Spark session created")
    
    # Dataset configurations
    datasets = [
        {
            "name": "Country",
            "input_dir": "country_raw",
            "output_dir": "country_clean"
        },
        {
            "name": "City",
            "input_dir": "city_raw",
            "output_dir": "city_clean"
        },
        {
            "name": "Major City",
            "input_dir": "major_city_raw",
            "output_dir": "major_city_clean"
        },
        {
            "name": "State",
            "input_dir": "state_raw",
            "output_dir": "state_clean"
        },
        {
            "name": "Global",
            "input_dir": "global_raw",
            "output_dir": "global_clean"
        }
    ]
    
    # Process each dataset
    print("\n" + "="*70)
    print("  PROCESSING DATASETS")
    print("="*70)
    
    results = []
    
    for dataset_config in datasets:
        input_dir = Path(PROCESSED_DATA_DIR) / dataset_config["input_dir"]
        output_dir = Path(PROCESSED_DATA_DIR) / dataset_config["output_dir"]
        
        if not input_dir.exists():
            print(f"\n❌ Input not found: {input_dir}")
            results.append({"name": dataset_config["name"], "success": False})
            continue
        
        success = preprocess_dataset(
            spark,
            dataset_config["name"],
            str(input_dir),
            str(output_dir)
        )
        
        results.append({"name": dataset_config["name"], "success": success})
    
    # Print summary
    print("\n" + "="*70)
    print("  SUMMARY")
    print("="*70)
    
    successful = sum(1 for r in results if r["success"])
    
    print(f"\n✅ Successfully preprocessed: {successful}/{len(datasets)} datasets\n")
    
    for result in results:
        status = "✅" if result["success"] else "❌"
        print(f"   {status} {result['name']}")
    
    print("\n📁 Cleaned data saved to: " + PROCESSED_DATA_DIR)
    print("\n" + "="*70)
    
    spark.stop()
    
    return 0 if successful == len(datasets) else 1


if __name__ == "__main__":
    sys.exit(main())
