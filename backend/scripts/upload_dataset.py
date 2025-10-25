"""
Dataset Upload Script for MongoDB Climate Analysis
Loads CSV datasets into MongoDB collections with progress tracking
"""
import os
import sys
import pandas as pd
from pymongo import MongoClient
from tqdm import tqdm

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import MONGO_URI, DATABASE_NAME, COLLECTIONS, DATASET_PATHS


class DatasetUploader:
    """Handles uploading CSV datasets to MongoDB"""
    
    def __init__(self):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DATABASE_NAME]
            print(f"✓ Connected to MongoDB: {DATABASE_NAME}")
        except Exception as e:
            print(f"✗ Failed to connect to MongoDB: {e}")
            sys.exit(1)
    
    def upload_dataset(self, dataset_type, file_path, collection_name, batch_size=5000):
        """
        Upload a single dataset to MongoDB
        
        Args:
            dataset_type: Type of dataset (e.g., 'country', 'city')
            file_path: Path to CSV file
            collection_name: MongoDB collection name
            batch_size: Number of records to insert at once
        """
        print(f"\n{'='*60}")
        print(f"Uploading {dataset_type.upper()} dataset...")
        print(f"{'='*60}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"✗ File not found: {file_path}")
            return False
        
        try:
            # Read CSV file
            print(f"Reading CSV file: {file_path}")
            df = pd.read_csv(file_path)
            total_records = len(df)
            print(f"✓ Loaded {total_records:,} records from CSV")
            
            # Basic cleaning: remove rows with missing temperature values
            if 'AverageTemperature' in df.columns:
                df = df.dropna(subset=['AverageTemperature'])
                print(f"✓ Removed {total_records - len(df):,} records with missing temperatures")
            
            # Convert date column to string (MongoDB friendly)
            if 'dt' in df.columns:
                df['dt'] = df['dt'].astype(str)
            
            # Convert to records
            records = df.to_dict(orient='records')
            
            # Get collection
            collection = self.db[collection_name]
            
            # Clear existing data
            collection.delete_many({})
            print(f"✓ Cleared existing data in collection '{collection_name}'")
            
            # Insert in batches with progress bar
            print(f"Inserting {len(records):,} records into MongoDB...")
            for i in tqdm(range(0, len(records), batch_size), desc="Progress"):
                batch = records[i:i + batch_size]
                collection.insert_many(batch)
            
            # Verify insertion
            count = collection.count_documents({})
            print(f"✓ Successfully inserted {count:,} records into '{collection_name}'")
            
            # Create indexes for better query performance
            if 'dt' in df.columns:
                collection.create_index('dt')
            if 'Country' in df.columns:
                collection.create_index('Country')
            if 'City' in df.columns:
                collection.create_index('City')
            print(f"✓ Created indexes for optimized queries")
            
            return True
            
        except Exception as e:
            print(f"✗ Error uploading {dataset_type} dataset: {e}")
            return False
    
    def upload_all(self):
        """Upload all datasets"""
        print("\n" + "="*60)
        print("MONGODB DATASET UPLOAD - CLIMATE ANALYSIS PROJECT")
        print("="*60)
        
        success_count = 0
        total_count = len(DATASET_PATHS)
        
        for dataset_type, file_path in DATASET_PATHS.items():
            collection_name = COLLECTIONS.get(dataset_type)
            if collection_name:
                # Convert relative path to absolute
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                abs_path = os.path.join(base_dir, file_path.replace('../', ''))
                
                if self.upload_dataset(dataset_type, abs_path, collection_name):
                    success_count += 1
        
        print(f"\n{'='*60}")
        print(f"UPLOAD SUMMARY: {success_count}/{total_count} datasets uploaded successfully")
        print(f"{'='*60}\n")
        
        return success_count == total_count
    
    def close(self):
        """Close MongoDB connection"""
        self.client.close()
        print("✓ MongoDB connection closed")


def main():
    """Main execution function"""
    uploader = DatasetUploader()
    
    try:
        # Show menu
        print("\n" + "="*60)
        print("SELECT DATASET TO UPLOAD")
        print("="*60)
        print("\nAvailable datasets:")
        
        datasets = list(DATASET_PATHS.keys())
        for i, dataset_type in enumerate(datasets, 1):
            print(f"  {i}. {dataset_type}")
        print(f"  {len(datasets) + 1}. Upload ALL datasets")
        
        # Get user choice
        choice = input(f"\nEnter your choice (1-{len(datasets) + 1}): ").strip()
        
        try:
            choice_num = int(choice)
            
            if choice_num == len(datasets) + 1:
                # Upload all datasets
                success = uploader.upload_all()
                if success:
                    print("✓ All datasets uploaded successfully!")
                    return 0
                else:
                    print("✗ Some datasets failed to upload")
                    return 1
            elif 1 <= choice_num <= len(datasets):
                # Upload single dataset
                dataset_type = datasets[choice_num - 1]
                file_path = DATASET_PATHS[dataset_type]
                collection_name = COLLECTIONS.get(dataset_type)
                
                # Convert relative path to absolute
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                abs_path = os.path.join(base_dir, file_path.replace('../', ''))
                
                success = uploader.upload_dataset(dataset_type, abs_path, collection_name)
                
                if success:
                    print(f"\n✓ Dataset '{dataset_type}' uploaded successfully!")
                    return 0
                else:
                    print(f"\n✗ Failed to upload dataset '{dataset_type}'")
                    return 1
            else:
                print(f"✗ Invalid choice. Please enter a number between 1 and {len(datasets) + 1}")
                return 1
                
        except ValueError:
            print("✗ Invalid input. Please enter a number.")
            return 1
            
    except KeyboardInterrupt:
        print("\n\n✗ Upload interrupted by user")
        return 1
    finally:
        uploader.close()


if __name__ == "__main__":
    sys.exit(main())