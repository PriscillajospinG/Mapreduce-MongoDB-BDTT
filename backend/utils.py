"""
Utility script for MongoDB database management
Provides helper functions for database operations
"""
import sys
import os
from pymongo import MongoClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import MONGO_URI, DATABASE_NAME, COLLECTIONS


def check_mongodb_connection():
    """Test MongoDB connection"""
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()
        print("✓ MongoDB connection successful")
        print(f"  URI: {MONGO_URI}")
        client.close()
        return True
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        return False


def get_database_stats():
    """Display database and collection statistics"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        
        print("\n" + "="*60)
        print(f"DATABASE: {DATABASE_NAME}")
        print("="*60)
        
        # Database stats
        stats = db.command("dbstats")
        print(f"\nDatabase Size: {stats['dataSize'] / (1024*1024):.2f} MB")
        print(f"Collections: {stats['collections']}")
        print(f"Indexes: {stats['indexes']}")
        
        # Collection stats
        print("\nCollection Details:")
        print(f"{'Collection Name':<30} {'Documents':<15} {'Size (MB)':<12}")
        print("-" * 60)
        
        for coll_name in COLLECTIONS.values():
            if coll_name in db.list_collection_names():
                coll = db[coll_name]
                count = coll.count_documents({})
                coll_stats = db.command("collstats", coll_name)
                size = coll_stats['size'] / (1024*1024)
                print(f"{coll_name:<30} {count:<15,} {size:<12.2f}")
        
        print("="*60 + "\n")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"✗ Error getting database stats: {e}")
        return False


def clear_database():
    """Clear all collections in the database"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        
        print("\n⚠ WARNING: This will delete all data in the database!")
        response = input("Are you sure you want to continue? (yes/no): ")
        
        if response.lower() == 'yes':
            for coll_name in COLLECTIONS.values():
                if coll_name in db.list_collection_names():
                    db[coll_name].drop()
                    print(f"✓ Dropped collection: {coll_name}")
            
            print("\n✓ Database cleared successfully")
        else:
            print("\n✗ Operation cancelled")
        
        client.close()
        
    except Exception as e:
        print(f"✗ Error clearing database: {e}")


def create_indexes():
    """Create indexes on collections for better performance"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        
        print("\nCreating indexes...")
        
        # Country temps indexes
        if 'country_temps' in db.list_collection_names():
            db['country_temps'].create_index('Country')
            db['country_temps'].create_index('year')
            db['country_temps'].create_index([('Country', 1), ('year', 1)])
            print("✓ Created indexes for country_temps")
        
        # City temps indexes
        if 'city_temps' in db.list_collection_names():
            db['city_temps'].create_index('City')
            db['city_temps'].create_index('Country')
            db['city_temps'].create_index([('City', 1), ('Country', 1)])
            print("✓ Created indexes for city_temps")
        
        # Major city temps indexes
        if 'major_city_temps' in db.list_collection_names():
            db['major_city_temps'].create_index('City')
            db['major_city_temps'].create_index([('City', 1), ('Country', 1)])
            print("✓ Created indexes for major_city_temps")
        
        print("\n✓ All indexes created successfully\n")
        
        client.close()
        
    except Exception as e:
        print(f"✗ Error creating indexes: {e}")


def show_sample_documents():
    """Display sample documents from each collection"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        
        print("\n" + "="*60)
        print("SAMPLE DOCUMENTS")
        print("="*60)
        
        for coll_name in COLLECTIONS.values():
            if coll_name in db.list_collection_names():
                print(f"\nCollection: {coll_name}")
                print("-" * 60)
                
                # Get one sample document
                doc = db[coll_name].find_one()
                if doc:
                    # Remove _id for cleaner display
                    doc.pop('_id', None)
                    
                    # Display fields
                    for key, value in doc.items():
                        print(f"  {key}: {value}")
                else:
                    print("  (empty collection)")
        
        print("\n" + "="*60 + "\n")
        
        client.close()
        
    except Exception as e:
        print(f"✗ Error showing sample documents: {e}")


def main():
    """Main utility menu"""
    import argparse
    
    parser = argparse.ArgumentParser(description='MongoDB Database Utilities')
    parser.add_argument(
        'action',
        choices=['check', 'stats', 'clear', 'indexes', 'sample'],
        help='Action to perform'
    )
    
    args = parser.parse_args()
    
    if args.action == 'check':
        check_mongodb_connection()
    elif args.action == 'stats':
        get_database_stats()
    elif args.action == 'clear':
        clear_database()
    elif args.action == 'indexes':
        create_indexes()
    elif args.action == 'sample':
        show_sample_documents()


if __name__ == "__main__":
    main()
