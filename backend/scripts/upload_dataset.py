import pandas as pd
from pymongo import MongoClient
import json

csv_file = "GlobalLandTemperaturesByCountry.csv"
df = pd.read_csv(csv_file)

# Optional: remove rows with missing temperatures
df = df.dropna(subset=['AverageTemperature'])

# Convert date column to string (MongoDB friendly)
df['dt'] = df['dt'].astype(str)


records = df.to_dict(orient='records')  # list of dictionaries (JSON-like)
client = MongoClient("mongodb://localhost:27017/")
db = client["climate_db"]               # Database name
collection = db["country_temps"]        # Collection name

# Optional: Clear collection if it exists
collection.delete_many({})
collection.insert_many(records)

print(f"Inserted {collection.count_documents({})} records into MongoDB!")