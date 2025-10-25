#!/usr/bin/env python3
"""
Master Pipeline: Process All 5 Datasets Through Complete PySpark Pipeline
Executes: Load → Preprocess → MapReduce for all datasets
"""

import sys
import os
import time
import subprocess
from pathlib import Path
from datetime import datetime


def print_header(title, char="="):
    """Print formatted section header"""
    length = 75
    print(f"\n{char * length}")
    print(f"  {title}")
    print(f"{char * length}\n")


def print_section(title, char="-"):
    """Print formatted subsection"""
    print(f"\n{char * 75}")
    print(f"  {title}")
    print(f"{char * 75}\n")


def run_script(script_path, script_name):
    """
    Run a Python script
    
    Args:
        script_path: Path to script file
        script_name: Name of script for display
    
    Returns:
        True if successful, False otherwise
    """
    print(f"▶️  Running: {script_name}...\n")
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=3600  # 1 hour timeout
        )
        
        # Print output
        if result.stdout:
            print(result.stdout)
        
        if result.returncode == 0:
            print(f"✅ {script_name} completed successfully\n")
            return True
        else:
            print(f"❌ {script_name} failed")
            if result.stderr:
                print(f"Error: {result.stderr}\n")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"❌ {script_name} timed out (>1 hour)\n")
        return False
    except Exception as e:
        print(f"❌ Error running {script_name}: {str(e)}\n")
        return False


def main():
    """Main pipeline execution"""
    print_header("🚀 PYSPARK BATCH PIPELINE - ALL 5 DATASETS")
    
    # Get script directory
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    
    print("📊 Pipeline Configuration:")
    print("   Datasets to process: 5 (Country, City, Major City, State, Global)")
    print("   Steps per dataset: 3 (Load → Preprocess → MapReduce)")
    print("   Total operations: 18 (3 scripts × 5 datasets)")
    print("   Expected duration: 20-30 minutes\n")
    
    print("🔧 System Check:")
    print(f"   Backend directory: {backend_dir}")
    print(f"   Script directory: {script_dir}")
    print(f"   Python executable: {sys.executable}\n")
    
    # Confirm start
    response = input("Ready to start the pipeline? (yes/no): ").strip().lower()
    if response not in ['yes', 'y']:
        print("Pipeline cancelled.\n")
        sys.exit(0)
    
    start_time = time.time()
    
    print_header("PIPELINE EXECUTION START", "=")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Step 1: Batch Load All Datasets
    print_section("STEP 1: BATCH LOAD - CSV → PARQUET (All Datasets)")
    
    batch_load_script = script_dir / "batch_load_all.py"
    if not batch_load_script.exists():
        print(f"❌ Script not found: {batch_load_script}")
        sys.exit(1)
    
    if not run_script(batch_load_script, "Batch Load All"):
        print("❌ Pipeline failed at batch load stage")
        sys.exit(1)
    
    # Step 2: Batch Preprocess All Datasets
    print_section("STEP 2: BATCH PREPROCESS - CLEAN & TRANSFORM (All Datasets)")
    
    batch_preprocess_script = script_dir / "batch_preprocess_all.py"
    if not batch_preprocess_script.exists():
        print(f"❌ Script not found: {batch_preprocess_script}")
        sys.exit(1)
    
    if not run_script(batch_preprocess_script, "Batch Preprocess All"):
        print("❌ Pipeline failed at preprocessing stage")
        sys.exit(1)
    
    # Step 3: Batch MapReduce All Datasets
    print_section("STEP 3: BATCH MAPREDUCE - 6 OPERATIONS PER DATASET")
    
    batch_mapreduce_script = script_dir / "batch_mapreduce_all.py"
    if not batch_mapreduce_script.exists():
        print(f"❌ Script not found: {batch_mapreduce_script}")
        sys.exit(1)
    
    if not run_script(batch_mapreduce_script, "Batch MapReduce All"):
        print("❌ Pipeline failed at MapReduce stage")
        sys.exit(1)
    
    # Final summary
    end_time = time.time()
    total_time = end_time - start_time
    
    print_header("✅ PIPELINE EXECUTION COMPLETE", "=")
    
    print(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total execution time: {total_time:.2f} seconds ({total_time/60:.2f} minutes)\n")
    
    print("📊 RESULTS SUMMARY:")
    print("   ✅ All 5 datasets loaded as Parquet")
    print("   ✅ All 5 datasets preprocessed and cleaned")
    print("   ✅ All 6 MapReduce operations executed per dataset")
    print(f"   ✅ Total operations: 30 (6 ops × 5 datasets)\n")
    
    print("📁 Output Directory Structure:")
    print("   backend/output/processed_data/")
    print("       ├── country_raw/")
    print("       ├── country_clean/")
    print("       ├── city_raw/")
    print("       ├── city_clean/")
    print("       ├── major_city_raw/")
    print("       ├── major_city_clean/")
    print("       ├── state_raw/")
    print("       ├── state_clean/")
    print("       ├── global_raw/")
    print("       └── global_clean/\n")
    
    print("   backend/output/mapreduce_results/")
    print("       ├── country/")
    print("       │   ├── op1_avg_temp_by_country/")
    print("       │   ├── op2_temp_trends_by_year/")
    print("       │   ├── op3_seasonal_analysis/")
    print("       │   ├── op4_extreme_temps/")
    print("       │   ├── op5_decade_analysis/")
    print("       │   └── op6_records_by_country/")
    print("       ├── city/")
    print("       ├── major_city/")
    print("       ├── state/")
    print("       └── global/\n")
    
    print("🎯 Next Steps:")
    print("   1. Review output Parquet files in:")
    print("      backend/output/processed_data/")
    print("      backend/output/mapreduce_results/\n")
    print("   2. Create visualization script to read from Parquet files\n")
    print("   3. Generate analytics reports from MapReduce results\n")
    print("   4. Integrate results into web dashboard\n")
    
    print("📊 Spark Monitoring:")
    print("   During execution, monitor Spark jobs at:")
    print("   http://localhost:4040\n")
    
    print("="*75)
    print("✅ ALL DATASETS SUCCESSFULLY PROCESSED!")
    print("="*75 + "\n")
    
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n❌ Pipeline interrupted by user\n")
        sys.exit(1)
