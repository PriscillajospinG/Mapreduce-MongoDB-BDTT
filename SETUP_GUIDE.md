# 🌍 Climate Analysis - Full Stack Application

A complete MapReduce climate analysis system with MongoDB backend and modern React frontend.

**Stack:** MongoDB + FastAPI + React + Recharts

---

## 📊 Features

✅ **9.6M+ Climate Records** from 5 global datasets  
✅ **Real-time MapReduce Analytics** with MongoDB aggregation pipelines  
✅ **Interactive Dashboards** with Recharts visualizations  
✅ **6 MapReduce Operations:**
1. Average temperature by country
2. Temperature trends by year
3. Seasonal analysis (Winter/Spring/Summer/Fall)
4. Extreme temperatures (hottest/coldest)
5. Decade-by-decade analysis
6. Records per country

✅ **Fast API** with FastAPI and Uvicorn  
✅ **Modern Frontend** with React, Vite, and Tailwind CSS  

---

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)

```bash
cd /Users/priscillajosping/Downloads/Mapreduce-MongoDB-BDTT
bash run.sh
```

This script automatically:
- ✅ Checks and starts MongoDB
- ✅ Loads 9.6M climate records into MongoDB
- ✅ Starts FastAPI backend on port 5001
- ✅ Starts React frontend on port 3000

### Option 2: Manual Startup

#### 1. Start MongoDB
```bash
# macOS with Homebrew
mongod --dbpath /usr/local/var/mongodb &

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

#### 2. Load Data into MongoDB
```bash
cd backend
python3 load_data_to_mongo.py
```

#### 3. Start FastAPI Backend
```bash
cd backend
python3 api_server_fastapi.py
# Or with Uvicorn directly:
python3 -m uvicorn api_server_fastapi:app --host 0.0.0.0 --port 5001 --reload
```

#### 4. Start React Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React UI Dashboard |
| API | http://localhost:5001 | FastAPI Server |
| API Docs | http://localhost:5001/docs | Swagger Documentation |
| MongoDB | mongodb://localhost:27017 | Database |

---

## 📡 API Endpoints

### Health & Status
```bash
GET /api/health
```
Response: Server status and MongoDB connection status

### Statistics
```bash
GET /api/stats/summary
# Returns: Total records, datasets, average temperature

GET /api/stats/dataset-info
# Returns: Detailed info about each dataset
```

### Analytics (MapReduce Operations)
```bash
GET /api/analytics/avg-temp-by-country
# MapReduce Op 1: Group by country, calculate avg/min/max

GET /api/analytics/temp-trends-by-year
# MapReduce Op 2: Group by year, show temperature trends

GET /api/analytics/seasonal-analysis
# MapReduce Op 3: Group by season, calculate seasonal stats

GET /api/analytics/extreme-temps
# MapReduce Op 4: Find top 5 hottest and coldest locations

GET /api/analytics/decade-analysis
# MapReduce Op 5: Group by decade, show long-term trends

GET /api/analytics/records-by-country
# MapReduce Op 6: Count records per country
```

### Data Operations
```bash
POST /api/upload
# Upload new CSV dataset

POST /api/preprocess/<dataset_name>
# Preprocess dataset

POST /api/mapreduce/run
# Trigger MapReduce operations

GET /api/mapreduce/status
# Get MapReduce status
```

---

## 📁 Project Structure

```
Mapreduce-MongoDB-BDTT/
├── backend/
│   ├── api_server_fastapi.py      # FastAPI server (main)
│   ├── config.py                   # Configuration
│   ├── load_data_to_mongo.py       # Data loading script
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Charts.jsx
│   │   │   ├── DatasetUpload.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── pages/                  # Pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Upload.jsx
│   │   │   └── Settings.jsx
│   │   ├── api/
│   │   │   └── api.js              # Axios API client
│   │   └── App.jsx                 # Main app
│   ├── vite.config.js              # Vite configuration
│   └── package.json                # Node dependencies
├── Dataset/                        # Climate CSV files
│   ├── GlobalLandTemperaturesByCity.csv
│   ├── GlobalLandTemperaturesByCountry.csv
│   ├── GlobalLandTemperaturesByState.csv
│   ├── GlobalLandTemperaturesByMajorCity.csv
│   └── GlobalTemperatures.csv
├── run.sh                          # Startup script
└── README.md                       # This file
```

---

## 🔧 Technology Stack

### Backend
- **Framework:** FastAPI (async Python web framework)
- **Server:** Uvicorn (ASGI server)
- **Database:** MongoDB (document store)
- **Driver:** PyMongo (Python MongoDB client)
- **Data Processing:** Pandas, NumPy
- **Visualization:** Plotly, Matplotlib

### Frontend
- **Framework:** React 18.2
- **Build Tool:** Vite 5.0
- **Styling:** Tailwind CSS 3.3
- **Charts:** Recharts 2.10
- **Routing:** React Router 6.20
- **HTTP Client:** Axios 1.6
- **Icons:** Lucide React

### Database
- **MongoDB:** Version 8.0+ (or Docker image)
- **Collections:** 5 climate datasets
- **Total Records:** 9.6M+
- **Indexes:** Created on date (dt) and Country fields

---

## 📊 Data Overview

| Dataset | Records | Fields |
|---------|---------|--------|
| Country Temperatures | 544,811 | dt, AverageTemperature, Country |
| City Temperatures | 8,235,082 | dt, AverageTemperature, City, Country, Latitude, Longitude |
| State Temperatures | 620,027 | dt, AverageTemperature, State, Country |
| Major City Temperatures | 228,175 | dt, AverageTemperature, City, Country, Latitude, Longitude |
| Global Temperatures | - | dt, AverageTemperature, AverageTemperatureUncertainty |
| **TOTAL** | **9,628,095** | Climate measurements 1750-2016 |

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB 4.0+ (or Docker)
- npm or yarn

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti :5001 | xargs kill -9  # Port 5001
lsof -ti :3000 | xargs kill -9  # Port 3000
```

### MongoDB Connection Failed
```bash
# Verify MongoDB is running
pgrep mongod

# Check MongoDB logs
mongod --logpath /tmp/mongo.log

# Or start fresh with Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### Data Not Loading
```bash
# Verify dataset files exist
ls -la Dataset/*.csv

# Run loader with verbose output
python3 load_data_to_mongo.py
```

### Frontend Not Connecting to API
1. Ensure backend is running: `curl http://localhost:5001/api/health`
2. Check browser console for CORS errors
3. Verify proxy in `frontend/vite.config.js` points to port 5001

---

## 📈 Performance Notes

- **Query Performance:** MongoDB aggregation pipelines optimized with indexes
- **Frontend Loading:** Lazy loading with React Router
- **API Response:** Sub-second responses for most queries (with 9.6M records)
- **Memory:** ~2GB MongoDB data + ~200MB indexes

---

## 🔐 Security

- CORS configured for localhost development
- No authentication required for development mode
- MongoDB running locally (not exposed)

For production, add:
- Authentication (JWT tokens)
- Rate limiting
- Input validation
- HTTPS/SSL

---

## 📝 API Examples

### Get Summary Statistics
```bash
curl http://localhost:5001/api/stats/summary
```

### Get Average Temperature by Country
```bash
curl http://localhost:5001/api/analytics/avg-temp-by-country
```

### Get Temperature Trends
```bash
curl http://localhost:5001/api/analytics/temp-trends-by-year
```

### View API Documentation
Open http://localhost:5001/docs in your browser for interactive Swagger UI

---

## 🎓 Learning Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Recharts Docs](https://recharts.org/)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review API documentation at `/docs`
3. Check browser console for errors
4. Verify all services are running with the startup script

---

## 🎯 Next Steps

- [ ] Deploy to cloud (AWS, GCP, Azure)
- [ ] Add user authentication
- [ ] Implement caching layer (Redis)
- [ ] Add more visualizations
- [ ] Create REST API documentation (OpenAPI)
- [ ] Add unit tests
- [ ] Implement data export (CSV, JSON)

---

**Happy analyzing! 🌍📊**
