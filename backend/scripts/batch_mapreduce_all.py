#!/usr/bin/env python3
"""
Batch Run MapReduce Operations on All Datasets
Executes all 6 MapReduce operations on each cleaned dataset
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, min, max, count, desc, asc, floor, year
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


def run_mapreduce_operations(spark, dataset_name, input_path, results_base_dir):
    """
    Execute all 6 MapReduce operations on a dataset
    
    Args:
        spark: SparkSession
        dataset_name: Name of dataset
        input_path: Path to cleaned Parquet
        results_base_dir: Base directory for results
    
    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"\n{'='*70}")
        print(f"  MapReduce Operations: {dataset_name}")
        print(f"{'='*70}")
        
        # Load cleaned data
        print(f"\n📂 Loading from: {input_path}")
        df = spark.read.parquet(input_path)
        total_records = df.count()
        print(f"📊 Total records: {total_records:,}")
        
        # Create dataset-specific results directory
        dataset_results_dir = Path(results_base_dir) / dataset_name.lower().replace(" ", "_")
        dataset_results_dir.mkdir(parents=True, exist_ok=True)
        
        # Operation 1: Average Temperature by Country
        print(f"\n🔍 Operation 1: Average Temperature by Country")
        try:
            op1 = df.groupBy("Country").agg(
                avg("AverageTemperature").alias("average"),
                min("AverageTemperature").alias("min"),
                max("AverageTemperature").alias("max"),
                count("*").alias("count")
            ).orderBy(desc("average"))
            
            op1_path = dataset_results_dir / "op1_avg_temp_by_country"
            op1.write.mode("overwrite").parquet(str(op1_path))
            op1_count = op1.count()
            print(f"   ✅ Completed - {op1_count} countries analyzed")
            print(f"   📊 Top 3 warmest countries:")
            op1.show(3, truncate=False)
        except Exception as e:
            print(f"   ⚠️  Skipped: {str(e)}")
        
        # Operation 2: Temperature Trends by Year
        print(f"\n🔍 Operation 2: Temperature Trends by Year")
        try:
            op2 = df.groupBy("year").agg(
                avg("AverageTemperature").alias("average"),
                min("AverageTemperature").alias("min"),
                max("AverageTemperature").alias("max"),
                count("*").alias("count")
            ).orderBy("year")
            
            op2_path = dataset_results_dir / "op2_temp_trends_by_year"
            op2.write.mode("overwrite").parquet(str(op2_path))
            op2_count = op2.count()
            print(f"   ✅ Completed - {op2_count} years analyzed")
            print(f"   📊 First 3 years:")
            op2.show(3, truncate=False)
        except Exception as e:
            print(f"   ⚠️  Skipped: {str(e)}")
        
        # Operation 3: Seasonal Analysis
        print(f"\n🔍 Operation 3: Seasonal Analysis")
        try:
            op3 = df.groupBy("season").agg(
                avg("AverageTemperature").alias("average"),
                min("AverageTemperature").alias("min"),
                max("AverageTemperature").alias("max"),
                count("*").alias("count")
            ).orderBy(desc("average"))
            
            op3_path = dataset_results_dir / "op3_seasonal_analysis"
            op3.write.mode("overwrite").parquet(str(op3_path))
            op3_count = op3.count()
            print(f"   ✅ Completed - {op3_count} seasons analyzed")
            print(f"   📊 Results by temperature:")
            op3.show(truncate=False)
        except Exception as e:
            print(f"   ⚠️  Skipped: {str(e)}")
        
        # Operation 4: Extreme Temperatures
        print(f"\n🔍 Operation 4: Extreme Temperatures (Top 10)")
        try:
            warmest = df.orderBy(desc("AverageTemperature")).limit(10).select(
                col("dt"),
                col("Country"),
                col("AverageTemperature"),
                (col("AverageTemperature")).alias("temp_type")
            )
            
            coldest = df.orderBy(asc("AverageTemperature")).limit(10).select(
                col("dt"),
                col("Country"),
                col("AverageTemperature"),
                (col("AverageTemperature")).alias("temp_type")
            )
            
            op4_warmest = warmest.withColumn("category", lit("Warmest"))
            op4_coldest = coldest.withColumn("category", lit("Coldest"))
            
            op4 = op4_warmest.unionByName(op4_coldest)
            op4_path = dataset_results_dir / "op4_extreme_temps"
            op4.write.mode("overwrite").parquet(str(op4_path))
            
            print(f"   ✅ Completed - Top 10 warmest & coldest")
            print(f"   📊 Warmest temperatures:")
            warmest.show(3, truncate=False)
            print(f"   📊 Coldest temperatures:")
            coldest.show(3, truncate=False)
        except Exception as e:
            print(f"   ⚠️  Skipped: {str(e)}")
        
        # Operation 5: Decade Analysis
        print(f"\n🔍 Operation 5: Decade Analysis")
        try:
            op5 = df.groupBy("decade").agg(
                avg("AverageTemperature").alias("average"),
                min("AverageTemperature").alias("min"),
                max("AverageTemperature").alias("max"),
                count("*").alias("count")
            ).orderBy("decade")
            
            op5_path = dataset_results_dir / "op5_decade_analysis"
            op5.write.mode("overwrite").parquet(str(op5_path))
            op5_count = op5.count()
            print(f"   ✅ Completed - {op5_count} decades analyzed")
            print(f"   📊 First 5 decades:")
            op5.show(5, truncate=False)
        except Exception as e:
            print(f"   ⚠️  Skipped: {str(e)}")
        
        # Operation 6: Records by Country
        print(f"\n🔍 Operation 6: Records by Country")
        try:
            op6 = df.groupBy("Country").agg(
                count("*").alias("record_count")
            ).orderBy(desc("record_count"))
            
            op6_path = dataset_results_dir / "op6_records_by_country"
            op6.write.mode("overwrite").parquet(str(op6_path))
            op6_count = op6.count()
            print(f"   ✅ Completed - {op6_count} countries")
            print(f"   📊 Top 3 countries by record count:")
            op6.show(3, truncate=False)
        except Exception as e:
            print(f"   ⚠️  Skipped: {str(e)}")
        
        print(f"\n✅ All MapReduce operations completed for {dataset_name}")
        print(f"   Results saved to: {dataset_results_dir}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in MapReduce operations for {dataset_name}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run MapReduce operations on all datasets"""
    print("\n" + "="*70)
    print("  BATCH MAPREDUCE OPERATIONS - ALL DATASETS")
    print("="*70)
    
    # Create Spark session
    print("\n🔧 Initializing Spark Session...")
    spark = create_spark_session()
    print("✅ Spark session created")
    print(f"   📊 Spark UI available at: http://localhost:4040")
    
    # Ensure results directory exists
    os.makedirs(MAPREDUCE_RESULTS_DIR, exist_ok=True)
    
    # Dataset configurations
    datasets = [
        {
            "name": "Country",
            "input_dir": "country_clean"
        },
        {
            "name": "City",
            "input_dir": "city_clean"
        },
        {
            "name": "Major City",
            "input_dir": "major_city_clean"
        },
        {
            "name": "State",
            "input_dir": "state_clean"
        },
        {
            "name": "Global",
            "input_dir": "global_clean"
        }
    ]
    
    # Process each dataset
    print("\n" + "="*70)
    print("  PROCESSING DATASETS")
    print("="*70)
    
    results = []
    
    for dataset_config in datasets:
        input_dir = Path(PROCESSED_DATA_DIR) / dataset_config["input_dir"]
        
        if not input_dir.exists():
            print(f"\n❌ Input not found: {input_dir}")
            results.append({"name": dataset_config["name"], "success": False})
            continue
        
        success = run_mapreduce_operations(
            spark,
            dataset_config["name"],
            str(input_dir),
            MAPREDUCE_RESULTS_DIR
        )
        
        results.append({"name": dataset_config["name"], "success": success})
    
    # Print summary
    print("\n" + "="*70)
    print("  SUMMARY")
    print("="*70)
    
    successful = sum(1 for r in results if r["success"])
    
    print(f"\n✅ Successfully processed: {successful}/{len(datasets)} datasets\n")
    
    for result in results:
        status = "✅" if result["success"] else "❌"
        print(f"   {status} {result['name']}")
    
    print(f"\n📁 Results saved to: {MAPREDUCE_RESULTS_DIR}")
    print(f"\n📊 6 MapReduce operations per dataset:")
    print(f"   1. Average Temperature by Country")
    print(f"   2. Temperature Trends by Year")
    print(f"   3. Seasonal Analysis")
    print(f"   4. Extreme Temperatures")
    print(f"   5. Decade Analysis")
    print(f"   6. Records by Country")
    
    print("\n" + "="*70)
    
    spark.stop()
    
    return 0 if successful == len(datasets) else 1


if __name__ == "__main__":
    from pyspark.sql.functions import lit
    sys.exit(main())
