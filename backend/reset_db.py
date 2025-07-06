"""
Utility script to reset and re-seed the database.
Run this script when you need to start fresh with the database.
"""
import sys
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def reset_database():
    # Get MongoDB connection
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/saarthi")
    client = MongoClient(mongo_uri)
    db_name = mongo_uri.split("/")[-1]
    db = client[db_name]
    
    # Get confirmation
    confirm = input(f"This will DELETE ALL DATA in the '{db_name}' database. Type 'yes' to confirm: ")
    if confirm.lower() != 'yes':
        print("Operation cancelled.")
        return
    
    # Drop all collections
    for collection in db.list_collection_names():
        db[collection].drop()
        print(f"Dropped collection: {collection}")
    
    print("\nDatabase reset complete!")
    
    # Run seed_data.py to populate with fresh data
    seed_confirm = input("Would you like to re-seed the database with sample data? (yes/no): ")
    if seed_confirm.lower() == 'yes':
        try:
            import seed_data
            seed_data.seed_database()
            print("Database re-seeded successfully!")
        except Exception as e:
            print(f"Error seeding database: {e}")
    
    print("\nDone!")

if __name__ == "__main__":
    reset_database()
