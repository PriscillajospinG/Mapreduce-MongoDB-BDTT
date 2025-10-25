"""
PySpark MapReduce Operations
Implements 6 MapReduce-style operations using Spark DataFrames
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, avg, min as spark_min, max as spark_max, count, sum as spark_sum,
    desc, asc, round as spark_round
)
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


def load_clean_data(spark, dataset_name='country'):
    """Load preprocessed data"""
    input_path = PROCESSED_DATA_DIR / f"{dataset_name}_clean.parquet"
    
    if not input_path.exists():
        print(f"✗ Cleaned data not found: {input_path}")
        print(f"  Run preprocess_data.py first")
        return None
    
    return spark.read.parquet(str(input_path))


def mapreduce_1_avg_temp_by_country(spark, df):
    """
    MapReduce #1: Average Temperature by Country
    Map: (Country) -> (temp, 1)
    Reduce: Aggregate sum, count, min, max
    Finalize: Calculate average
    """
    print("\n" + "="*60)
    print("MapReduce #1: Average Temperature by Country")
    print("="*60)
    
    result = df.groupBy("Country").agg(
        spark_round(avg("AverageTemperature"), 2).alias("average"),
        spark_round(spark_min("AverageTemperature"), 2).alias("min"),
        spark_round(spark_max("AverageTemperature"), 2).alias("max"),
        count("*").alias("count")
    ).orderBy(desc("average"))
    
    # Save result
    output_path = MAPREDUCE_OUTPUTS['avg_temp_by_country']
    result.write.mode("overwrite").parquet(output_path)
    
    total_countries = result.count()
    print(f"✓ MapReduce completed")
    print(f"Total countries: {total_countries}")
    
    print(f"\nTop 5 warmest countries:")
    result.show(5, truncate=False)
    
    print(f"\nTop 5 coldest countries:")
    result.orderBy(asc("average")).show(5, truncate=False)
    
    print(f"✓ Saved to: {output_path}")
    return result


def mapreduce_2_temp_trends_by_year(spark, df):
    """
    MapReduce #2: Temperature Trends by Year
    Map: (Year) -> (temp, 1)
    Reduce: Aggregate by year
    """
    print("\n" + "="*60)
    print("MapReduce #2: Temperature Trends by Year")
    print("="*60)
    
    result = df.groupBy("year").agg(
        spark_round(avg("AverageTemperature"), 2).alias("average_temp"),
        spark_round(spark_min("AverageTemperature"), 2).alias("min_temp"),
        spark_round(spark_max("AverageTemperature"), 2).alias("max_temp"),
        count("*").alias("record_count")
    ).orderBy("year")
    
    # Save result
    output_path = MAPREDUCE_OUTPUTS['temp_trends_by_year']
    result.write.mode("overwrite").parquet(output_path)
    
    total_years = result.count()
    print(f"✓ MapReduce completed")
    print(f"Total years: {total_years}")
    
    print(f"\nSample trends (first 10 years):")
    result.show(10, truncate=False)
    
    print(f"✓ Saved to: {output_path}")
    return result


def mapreduce_3_seasonal_analysis(spark, df):
    """
    MapReduce #3: Seasonal Analysis
    Map: (Season) -> (temp, 1)
    Reduce: Aggregate by season
    """
    print("\n" + "="*60)
    print("MapReduce #3: Seasonal Analysis")
    print("="*60)
    
    result = df.groupBy("season").agg(
        spark_round(avg("AverageTemperature"), 2).alias("average_temp"),
        spark_round(spark_min("AverageTemperature"), 2).alias("min_temp"),
        spark_round(spark_max("AverageTemperature"), 2).alias("max_temp"),
        count("*").alias("record_count")
    ).orderBy("season")
    
    # Save result
    output_path = MAPREDUCE_OUTPUTS['seasonal_analysis']
    result.write.mode("overwrite").parquet(output_path)
    
    print(f"✓ MapReduce completed")
    print(f"\nSeasonal averages:")
    result.show(truncate=False)
    
    print(f"✓ Saved to: {output_path}")
    return result


def mapreduce_4_extreme_temps(spark, df):
    """
    MapReduce #4: Extreme Temperature Records
    Find hottest and coldest records
    """
    print("\n" + "="*60)
    print("MapReduce #4: Extreme Temperature Records")
    print("="*60)
    
    # Get top 10 warmest records
    warmest = df.select("dt", "Country", "AverageTemperature") \
        .orderBy(desc("AverageTemperature")) \
        .limit(10)
    
    # Get top 10 coldest records
    coldest = df.select("dt", "Country", "AverageTemperature") \
        .orderBy(asc("AverageTemperature")) \
        .limit(10)
    
    # Combine results
    result = warmest.union(coldest.withColumn("type", col("AverageTemperature") * 0 + 1))
    
    # Save result
    output_path = MAPREDUCE_OUTPUTS['extreme_temps']
    result.write.mode("overwrite").parquet(output_path)
    
    print(f"✓ MapReduce completed")
    print(f"\nTop 10 warmest records:")
    warmest.show(10, truncate=False)
    
    print(f"\nTop 10 coldest records:")
    coldest.show(10, truncate=False)
    
    print(f"✓ Saved to: {output_path}")
    return result


def mapreduce_5_decade_analysis(spark, df):
    """
    MapReduce #5: Temperature Analysis by Decade
    Map: (Decade) -> (temp, 1)
    Reduce: Aggregate by decade
    """
    print("\n" + "="*60)
    print("MapReduce #5: Decade Analysis")
    print("="*60)
    
    result = df.groupBy("decade").agg(
        spark_round(avg("AverageTemperature"), 2).alias("average_temp"),
        spark_round(spark_min("AverageTemperature"), 2).alias("min_temp"),
        spark_round(spark_max("AverageTemperature"), 2).alias("max_temp"),
        count("*").alias("record_count")
    ).orderBy("decade")
    
    # Save result
    output_path = MAPREDUCE_OUTPUTS['decade_analysis']
    result.write.mode("overwrite").parquet(output_path)
    
    total_decades = result.count()
    print(f"✓ MapReduce completed")
    print(f"Total decades: {total_decades}")
    
    print(f"\nDecade analysis:")
    result.show(20, truncate=False)
    
    print(f"✓ Saved to: {output_path}")
    return result


def mapreduce_6_records_by_country(spark, df):
    """
    MapReduce #6: Record Count by Country
    Map: (Country) -> 1
    Reduce: Count records per country
    """
    print("\n" + "="*60)
    print("MapReduce #6: Record Count by Country")
    print("="*60)
    
    result = df.groupBy("Country").agg(
        count("*").alias("record_count")
    ).orderBy(desc("record_count"))
    
    # Save result
    output_path = MAPREDUCE_OUTPUTS['records_by_country']
    result.write.mode("overwrite").parquet(output_path)
    
    total_countries = result.count()
    print(f"✓ MapReduce completed")
    print(f"Total countries: {total_countries}")
    
    print(f"\nTop 10 countries by record count:")
    result.show(10, truncate=False)
    
    print(f"✓ Saved to: {output_path}")
    return result


def main():
    """Main execution function"""
    print("\n" + "="*70)
    print("PYSPARK MAPREDUCE OPERATIONS - CLIMATE ANALYSIS PROJECT")
    print("="*70)
    
    # Create Spark session
    print("\nInitializing Spark session...")
    spark = create_spark_session()
    print(f"✓ Spark session created")
    
    # Load cleaned data
    print("\nLoading preprocessed data...")
    df = load_clean_data(spark, 'country')
    
    if df is None:
        print("\n✗ Failed to load data. Exiting.")
        spark.stop()
        return 1
    
    record_count = df.count()
    print(f"✓ Loaded {record_count:,} records")
    
    # Run all MapReduce operations
    print("\n" + "="*70)
    print("RUNNING ALL MAPREDUCE OPERATIONS")
    print("="*70)
    
    try:
        # MapReduce 1: Average temperature by country
        mapreduce_1_avg_temp_by_country(spark, df)
        
        # MapReduce 2: Temperature trends by year
        mapreduce_2_temp_trends_by_year(spark, df)
        
        # MapReduce 3: Seasonal analysis
        mapreduce_3_seasonal_analysis(spark, df)
        
        # MapReduce 4: Extreme temperatures
        mapreduce_4_extreme_temps(spark, df)
        
        # MapReduce 5: Decade analysis
        mapreduce_5_decade_analysis(spark, df)
        
        # MapReduce 6: Records by country
        mapreduce_6_records_by_country(spark, df)
        
        print("\n" + "="*70)
        print("✅ ALL MAPREDUCE OPERATIONS COMPLETED SUCCESSFULLY")
        print("="*70)
        print(f"\nResults saved to: {MAPREDUCE_RESULTS_DIR}")
        print("\nYou can now run:")
        print("  - python scripts/visualize_data.py (to create charts)")
        print("  - View Spark UI at: http://localhost:4040 (while running)")
        
    except Exception as e:
        print(f"\n✗ Error during MapReduce operations: {e}")
        import traceback
        traceback.print_exc()
        spark.stop()
        return 1
    
    # Stop Spark session
    spark.stop()
    print("\n✓ Spark session stopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
