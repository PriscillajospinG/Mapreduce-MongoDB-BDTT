"""
Main Orchestrator Script for MongoDB Climate Analysis Project
Runs the entire pipeline: Upload → Preprocess → MapReduce → Visualize
"""
import os
import sys
import time
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.upload_dataset import DatasetUploader
from scripts.preprocess_data import DataPreprocessor
from scripts.mapreduce_operations import MapReduceAnalyzer
from scripts.visualize_data import DataVisualizer


class PipelineOrchestrator:
    """Orchestrates the entire data analysis pipeline"""
    
    def __init__(self):
        """Initialize the orchestrator"""
        self.start_time = None
        self.steps_completed = []
        self.steps_failed = []
    
    def print_banner(self):
        """Print project banner"""
        banner = """
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║         MAPREDUCE MONGODB CLIMATE ANALYSIS PROJECT                  ║
║                                                                      ║
║         Big Data Technologies - MongoDB & MapReduce                 ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
        """
        print(banner)
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*72 + "\n")
    
    def print_step(self, step_num, step_name):
        """Print step header"""
        print("\n" + "╔" + "="*70 + "╗")
        print(f"║  STEP {step_num}: {step_name:<59} ║")
        print("╚" + "="*70 + "╝\n")
    
    def run_step(self, step_num, step_name, func):
        """
        Run a pipeline step with error handling
        
        Args:
            step_num: Step number
            step_name: Step description
            func: Function to execute
        
        Returns:
            bool: Success status
        """
        self.print_step(step_num, step_name)
        step_start = time.time()
        
        try:
            result = func()
            step_time = time.time() - step_start
            
            self.steps_completed.append({
                'step': step_name,
                'time': step_time
            })
            
            print(f"\n✓ {step_name} completed in {step_time:.2f} seconds")
            return True
            
        except Exception as e:
            step_time = time.time() - step_start
            
            self.steps_failed.append({
                'step': step_name,
                'error': str(e),
                'time': step_time
            })
            
            print(f"\n✗ {step_name} failed after {step_time:.2f} seconds")
            print(f"Error: {e}")
            
            import traceback
            traceback.print_exc()
            
            return False
    
    def run_full_pipeline(self):
        """Execute the complete data analysis pipeline"""
        self.start_time = time.time()
        self.print_banner()
        
        # Step 1: Upload Datasets
        def upload_step():
            uploader = DatasetUploader()
            try:
                return uploader.upload_all()
            finally:
                uploader.close()
        
        if not self.run_step(1, "Upload Datasets to MongoDB", upload_step):
            print("\n⚠ Pipeline halted due to upload failure")
            return False
        
        # Step 2: Preprocess Data
        def preprocess_step():
            preprocessor = DataPreprocessor()
            try:
                preprocessor.preprocess_all()
                return True
            finally:
                preprocessor.close()
        
        if not self.run_step(2, "Preprocess & Clean Data", preprocess_step):
            print("\n⚠ Warning: Preprocessing failed, continuing anyway...")
        
        # Step 3: Run MapReduce Operations
        def mapreduce_step():
            analyzer = MapReduceAnalyzer()
            try:
                analyzer.run_all_mapreduce()
                return True
            finally:
                analyzer.close()
        
        if not self.run_step(3, "Execute MapReduce Operations", mapreduce_step):
            print("\n⚠ Pipeline halted due to MapReduce failure")
            return False
        
        # Step 4: Generate Visualizations
        def visualize_step():
            visualizer = DataVisualizer()
            visualizer.generate_all_visualizations()
            return True
        
        if not self.run_step(4, "Generate Visualizations", visualize_step):
            print("\n⚠ Warning: Visualization failed")
        
        return True
    
    def print_summary(self):
        """Print pipeline execution summary"""
        total_time = time.time() - self.start_time
        
        print("\n" + "╔" + "="*70 + "╗")
        print("║" + " "*25 + "PIPELINE SUMMARY" + " "*29 + "║")
        print("╚" + "="*70 + "╝\n")
        
        print(f"Total Execution Time: {total_time:.2f} seconds ({total_time/60:.2f} minutes)")
        print(f"\nSteps Completed: {len(self.steps_completed)}")
        for step in self.steps_completed:
            print(f"  ✓ {step['step']:<45} {step['time']:>8.2f}s")
        
        if self.steps_failed:
            print(f"\nSteps Failed: {len(self.steps_failed)}")
            for step in self.steps_failed:
                print(f"  ✗ {step['step']:<45} {step['time']:>8.2f}s")
                print(f"    Error: {step['error']}")
        
        print("\n" + "="*72)
        
        if len(self.steps_completed) >= 3:  # At least upload, mapreduce, and one other
            print("\n🎉 PIPELINE COMPLETED SUCCESSFULLY! 🎉\n")
            print("Next Steps:")
            print("  1. Check the output/reports/ folder for MapReduce results (JSON)")
            print("  2. Check the output/charts/ folder for visualizations (PNG & HTML)")
            print("  3. Open the interactive HTML charts in your browser")
            print()
        else:
            print("\n⚠ PIPELINE COMPLETED WITH ERRORS ⚠\n")
            print("Please review the error messages above and try again.")
            print()


def run_individual_step(step_name):
    """
    Run a single pipeline step
    
    Args:
        step_name: One of 'upload', 'preprocess', 'mapreduce', 'visualize'
    """
    print(f"\nRunning single step: {step_name}\n")
    
    if step_name == 'upload':
        uploader = DatasetUploader()
        try:
            uploader.upload_all()
        finally:
            uploader.close()
    
    elif step_name == 'preprocess':
        preprocessor = DataPreprocessor()
        try:
            preprocessor.preprocess_all()
        finally:
            preprocessor.close()
    
    elif step_name == 'mapreduce':
        analyzer = MapReduceAnalyzer()
        try:
            analyzer.run_all_mapreduce()
        finally:
            analyzer.close()
    
    elif step_name == 'visualize':
        visualizer = DataVisualizer()
        visualizer.generate_all_visualizations()
    
    else:
        print(f"✗ Unknown step: {step_name}")
        print("Available steps: upload, preprocess, mapreduce, visualize")
        return 1
    
    print(f"\n✓ Step '{step_name}' completed successfully!\n")
    return 0


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='MongoDB Climate Analysis Pipeline',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run the full pipeline
  python main.py
  
  # Run only the upload step
  python main.py --step upload
  
  # Run only MapReduce operations
  python main.py --step mapreduce
  
  # Run only visualizations
  python main.py --step visualize
        """
    )
    
    parser.add_argument(
        '--step',
        choices=['upload', 'preprocess', 'mapreduce', 'visualize'],
        help='Run a specific pipeline step instead of the full pipeline'
    )
    
    args = parser.parse_args()
    
    try:
        if args.step:
            # Run individual step
            return run_individual_step(args.step)
        else:
            # Run full pipeline
            orchestrator = PipelineOrchestrator()
            success = orchestrator.run_full_pipeline()
            orchestrator.print_summary()
            
            return 0 if success else 1
    
    except KeyboardInterrupt:
        print("\n\n✗ Pipeline interrupted by user\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
