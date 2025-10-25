"""
PySpark Data Loader Script
Loads CSV datasets into Spark DataFrames and saves as Parquet
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
    
    # Set log level
    spark.sparkContext.setLogLevel(LOG_LEVEL)
    
    return spark


def load_dataset(spark, dataset_name, file_path):
    """
    Load a single CSV dataset into Spark DataFrame
    
    Args:
        spark: SparkSession
        dataset_name: Name of dataset (e.g., 'country', 'city')
        file_path: Path to CSV file
    
    Returns:
        DataFrame or None if failed
    """
    print(f"\n{'='*60}")
    print(f"Loading {dataset_name.upper()} dataset...")
    print(f"{'='*60}")
    
    if not os.path.exists(file_path):
        print(f"✗ File not found: {file_path}")
        return None
    
    try:
        # Read CSV with header and infer schema
        df = spark.read.csv(
            file_path,
            header=True,
            inferSchema=True
        )
        
        total_records = df.count()
        print(f"✓ Loaded {total_records:,} records from CSV")
        
        # Show schema
        print(f"\nSchema:")
        df.printSchema()
        
        # Show sample data
        print(f"\nSample data (first 5 rows):")
        df.show(5, truncate=False)
        
        return df
        
    except Exception as e:
        print(f"✗ Error loading dataset: {e}")
        return None


def save_as_parquet(df, dataset_name):
    """
    Save DataFrame as Parquet format
    
    Args:
        df: Spark DataFrame
        dataset_name: Name for output file
    """
    output_path = PROCESSED_DATA_DIR / f"{dataset_name}.parquet"
    
    print(f"\nSaving to Parquet format...")
    print(f"Output: {output_path}")
    
    df.write.mode("overwrite").parquet(str(output_path))
    
    print(f"✓ Saved as Parquet")


def main():
    """Main execution function"""
    print("\n" + "="*70)
    print("PYSPARK DATA LOADER - CLIMATE ANALYSIS PROJECT")
    print("="*70)
    
    # Create Spark session
    print("\nInitializing Spark session...")
    spark = create_spark_session()
    print(f"✓ Spark session created")
    print(f"  - App name: {SPARK_APP_NAME}")
    print(f"  - Master: {SPARK_MASTER}")
    print(f"  - Driver memory: {SPARK_DRIVER_MEMORY}")
    
    # Show menu
    print("\n" + "="*60)
    print("SELECT DATASET TO LOAD")
    print("="*60)
    print("\nAvailable datasets:")
    
    datasets = list(DATASET_PATHS.keys())
    for i, dataset_name in enumerate(datasets, 1):
        print(f"  {i}. {dataset_name}")
    print(f"  {len(datasets) + 1}. Load ALL datasets")
    
    # Get user choice
    choice = input(f"\nEnter your choice (1-{len(datasets) + 1}): ").strip()
    
    try:
        choice_num = int(choice)
        
        if choice_num == len(datasets) + 1:
            # Load all datasets
            print("\nLoading ALL datasets...")
            for dataset_name, file_path in DATASET_PATHS.items():
                df = load_dataset(spark, dataset_name, file_path)
                if df:
                    save_as_parquet(df, dataset_name)
            
            print(f"\n{'='*60}")
            print("✓ ALL DATASETS LOADED SUCCESSFULLY")
            print(f"{'='*60}\n")
            
        elif 1 <= choice_num <= len(datasets):
            # Load single dataset
            dataset_name = datasets[choice_num - 1]
            file_path = DATASET_PATHS[dataset_name]
            
            df = load_dataset(spark, dataset_name, file_path)
            
            if df:
                save_as_parquet(df, dataset_name)
                print(f"\n✓ Dataset '{dataset_name}' loaded successfully!")
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
        spark.stop()
        return 1
    
    # Stop Spark session
    spark.stop()
    print("\n✓ Spark session stopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
