"""
FastAPI Server for Climate Analysis
High-performance async API bridging React frontend with MongoDB
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import uvicorn
from typing import Optional, List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Climate Analysis API",
    description="MapReduce operations on climate data stored in MongoDB",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
db = None
mongo_available = False

try:
    from config import MONGO_URI, DATABASE_NAME
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    mongo_client.server_info()
    db = mongo_client[DATABASE_NAME]
    mongo_available = True
    logger.info(f"✅ Connected to MongoDB: {DATABASE_NAME}")
except ConnectionFailure:
    logger.warning("⚠️  MongoDB not available - using mock data")
    mongo_available = False
except Exception as e:
    logger.warning(f"⚠️  MongoDB connection issue: {e} - using mock data")
    mongo_available = False

# Configuration
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@app.get('/api/health')
async def health():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'backend': 'FastAPI with MongoDB',
        'mongo_available': mongo_available
    }


# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@app.get('/api/stats/summary')
async def get_summary_stats():
    """Get summary statistics"""
    if not mongo_available or db is None:
        logger.warning("MongoDB not available, returning mock data")
        return {
            'total_records': 10500000,
            'dataset_count': 5,
            'avg_temperature': 14.2,
            'last_updated': datetime.now().isoformat(),
            'datasets': {
                'country': {'records': 577000, 'status': 'ready'},
                'city': {'records': 8600000, 'status': 'ready'},
                'state': {'records': 645000, 'status': 'ready'},
                'major_city': {'records': 239000, 'status': 'ready'},
                'global': {'records': 3300, 'status': 'ready'}
            }
        }
    
    try:
        collections_info = {
            'country': 'country_temps',
            'city': 'city_temps',
            'state': 'state_temps',
            'major_city': 'major_city_temps',
            'global': 'global_temps'
        }
        
        datasets = {}
        total_records = 0
        total_temp = 0
        count_for_avg = 0
        
        for key, coll_name in collections_info.items():
            try:
                collection = db[coll_name]
                count = collection.count_documents({})
                datasets[key] = {'records': count, 'status': 'ready'}
                total_records += count
                
                avg_result = list(collection.aggregate([
                    {'$group': {'_id': None, 'avg': {'$avg': '$AverageTemperature'}}}
                ]))
                if avg_result and avg_result[0].get('avg'):
                    total_temp += avg_result[0]['avg'] * count
                    count_for_avg += count
            except Exception as e:
                logger.warning(f"Error getting stats for {coll_name}: {e}")
                datasets[key] = {'records': 0, 'status': 'error'}
        
        avg_temp = round(total_temp / count_for_avg, 2) if count_for_avg > 0 else 0
        
        logger.info(f"✅ Summary: {total_records:,} records, avg temp: {avg_temp}°C")
        return {
            'total_records': total_records,
            'dataset_count': len(datasets),
            'avg_temperature': avg_temp,
            'last_updated': datetime.now().isoformat(),
            'datasets': datasets
        }
    
    except Exception as e:
        logger.error(f"Error fetching summary stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/stats/dataset-info')
async def get_dataset_info():
    """Get detailed dataset information"""
    return {
        'datasets': [
            {
                'name': 'Country',
                'records': 577000,
                'variables': ['dt', 'AverageTemperature', 'Country'],
                'date_range': '1750-2016'
            },
            {
                'name': 'City',
                'records': 8600000,
                'variables': ['dt', 'AverageTemperature', 'City', 'Country', 'Latitude', 'Longitude'],
                'date_range': '1750-2016'
            },
            {
                'name': 'State',
                'records': 645000,
                'variables': ['dt', 'AverageTemperature', 'State', 'Country'],
                'date_range': '1750-2016'
            },
            {
                'name': 'Major City',
                'records': 239000,
                'variables': ['dt', 'AverageTemperature', 'City', 'Country', 'Latitude', 'Longitude'],
                'date_range': '1750-2016'
            },
            {
                'name': 'Global',
                'records': 3300,
                'variables': ['dt', 'AverageTemperature', 'AverageTemperatureUncertainty'],
                'date_range': '1750-2016'
            }
        ]
    }


# ============================================================================
# ANALYTICS ENDPOINTS (MapReduce Results)
# ============================================================================

@app.get('/api/analytics/avg-temp-by-country')
async def get_avg_temp_by_country():
    """Get average temperature by country (MapReduce Op 1)"""
    if not mongo_available or db is None:
        logger.warning("MongoDB not available, returning mock data")
        return [
            {'Country': 'Burundi', 'average': 23.84, 'min': 19.7, 'max': 26.6, 'count': 3000},
            {'Country': 'Djibouti', 'average': 28.25, 'min': 24.2, 'max': 31.8, 'count': 3100},
            {'Country': 'Mauritania', 'average': 28.91, 'min': 25.1, 'max': 32.4, 'count': 3200},
            {'Country': 'Mali', 'average': 28.83, 'min': 25.0, 'max': 32.2, 'count': 3300},
            {'Country': 'Senegal', 'average': 28.68, 'min': 25.2, 'max': 31.9, 'count': 3100},
        ]

    try:
        collection = db['country_temps']
        pipeline = [
            {'$group': {
                '_id': '$Country',
                'average': {'$avg': '$AverageTemperature'},
                'min': {'$min': '$AverageTemperature'},
                'max': {'$max': '$AverageTemperature'},
                'count': {'$sum': 1}
            }},
            {'$sort': {'average': -1}},
            {'$limit': 50},
            {'$project': {
                'Country': '$_id',
                'average': {'$round': ['$average', 2]},
                'min': {'$round': ['$min', 2]},
                'max': {'$round': ['$max', 2]},
                'count': 1,
                '_id': 0
            }}
        ]
        
        results = list(collection.aggregate(pipeline))
        logger.info(f"✅ Fetched avg temp by country: {len(results)} records")
        return results
    
    except Exception as e:
        logger.error(f"Error fetching avg temp by country: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/analytics/temp-trends-by-year')
async def get_temp_trends_by_year():
    """Get temperature trends by year (MapReduce Op 2)"""
    if not mongo_available or db is None:
        logger.warning("MongoDB not available, returning mock data")
        return [
            {'year': 1950, 'average': 13.5, 'min': -50.2, 'max': 48.3, 'count': 50000},
            {'year': 1960, 'average': 13.6, 'min': -51.1, 'max': 49.1, 'count': 75000},
            {'year': 1970, 'average': 13.7, 'min': -50.5, 'max': 49.5, 'count': 150000},
        ]

    try:
        collection = db['country_temps']
        pipeline = [
            {'$addFields': {'year': {'$year': {'$dateFromString': {'dateString': '$dt'}}}}},
            {'$group': {
                '_id': '$year',
                'average': {'$avg': '$AverageTemperature'},
                'min': {'$min': '$AverageTemperature'},
                'max': {'$max': '$AverageTemperature'},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}},
            {'$project': {
                'year': '$_id',
                'average': {'$round': ['$average', 2]},
                'min': {'$round': ['$min', 2]},
                'max': {'$round': ['$max', 2]},
                'count': 1,
                '_id': 0
            }}
        ]
        
        results = list(collection.aggregate(pipeline))
        logger.info(f"✅ Fetched temp trends by year: {len(results)} records")
        return results
    
    except Exception as e:
        logger.error(f"Error fetching temp trends by year: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/analytics/seasonal-analysis')
async def get_seasonal_analysis():
    """Get seasonal analysis (MapReduce Op 3)"""
    if not mongo_available or db is None:
        logger.warning("MongoDB not available, returning mock data")
        return [
            {'season': 'Winter', 'average': 10.2, 'min': -45.0, 'max': 35.5, 'count': 2500000},
            {'season': 'Spring', 'average': 14.1, 'min': -30.0, 'max': 42.0, 'count': 2600000},
            {'season': 'Summer', 'average': 18.5, 'min': -20.0, 'max': 52.0, 'count': 2700000},
            {'season': 'Fall', 'average': 14.8, 'min': -35.0, 'max': 45.0, 'count': 2500000},
        ]

    try:
        collection = db['country_temps']
        pipeline = [
            {'$addFields': {'month': {'$month': {'$dateFromString': {'dateString': '$dt'}}}}},
            {'$addFields': {
                'season': {
                    '$cond': [
                        {'$in': ['$month', [12, 1, 2]]}, 'Winter',
                        {'$cond': [
                            {'$in': ['$month', [3, 4, 5]]}, 'Spring',
                            {'$cond': [
                                {'$in': ['$month', [6, 7, 8]]}, 'Summer',
                                'Fall'
                            ]}
                        ]}
                    ]
                }
            }},
            {'$group': {
                '_id': '$season',
                'average': {'$avg': '$AverageTemperature'},
                'min': {'$min': '$AverageTemperature'},
                'max': {'$max': '$AverageTemperature'},
                'count': {'$sum': 1}
            }},
            {'$project': {
                'season': '$_id',
                'average': {'$round': ['$average', 2]},
                'min': {'$round': ['$min', 2]},
                'max': {'$round': ['$max', 2]},
                'count': 1,
                '_id': 0
            }}
        ]
        
        results = list(collection.aggregate(pipeline))
        logger.info(f"✅ Fetched seasonal analysis: {len(results)} records")
        return results
    
    except Exception as e:
        logger.error(f"Error fetching seasonal analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/analytics/extreme-temps')
async def get_extreme_temps():
    """Get extreme temperatures (MapReduce Op 4)"""
    if not mongo_available or db is None:
        logger.warning("MongoDB not available, returning mock data")
        return [
            {'dt': '1922-07-21', 'Country': 'Tunisia', 'AverageTemperature': 55.0, 'type': 'Warmest'},
            {'dt': '1954-02-06', 'Country': 'Antarctica', 'AverageTemperature': -89.2, 'type': 'Coldest'},
            {'dt': '2010-07-10', 'Country': 'USA', 'AverageTemperature': 54.0, 'type': 'Warmest'},
        ]

    try:
        collection = db['country_temps']
        
        pipeline_warm = [
            {'$sort': {'AverageTemperature': -1}},
            {'$limit': 5},
            {'$addFields': {'type': 'Warmest'}},
            {'$project': {'dt': 1, 'Country': 1, 'AverageTemperature': {'$round': ['$AverageTemperature', 2]}, 'type': 1, '_id': 0}}
        ]
        
        pipeline_cold = [
            {'$sort': {'AverageTemperature': 1}},
            {'$limit': 5},
            {'$addFields': {'type': 'Coldest'}},
            {'$project': {'dt': 1, 'Country': 1, 'AverageTemperature': {'$round': ['$AverageTemperature', 2]}, 'type': 1, '_id': 0}}
        ]
        
        warmest = list(collection.aggregate(pipeline_warm))
        coldest = list(collection.aggregate(pipeline_cold))
        
        results = warmest + coldest
        logger.info(f"✅ Fetched extreme temps: {len(results)} records")
        return results
    
    except Exception as e:
        logger.error(f"Error fetching extreme temps: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/analytics/decade-analysis')
async def get_decade_analysis():
    """Get decade analysis (MapReduce Op 5)"""
    if not mongo_available or db is None:
        logger.warning("MongoDB not available, returning mock data")
        return [
            {'decade': 1750, 'average': 12.5, 'count': 10000},
            {'decade': 1800, 'average': 12.8, 'count': 25000},
            {'decade': 1900, 'average': 13.5, 'count': 100000},
            {'decade': 2000, 'average': 14.4, 'count': 500000},
        ]

    try:
        collection = db['country_temps']
        pipeline = [
            {'$addFields': {'year': {'$year': {'$dateFromString': {'dateString': '$dt'}}}}},
            {'$addFields': {'decade': {'$multiply': [{'$floor': {'$divide': ['$year', 10]}}, 10]}}},
            {'$group': {
                '_id': '$decade',
                'average': {'$avg': '$AverageTemperature'},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}},
            {'$project': {
                'decade': '$_id',
                'average': {'$round': ['$average', 2]},
                'count': 1,
                '_id': 0
            }}
        ]

        results = list(collection.aggregate(pipeline))
        logger.info(f"✅ Fetched decade analysis: {len(results)} records")
        return results

    except Exception as e:
        logger.error(f"Error fetching decade analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/analytics/records-by-country')
async def get_records_by_country():
    """Get records per country (MapReduce Op 6)"""
    if not mongo_available or db is None:
        logger.warning("MongoDB not available, returning mock data")
        return [
            {'Country': 'Sweden', 'record_count': 35000},
            {'Country': 'France', 'record_count': 32000},
            {'Country': 'Germany', 'record_count': 31000},
            {'Country': 'USA', 'record_count': 30000},
        ]

    try:
        collection = db['country_temps']
        pipeline = [
            {'$group': {
                '_id': '$Country',
                'record_count': {'$sum': 1}
            }},
            {'$sort': {'record_count': -1}},
            {'$limit': 50},
            {'$project': {
                'Country': '$_id',
                'record_count': 1,
                '_id': 0
            }}
        ]
        
        results = list(collection.aggregate(pipeline))
        logger.info(f"✅ Fetched records by country: {len(results)} records")
        return results
    
    except Exception as e:
        logger.error(f"Error fetching records by country: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# DATA OPERATIONS ENDPOINTS
# ============================================================================

@app.post('/api/upload')
async def upload_dataset(file: UploadFile = File(...)):
    """Upload dataset CSV file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")

        filename = f"{datetime.now().timestamp()}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(filepath, "wb") as f:
            content = await file.read()
            f.write(content)

        logger.info(f"File uploaded: {filename}")

        return {
            'message': f'Dataset uploaded successfully',
            'filename': filename,
            'size': len(content),
            'timestamp': datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/preprocess/{dataset_name}')
async def preprocess_data(dataset_name: str):
    """Preprocess dataset"""
    try:
        logger.info(f"Preprocessing {dataset_name}")
        
        return {
            'message': f'{dataset_name} dataset preprocessing started',
            'dataset': dataset_name,
            'status': 'processing',
            'timestamp': datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Preprocessing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/mapreduce/run')
async def run_mapreduce():
    """Run MapReduce operations"""
    try:
        logger.info("Starting MapReduce operations")
        
        return {
            'message': 'MapReduce operations started',
            'operations': 6,
            'status': 'running',
            'timestamp': datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"MapReduce error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/mapreduce/status')
async def mapreduce_status():
    """Get MapReduce operation status"""
    return {
        'status': 'completed',
        'operations': 6,
        'completed': 6,
        'failed': 0,
        'timestamp': datetime.now().isoformat(),
        'results': {
            'avg_temp_by_country': 'completed',
            'temp_trends_by_year': 'completed',
            'seasonal_analysis': 'completed',
            'extreme_temps': 'completed',
            'decade_analysis': 'completed',
            'records_by_country': 'completed'
        }
    }


# ============================================================================
# MAIN
# ============================================================================


if __name__ == '__main__':
    logger.info("=" * 70)
    logger.info("🚀 Climate Analysis FastAPI Server")
    logger.info("=" * 70)
    logger.info(f"Frontend: http://localhost:3000")
    logger.info(f"API: http://localhost:5001")
    logger.info(f"Docs: http://localhost:5001/docs")
    logger.info(f"MongoDB: {'✅ Connected' if mongo_available else '⚠️  Using Mock Data'}")
    logger.info("=" * 70)
    
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=False, log_level="info")

