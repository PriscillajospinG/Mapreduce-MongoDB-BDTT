"""
PySpark Data Preprocessing Script
Cleans and transforms data using Spark DataFrames
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, year, month, to_date, when, floor
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


def preprocess_dataset(spark, dataset_name):
    """
    Preprocess a single dataset
    
    Args:
        spark: SparkSession
        dataset_name: Name of dataset (e.g., 'country', 'city')
    
    Returns:
        Preprocessed DataFrame
    """
    print(f"\n{'='*60}")
    print(f"Preprocessing {dataset_name.upper()} dataset...")
    print(f"{'='*60}")
    
    # Read Parquet file
    input_path = PROCESSED_DATA_DIR / f"{dataset_name}.parquet"
    
    if not input_path.exists():
        print(f"✗ File not found: {input_path}")
        print(f"  Run load_data.py first to create Parquet files")
        return None
    
    df = spark.read.parquet(str(input_path))
    initial_count = df.count()
    print(f"Initial record count: {initial_count:,}")
    
    # Step 1: Remove records with missing temperature values
    print("\n1. Removing records with missing temperatures...")
    df_clean = df.filter(col("AverageTemperature").isNotNull())
    removed_null = initial_count - df_clean.count()
    print(f"   ✓ Removed {removed_null:,} records with null temperatures")
    
    # Step 2: Remove invalid temperature values
    print("\n2. Filtering invalid temperature values...")
    df_clean = df_clean.filter(
        (col("AverageTemperature") >= TEMPERATURE_THRESHOLD) &
        (col("AverageTemperature") <= MAX_TEMPERATURE)
    )
    removed_invalid = initial_count - removed_null - df_clean.count()
    print(f"   ✓ Removed {removed_invalid:,} records with invalid temperatures")
    print(f"     (< {TEMPERATURE_THRESHOLD}°C or > {MAX_TEMPERATURE}°C)")
    
    # Step 3: Extract year and month from date field
    print("\n3. Extracting year and month fields...")
    df_clean = df_clean.withColumn("year", year(col("dt")))
    df_clean = df_clean.withColumn("month", month(col("dt")))
    print(f"   ✓ Added 'year' and 'month' columns")
    
    # Step 4: Filter by year range
    print("\n4. Filtering by year range...")
    df_clean = df_clean.filter(
        (col("year") >= MIN_YEAR) &
        (col("year") <= MAX_YEAR)
    )
    removed_year = initial_count - removed_null - removed_invalid - df_clean.count()
    print(f"   ✓ Removed {removed_year:,} records outside year range")
    print(f"     ({MIN_YEAR} - {MAX_YEAR})")
    
    # Step 5: Add season column (for seasonal analysis)
    print("\n5. Adding season column...")
    df_clean = df_clean.withColumn("season",
        when((col("month") >= 3) & (col("month") <= 5), "Spring")
        .when((col("month") >= 6) & (col("month") <= 8), "Summer")
        .when((col("month") >= 9) & (col("month") <= 11), "Fall")
        .otherwise("Winter")
    )
    print(f"   ✓ Added 'season' column")
    
    # Step 6: Add decade column (for decade analysis)
    print("\n6. Adding decade column...")
    df_clean = df_clean.withColumn("decade", (floor(col("year") / 10) * 10))
    print(f"   ✓ Added 'decade' column")
    
    # Step 7: Remove duplicates
    print("\n7. Removing duplicate records...")
    
    # Determine duplicate keys based on dataset type
    if dataset_name == 'country':
        duplicate_keys = ["dt", "Country"]
    elif dataset_name in ['city', 'major_city']:
        duplicate_keys = ["dt", "Country", "City"]
    elif dataset_name == 'state':
        duplicate_keys = ["dt", "Country", "State"]
    else:  # global
        duplicate_keys = ["dt"]
    
    before_dedup = df_clean.count()
    df_clean = df_clean.dropDuplicates(duplicate_keys)
    removed_duplicates = before_dedup - df_clean.count()
    print(f"   ✓ Removed {removed_duplicates:,} duplicate records")
    
    # Final statistics
    final_count = df_clean.count()
    print(f"\n{'='*60}")
    print(f"PREPROCESSING SUMMARY")
    print(f"{'='*60}")
    print(f"Initial records:     {initial_count:,}")
    print(f"Final records:       {final_count:,}")
    print(f"Total removed:       {initial_count - final_count:,}")
    print(f"Retention rate:      {(final_count/initial_count*100):.2f}%")
    print(f"{'='*60}")
    
    # Show schema
    print(f"\nFinal Schema:")
    df_clean.printSchema()
    
    # Show sample
    print(f"\nSample preprocessed data:")
    df_clean.show(5, truncate=False)
    
    return df_clean


def save_preprocessed_data(df, dataset_name):
    """
    Save preprocessed DataFrame as Parquet
    
    Args:
        df: Preprocessed Spark DataFrame
        dataset_name: Name for output file
    """
    output_path = PROCESSED_DATA_DIR / f"{dataset_name}_clean.parquet"
    
    print(f"\nSaving preprocessed data...")
    print(f"Output: {output_path}")
    
    df.write.mode("overwrite").parquet(str(output_path))
    
    print(f"✓ Saved preprocessed data")


def main():
    """Main execution function"""
    print("\n" + "="*70)
    print("PYSPARK DATA PREPROCESSING - CLIMATE ANALYSIS PROJECT")
    print("="*70)
    
    # Create Spark session
    print("\nInitializing Spark session...")
    spark = create_spark_session()
    print(f"✓ Spark session created")
    
    # Show menu
    print("\n" + "="*60)
    print("SELECT DATASET TO PREPROCESS")
    print("="*60)
    print("\nAvailable datasets:")
    
    datasets = list(DATASET_PATHS.keys())
    for i, dataset_name in enumerate(datasets, 1):
        print(f"  {i}. {dataset_name}")
    print(f"  {len(datasets) + 1}. Preprocess ALL datasets")
    
    # Get user choice
    choice = input(f"\nEnter your choice (1-{len(datasets) + 1}): ").strip()
    
    try:
        choice_num = int(choice)
        
        if choice_num == len(datasets) + 1:
            # Preprocess all datasets
            print("\nPreprocessing ALL datasets...")
            for dataset_name in datasets:
                df = preprocess_dataset(spark, dataset_name)
                if df:
                    save_preprocessed_data(df, dataset_name)
            
            print(f"\n{'='*60}")
            print("✓ ALL DATASETS PREPROCESSED SUCCESSFULLY")
            print(f"{'='*60}\n")
            
        elif 1 <= choice_num <= len(datasets):
            # Preprocess single dataset
            dataset_name = datasets[choice_num - 1]
            df = preprocess_dataset(spark, dataset_name)
            
            if df:
                save_preprocessed_data(df, dataset_name)
                print(f"\n✓ Dataset '{dataset_name}' preprocessed successfully!")
        else:
            print(f"✗ Invalid choice. Please enter a number between 1 and {len(datasets) + 1}")
            spark.stop()
            return 1
            
    except ValueError:
        print("✗ Invalid input. Please enter a number.")
        spark.stop()
        return 1
    except Exception as e:
        print(f"✗ Error: {e}")
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
