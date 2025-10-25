"""
Data Preprocessing Script for MongoDB Climate Analysis
Cleans and validates data stored in MongoDB collections
"""
import os
import sys
from datetime import datetime
from pymongo import MongoClient
from tqdm import tqdm

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import MONGO_URI, DATABASE_NAME, COLLECTIONS, TEMPERATURE_THRESHOLD, MIN_YEAR, MAX_YEAR


class DataPreprocessor:
    """Handles data cleaning and preprocessing in MongoDB"""
    
    def __init__(self):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DATABASE_NAME]
            print(f"✓ Connected to MongoDB: {DATABASE_NAME}")
        except Exception as e:
            print(f"✗ Failed to connect to MongoDB: {e}")
            sys.exit(1)
    
    def preprocess_collection(self, collection_name):
        """
        Clean and preprocess a single collection
        
        Args:
            collection_name: Name of the MongoDB collection
        """
        print(f"\n{'='*60}")
        print(f"Preprocessing collection: {collection_name}")
        print(f"{'='*60}")
        
        collection = self.db[collection_name]
        initial_count = collection.count_documents({})
        print(f"Initial record count: {initial_count:,}")
        
        if initial_count == 0:
            print(f"⚠ Collection is empty, skipping...")
            return
        
        # Statistics
        stats = {
            'removed_invalid_temp': 0,
            'removed_invalid_date': 0,
            'removed_out_of_range': 0,
            'updated_date_format': 0,
            'added_year_field': 0,
            'added_month_field': 0
        }
        
        # Step 1: Remove records with invalid temperatures
        print("\n1. Removing invalid temperature records...")
        result = collection.delete_many({
            'AverageTemperature': {'$lt': TEMPERATURE_THRESHOLD}
        })
        stats['removed_invalid_temp'] = result.deleted_count
        print(f"   ✓ Removed {result.deleted_count:,} records with temperature < {TEMPERATURE_THRESHOLD}°C")
        
        # Step 2: Extract year and month from date field
        print("\n2. Extracting year and month fields...")
        cursor = collection.find({'dt': {'$exists': True}})
        
        bulk_operations = []
        for doc in tqdm(cursor, desc="   Processing", total=collection.count_documents({'dt': {'$exists': True}})):
            try:
                # Parse date string (format: YYYY-MM-DD)
                date_str = doc.get('dt', '')
                if date_str and len(date_str) >= 7:
                    year = int(date_str[:4])
                    month = int(date_str[5:7])
                    
                    # Update document with year and month fields
                    bulk_operations.append({
                        'filter': {'_id': doc['_id']},
                        'update': {
                            '$set': {
                                'year': year,
                                'month': month
                            }
                        }
                    })
                    stats['added_year_field'] += 1
                    stats['added_month_field'] += 1
                    
                    # Execute bulk operations in batches
                    if len(bulk_operations) >= 5000:
                        for op in bulk_operations:
                            collection.update_one(op['filter'], op['update'])
                        bulk_operations = []
                        
            except (ValueError, IndexError) as e:
                # Invalid date format, will be removed later
                pass
        
        # Execute remaining bulk operations
        if bulk_operations:
            for op in bulk_operations:
                collection.update_one(op['filter'], op['update'])
        
        print(f"   ✓ Added year/month fields to {stats['added_year_field']:,} records")
        
        # Step 3: Remove records with invalid dates or missing year field
        print("\n3. Removing records with invalid dates...")
        result = collection.delete_many({
            '$or': [
                {'year': {'$exists': False}},
                {'year': {'$lt': MIN_YEAR}},
                {'year': {'$gt': MAX_YEAR}},
                {'month': {'$lt': 1}},
                {'month': {'$gt': 12}}
            ]
        })
        stats['removed_invalid_date'] = result.deleted_count
        print(f"   ✓ Removed {result.deleted_count:,} records with invalid dates")
        
        # Step 4: Remove duplicate records (based on location and date)
        print("\n4. Removing duplicate records...")
        duplicates_removed = self._remove_duplicates(collection)
        print(f"   ✓ Removed {duplicates_removed:,} duplicate records")
        
        # Step 5: Add processed flag
        print("\n5. Marking records as preprocessed...")
        collection.update_many(
            {},
            {'$set': {'preprocessed': True, 'preprocessed_at': datetime.utcnow().isoformat()}}
        )
        print(f"   ✓ Marked all records as preprocessed")
        
        # Final count
        final_count = collection.count_documents({})
        removed_total = initial_count - final_count
        
        print(f"\n{'='*60}")
        print(f"PREPROCESSING SUMMARY - {collection_name}")
        print(f"{'='*60}")
        print(f"Initial records:           {initial_count:,}")
        print(f"Final records:             {final_count:,}")
        print(f"Total removed:             {removed_total:,}")
        print(f"Retention rate:            {(final_count/initial_count*100):.2f}%")
        print(f"{'='*60}\n")
        
        return stats
    
    def _remove_duplicates(self, collection):
        """Remove duplicate records from collection"""
        # Get sample document to determine key fields
        sample = collection.find_one()
        if not sample:
            return 0
        
        # Determine grouping fields based on collection type
        group_fields = ['dt']
        if 'Country' in sample:
            group_fields.append('Country')
        if 'City' in sample:
            group_fields.append('City')
        if 'State' in sample:
            group_fields.append('State')
        
        # Find duplicates using aggregation
        pipeline = [
            {
                '$group': {
                    '_id': {field: f'${field}' for field in group_fields},
                    'ids': {'$push': '$_id'},
                    'count': {'$sum': 1}
                }
            },
            {
                '$match': {
                    'count': {'$gt': 1}
                }
            }
        ]
        
        duplicates = list(collection.aggregate(pipeline))
        removed_count = 0
        
        # Remove duplicates, keep the first occurrence
        for dup in duplicates:
            ids_to_remove = dup['ids'][1:]  # Keep first, remove rest
            collection.delete_many({'_id': {'$in': ids_to_remove}})
            removed_count += len(ids_to_remove)
        
        return removed_count
    
    def preprocess_all(self):
        """Preprocess all collections"""
        print("\n" + "="*60)
        print("DATA PREPROCESSING - CLIMATE ANALYSIS PROJECT")
        print("="*60)
        
        for collection_name in COLLECTIONS.values():
            try:
                self.preprocess_collection(collection_name)
            except Exception as e:
                print(f"✗ Error preprocessing {collection_name}: {e}")
        
        print("\n✓ All collections preprocessed successfully!\n")
    
    def close(self):
        """Close MongoDB connection"""
        self.client.close()
        print("✓ MongoDB connection closed")


def main():
    """Main execution function"""
    preprocessor = DataPreprocessor()
    
    try:
        preprocessor.preprocess_all()
        return 0
    except KeyboardInterrupt:
        print("\n\n✗ Preprocessing interrupted by user")
        return 1
    finally:
        preprocessor.close()


if __name__ == "__main__":
    sys.exit(main())
