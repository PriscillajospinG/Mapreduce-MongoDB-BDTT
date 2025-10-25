"""
Fetch MapReduce Results from MongoDB
Fetches results from MapReduce operations run in MongoDB shell
Run MapReduce first: mongosh < mongo_scripts/run_all.js
"""
import os
import sys
import json
from datetime import datetime
from pymongo import MongoClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import MONGO_URI, DATABASE_NAME, REPORTS_DIR


class MapReduceResultsFetcher:
    """Fetches and exports MapReduce results from MongoDB"""
    
    MR_COLLECTIONS = {
        'avg_temp_by_country': 'Average Temperature by Country',
        'temp_trends_by_year': 'Temperature Trends by Year',
        'seasonal_analysis': 'Seasonal Temperature Analysis',
        'extreme_temps': 'Extreme Temperature Records',
        'decade_analysis': 'Temperature by Decade',
        'records_by_country': 'Record Count by Country'
    }
    
    def __init__(self):
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DATABASE_NAME]
            print(f"Connected to MongoDB: {DATABASE_NAME}")
            os.makedirs(REPORTS_DIR, exist_ok=True)
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            sys.exit(1)
    
    def fetch_all_results(self):
        print("\nFETCHING MAPREDUCE RESULTS FROM MONGODB")
        print("=" * 60)
        
        for collection_name, description in self.MR_COLLECTIONS.items():
            self.fetch_results(collection_name, description)
    
    def fetch_results(self, collection_name, description):
        print(f"\n{description}")
        print(f"Collection: {collection_name}")
        print("-" * 60)
        
        if collection_name not in self.db.list_collection_names():
            print(f"Collection not found! Run: mongosh < mongo_scripts/run_all.js")
            return None
        
        collection = self.db[collection_name]
        results = list(collection.find())
        print(f"Fetched {len(results)} results")
        
        # Save to JSON
        filepath = os.path.join(REPORTS_DIR, f"{collection_name}.json")
        json_data = []
        for doc in results:
            if '_id' in doc:
                doc['_id'] = str(doc['_id']) if not isinstance(doc['_id'], (str, int)) else doc['_id']
            json_data.append(doc)
        
        with open(filepath, 'w') as f:
            json.dump(json_data, f, indent=2, default=str)
        
        print(f"Saved to: {collection_name}.json")
        return results
    
    def close(self):
        self.client.close()


def main():
    fetcher = MapReduceResultsFetcher()
    try:
        fetcher.fetch_all_results()
        print("\n" + "=" * 60)
        print("ALL RESULTS FETCHED SUCCESSFULLY!")
        print(f"Results saved to: {REPORTS_DIR}")
        return 0
    finally:
        fetcher.close()


if __name__ == "__main__":
    sys.exit(main())
