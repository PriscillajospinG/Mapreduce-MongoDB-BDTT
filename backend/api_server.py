"""
Flask API Server for Climate Analysis
Bridges React frontend with Python MapReduce backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'backend': 'MongoDB with PySpark'
    })


# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@app.route('/api/stats/summary', methods=['GET'])
def get_summary_stats():
    """Get summary statistics"""
    # This would connect to your MongoDB/PySpark backend
    return jsonify({
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
    })


@app.route('/api/stats/dataset-info', methods=['GET'])
def get_dataset_info():
    """Get detailed dataset information"""
    return jsonify({
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
    })


# ============================================================================
# ANALYTICS ENDPOINTS (MapReduce Results)
# ============================================================================

@app.route('/api/analytics/avg-temp-by-country', methods=['GET'])
def get_avg_temp_by_country():
    """Get average temperature by country (MapReduce Op 1)"""
    # Mock data - replace with actual MongoDB query
    return jsonify([
        {'Country': 'Burundi', 'average': 23.84, 'min': 19.7, 'max': 26.6, 'count': 3000},
        {'Country': 'Djibouti', 'average': 28.25, 'min': 24.2, 'max': 31.8, 'count': 3100},
        {'Country': 'Mauritania', 'average': 28.91, 'min': 25.1, 'max': 32.4, 'count': 3200},
        {'Country': 'Mali', 'average': 28.83, 'min': 25.0, 'max': 32.2, 'count': 3300},
        {'Country': 'Senegal', 'average': 28.68, 'min': 25.2, 'max': 31.9, 'count': 3100},
        {'Country': 'Thailand', 'average': 27.20, 'min': 23.5, 'max': 30.8, 'count': 3400},
        {'Country': 'Bangladesh', 'average': 26.15, 'min': 22.1, 'max': 29.7, 'count': 3200},
        {'Country': 'Nigeria', 'average': 26.42, 'min': 22.8, 'max': 29.5, 'count': 3300},
        {'Country': 'Sudan', 'average': 26.70, 'min': 23.2, 'max': 30.1, 'count': 3100},
        {'Country': 'Congo (Democratic Republic)', 'average': 25.03, 'min': 21.5, 'max': 28.6, 'count': 3200},
    ])


@app.route('/api/analytics/temp-trends-by-year', methods=['GET'])
def get_temp_trends_by_year():
    """Get temperature trends by year (MapReduce Op 2)"""
    return jsonify([
        {'year': 1950, 'average': 13.5, 'min': -50.2, 'max': 48.3, 'count': 50000},
        {'year': 1960, 'average': 13.6, 'min': -51.1, 'max': 49.1, 'count': 75000},
        {'year': 1970, 'average': 13.7, 'min': -50.5, 'max': 49.5, 'count': 150000},
        {'year': 1980, 'average': 13.85, 'min': -51.0, 'max': 50.2, 'count': 250000},
        {'year': 1990, 'average': 14.15, 'min': -50.8, 'max': 50.5, 'count': 500000},
        {'year': 2000, 'average': 14.35, 'min': -51.2, 'max': 51.0, 'count': 750000},
        {'year': 2010, 'average': 14.55, 'min': -52.0, 'max': 51.5, 'count': 1000000},
        {'year': 2016, 'average': 14.72, 'min': -52.5, 'max': 52.0, 'count': 1200000},
    ])


@app.route('/api/analytics/seasonal-analysis', methods=['GET'])
def get_seasonal_analysis():
    """Get seasonal analysis (MapReduce Op 3)"""
    return jsonify([
        {'season': 'Winter', 'average': 10.2, 'min': -45.0, 'max': 35.5, 'count': 2500000},
        {'season': 'Spring', 'average': 14.1, 'min': -30.0, 'max': 42.0, 'count': 2600000},
        {'season': 'Summer', 'average': 18.5, 'min': -20.0, 'max': 52.0, 'count': 2700000},
        {'season': 'Fall', 'average': 14.8, 'min': -35.0, 'max': 45.0, 'count': 2500000},
    ])


@app.route('/api/analytics/extreme-temps', methods=['GET'])
def get_extreme_temps():
    """Get extreme temperatures (MapReduce Op 4)"""
    return jsonify([
        {'dt': '1922-07-21', 'Country': 'Tunisia', 'AverageTemperature': 55.0, 'type': 'Warmest'},
        {'dt': '1954-02-06', 'Country': 'Antarctica', 'AverageTemperature': -89.2, 'type': 'Coldest'},
        {'dt': '2010-07-10', 'Country': 'USA', 'AverageTemperature': 54.0, 'type': 'Warmest'},
        {'dt': '2020-01-15', 'Country': 'Siberia', 'AverageTemperature': -71.0, 'type': 'Coldest'},
        {'dt': '2015-08-30', 'Country': 'Middle East', 'AverageTemperature': 53.9, 'type': 'Warmest'},
    ])


@app.route('/api/analytics/decade-analysis', methods=['GET'])
def get_decade_analysis():
    """Get decade analysis (MapReduce Op 5)"""
    return jsonify([
        {'decade': 1750, 'average': 12.5, 'count': 10000},
        {'decade': 1760, 'average': 12.3, 'count': 12000},
        {'decade': 1800, 'average': 12.8, 'count': 25000},
        {'decade': 1850, 'average': 13.2, 'count': 50000},
        {'decade': 1900, 'average': 13.5, 'count': 100000},
        {'decade': 1950, 'average': 13.7, 'count': 200000},
        {'decade': 2000, 'average': 14.4, 'count': 500000},
        {'decade': 2010, 'average': 14.65, 'count': 1000000},
    ])


@app.route('/api/analytics/records-by-country', methods=['GET'])
def get_records_by_country():
    """Get records per country (MapReduce Op 6)"""
    return jsonify([
        {'Country': 'Sweden', 'record_count': 35000},
        {'Country': 'France', 'record_count': 32000},
        {'Country': 'Germany', 'record_count': 31000},
        {'Country': 'USA', 'record_count': 30000},
        {'Country': 'Brazil', 'record_count': 29000},
        {'Country': 'India', 'record_count': 28000},
        {'Country': 'China', 'record_count': 27000},
        {'Country': 'Russia', 'record_count': 26000},
        {'Country': 'Australia', 'record_count': 25000},
        {'Country': 'Japan', 'record_count': 24000},
    ])


# ============================================================================
# DATA OPERATIONS ENDPOINTS
# ============================================================================

@app.route('/api/upload', methods=['POST'])
def upload_dataset():
    """Upload dataset CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        dataset_name = request.form.get('dataset_name', 'unknown')

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files are supported'}), 400

        # Save file
        filename = f"{dataset_name}_{datetime.now().timestamp()}.csv"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        logger.info(f"File uploaded: {filename}")

        return jsonify({
            'message': f'Dataset {dataset_name} uploaded successfully',
            'filename': filename,
            'size': os.path.getsize(filepath),
            'timestamp': datetime.now().isoformat()
        }), 201

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/preprocess/<dataset_name>', methods=['POST'])
def preprocess_data(dataset_name):
    """Preprocess dataset"""
    try:
        logger.info(f"Preprocessing {dataset_name}")
        
        # This would call your PySpark preprocessing script
        return jsonify({
            'message': f'{dataset_name} dataset preprocessing started',
            'dataset': dataset_name,
            'status': 'processing',
            'timestamp': datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"Preprocessing error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/mapreduce/run', methods=['POST'])
def run_mapreduce():
    """Run MapReduce operations"""
    try:
        logger.info("Starting MapReduce operations")
        
        # This would call your MapReduce execution
        return jsonify({
            'message': 'MapReduce operations started',
            'operations': 6,
            'status': 'running',
            'timestamp': datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"MapReduce error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/mapreduce/status', methods=['GET'])
def mapreduce_status():
    """Get MapReduce operation status"""
    return jsonify({
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
    })


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("Starting Climate Analysis API Server")
    logger.info("Frontend: http://localhost:3000")
    logger.info("API: http://localhost:5001")
    app.run(debug=True, port=5001, host='0.0.0.0')
