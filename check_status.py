#!/usr/bin/env python3
"""
Project Status Checker
Quick script to verify all components are ready
"""
import os
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

def check_file(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        print(f"  ✓ {description:<50} ({size:,} bytes)")
        return True
    else:
        print(f"  ✗ {description:<50} (MISSING)")
        return False

def main():
    print("\n" + "="*70)
    print("PROJECT STATUS CHECK")
    print("="*70 + "\n")
    
    project_root = Path(__file__).parent
    all_ok = True
    
    # Check datasets
    print("📁 Dataset Files:")
    dataset_dir = project_root / "Dataset"
    datasets = [
        "GlobalLandTemperaturesByCountry.csv",
        "GlobalLandTemperaturesByCity.csv",
        "GlobalLandTemperaturesByMajorCity.csv",
        "GlobalLandTemperaturesByState.csv",
        "GlobalTemperatures.csv"
    ]
    
    for dataset in datasets:
        if not check_file(dataset_dir / dataset, dataset):
            all_ok = False
    
    # Check backend files
    print("\n📝 Backend Files:")
    backend_files = [
        ("backend/main.py", "Main orchestrator"),
        ("backend/config.py", "Configuration"),
        ("backend/requirements.txt", "Dependencies"),
        ("backend/utils.py", "Utilities"),
        ("backend/scripts/upload_dataset.py", "Upload script"),
        ("backend/scripts/preprocess_data.py", "Preprocessing script"),
        ("backend/scripts/mapreduce_operations.py", "MapReduce script"),
        ("backend/scripts/visualize_data.py", "Visualization script"),
    ]
    
    for filepath, desc in backend_files:
        if not check_file(project_root / filepath, desc):
            all_ok = False
    
    # Check virtual environment
    print("\n🐍 Virtual Environment:")
    venv_dir = project_root / "venv"
    if venv_dir.exists():
        python_exe = venv_dir / "bin" / "python3"
        if python_exe.exists():
            print(f"  ✓ Virtual environment active")
        else:
            print(f"  ⚠ Virtual environment exists but Python not found")
            all_ok = False
    else:
        print(f"  ✗ Virtual environment not found")
        all_ok = False
    
    # Check MongoDB
    print("\n🗄️  MongoDB:")
    try:
        from pymongo import MongoClient
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
        client.server_info()
        print(f"  ✓ MongoDB is running and accessible")
        client.close()
    except ImportError:
        print(f"  ⚠ PyMongo not installed (run: pip install pymongo)")
        all_ok = False
    except Exception as e:
        print(f"  ✗ MongoDB not accessible: {e}")
        all_ok = False
    
    # Check output directories
    print("\n📊 Output Directories:")
    output_dirs = [
        "backend/output/reports",
        "backend/output/charts"
    ]
    
    for dir_path in output_dirs:
        full_path = project_root / dir_path
        if full_path.exists():
            files = list(full_path.glob("*"))
            print(f"  ✓ {dir_path:<40} ({len(files)} files)")
        else:
            print(f"  ⚠ {dir_path:<40} (will be created)")
    
    # Final summary
    print("\n" + "="*70)
    if all_ok:
        print("✓ ALL CHECKS PASSED - Project is ready to run!")
        print("\nRun the pipeline:")
        print("  cd backend")
        print("  python main.py")
    else:
        print("⚠ SOME CHECKS FAILED - Please review the issues above")
        print("\nTo fix issues:")
        print("  1. Run setup script: ./setup.sh")
        print("  2. Check QUICKSTART.md for manual setup")
    print("="*70 + "\n")
    
    return 0 if all_ok else 1

if __name__ == "__main__":
    sys.exit(main())
