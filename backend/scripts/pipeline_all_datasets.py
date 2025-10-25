#!/usr/bin/env python3
"""
Master Pipeline Runner for All Datasets
Processes all 5 datasets through the complete PySpark pipeline:
1. Load CSV files
2. Preprocess data
3. Run MapReduce operations
"""

import os
import sys
import time
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PROCESSED_DATA_DIR, MAPREDUCE_RESULTS_DIR, DATASETS
import subprocess

# Dataset IDs to process
DATASET_IDS = {
    1: "Country",
    2: "City",
    3: "Major City",
    4: "State",
    5: "Global"
}

def print_header(title):
    """Print formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")

def print_success(message):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print error message"""
    print(f"❌ {message}")

def print_info(message):
    """Print info message"""
    print(f"ℹ️  {message}")

def run_python_script(script_name, dataset_id, description):
    """Run a Python script with specified dataset ID"""
    script_path = Path(__file__).parent / script_name
    
    print_info(f"Running {description}...")
    print(f"   Command: python {script_name} (option: {dataset_id})\n")
    
    try:
        # Run script with automated input
        process = subprocess.Popen(
            [sys.executable, str(script_path)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Send dataset choice
        stdout, stderr = process.communicate(input=f"{dataset_id}\n", timeout=600)
        
        if process.returncode == 0:
            print_success(f"{description} completed")
            if stdout:
                # Print last 10 lines of output
                lines = stdout.strip().split('\n')
                for line in lines[-10:]:
                    print(f"   {line}")
            return True
        else:
            print_error(f"{description} failed")
            if stderr:
                print(f"   Error: {stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print_error(f"{description} timed out (>10 minutes)")
        process.kill()
        return False
    except Exception as e:
        print_error(f"{description} failed: {str(e)}")
        return False

def process_dataset(dataset_id, dataset_name):
    """Process a single dataset through the entire pipeline"""
    print_header(f"Processing Dataset {dataset_id}: {dataset_name}")
    
    print_info(f"Starting full pipeline for {dataset_name} dataset\n")
    
    # Step 1: Load data
    print("\n" + "-"*70)
    print("STEP 1: LOAD DATA (CSV → Parquet)")
    print("-"*70)
    if not run_python_script("load_data.py", dataset_id, f"Loading {dataset_name} dataset"):
        return False
    time.sleep(2)
    
    # Step 2: Preprocess data
    print("\n" + "-"*70)
    print("STEP 2: PREPROCESS DATA (Clean & Transform)")
    print("-"*70)
    if not run_python_script("preprocess_data.py", dataset_id, f"Preprocessing {dataset_name} dataset"):
        return False
    time.sleep(2)
    
    # Step 3: MapReduce operations
    print("\n" + "-"*70)
    print("STEP 3: MAPREDUCE OPERATIONS (6 Analytics)")
    print("-"*70)
    print_info("Running all 6 MapReduce operations...\n")
    script_path = Path(__file__).parent / "mapreduce_operations.py"
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=600
        )
        
        if result.returncode == 0:
            print_success("All MapReduce operations completed")
            if result.stdout:
                lines = result.stdout.strip().split('\n')
                for line in lines[-15:]:
                    print(f"   {line}")
        else:
            print_error("MapReduce operations failed")
            if result.stderr:
                print(f"   Error: {result.stderr}")
            return False
    except Exception as e:
        print_error(f"MapReduce operations failed: {str(e)}")
        return False
    
    print_success(f"\n{dataset_name} dataset pipeline completed!\n")
    return True

def generate_summary_report():
    """Generate summary report of all results"""
    print_header("PIPELINE EXECUTION SUMMARY")
    
    print("📊 All datasets have been processed through PySpark pipeline:\n")
    
    results_dir = Path(MAPREDUCE_RESULTS_DIR)
    if results_dir.exists():
        parquet_files = list(results_dir.glob("**/*.parquet"))
        print(f"✅ Total output files generated: {len(parquet_files)}\n")
        
        print("Output Directory Structure:")
        print(f"📁 {MAPREDUCE_RESULTS_DIR}\n")
        
        # Show 6 operations per dataset
        operations = [
            "avg_temp_by_country",
            "temp_trends_by_year",
            "seasonal_analysis",
            "extreme_temps",
            "decade_analysis",
            "records_by_country"
        ]
        
        print("MapReduce Operations (6 per dataset):")
        for i, op in enumerate(operations, 1):
            print(f"   {i}. {op}")
    
    print("\n" + "="*70)
    print("✅ ALL DATASETS SUCCESSFULLY PROCESSED!")
    print("="*70)
    print("\n📊 Next Steps:")
    print("   1. Review output Parquet files in:", MAPREDUCE_RESULTS_DIR)
    print("   2. Create visualization script to read from Parquet files")
    print("   3. Generate reports from MapReduce results")
    print("   4. Monitor Spark UI at http://localhost:4040 during execution\n")

def main():
    """Main pipeline runner"""
    print_header("PYSPARK BATCH PROCESSING - ALL DATASETS")
    
    print("This script will process all 5 datasets through the PySpark pipeline:")
    print("   1. Load CSV files → Convert to Parquet")
    print("   2. Preprocess data → Clean and transform")
    print("   3. MapReduce operations → Run all 6 analytics\n")
    
    print("Datasets to process:")
    for dataset_id, dataset_name in DATASET_IDS.items():
        print(f"   {dataset_id}. {dataset_name}")
    
    # Confirm before starting
    response = input("\nProceed with processing all datasets? (yes/no): ").strip().lower()
    if response not in ['yes', 'y']:
        print_info("Pipeline cancelled by user")
        sys.exit(0)
    
    print_header("STARTING PIPELINE EXECUTION")
    
    start_time = time.time()
    successful_datasets = []
    failed_datasets = []
    
    # Process each dataset
    for dataset_id, dataset_name in DATASET_IDS.items():
        try:
            if process_dataset(dataset_id, dataset_name):
                successful_datasets.append(dataset_name)
            else:
                failed_datasets.append(dataset_name)
        except KeyboardInterrupt:
            print_error("\nPipeline interrupted by user")
            sys.exit(1)
        except Exception as e:
            print_error(f"Unexpected error processing {dataset_name}: {str(e)}")
            failed_datasets.append(dataset_name)
    
    # Generate final report
    end_time = time.time()
    total_time = end_time - start_time
    
    print_header("FINAL RESULTS")
    print(f"Total execution time: {total_time:.2f} seconds ({total_time/60:.2f} minutes)\n")
    
    print(f"✅ Successfully processed: {len(successful_datasets)}/{len(DATASET_IDS)}")
    for ds in successful_datasets:
        print(f"   ✓ {ds}")
    
    if failed_datasets:
        print(f"\n❌ Failed to process: {len(failed_datasets)}/{len(DATASET_IDS)}")
        for ds in failed_datasets:
            print(f"   ✗ {ds}")
    
    generate_summary_report()
    
    if failed_datasets:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
