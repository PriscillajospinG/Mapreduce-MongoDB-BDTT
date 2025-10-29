# 🚀 START HERE - Climate Analysis System

## ⚡ Quick Start (30 seconds)

### Everything is Already Running!

```
✅ Backend API:  http://localhost:5001
✅ Frontend UI:  http://localhost:3000
✅ Database:     MongoDB (9.6M records)
```

### 1. Open the Dashboard
Go to: **http://localhost:3000**

You should see:
- 📊 Summary statistics (9.6M climate records)
- 📈 6 interactive charts
- 🌍 Global climate analytics

### 2. Explore the API
View documentation at: **http://localhost:5001/docs**

You'll see all 12 endpoints with test functionality.

### 3. Test an Endpoint
```bash
curl http://localhost:5001/api/stats/summary | python3 -m json.tool
```

---

## 📋 What You Have

### Full Stack Application
```
React Frontend (3000)
    ↓ HTTP Requests
FastAPI Backend (5001)
    ↓ Aggregation Pipelines
MongoDB Database (27017)
    └─ 9.6M Climate Records
```

### 6 MapReduce Operations
1. Average temperature by country
2. Temperature trends over time
3. Seasonal analysis (Winter/Spring/Summer/Fall)
4. Extreme temperatures (hottest/coldest)
5. Decade-by-decade analysis
6. Records per country

### Interactive Features
- 🎨 Recharts visualizations
- 📱 Responsive design
- 🔄 Real-time data
- 🚀 Fast performance (<1s queries)

---

## 🎮 How to Use

### View Real Climate Data
1. Go to http://localhost:3000
2. Click on "Analytics" tab
3. Explore the 6 charts showing:
   - Which countries are hottest
   - Climate trends by year
   - Seasonal patterns
   - Extreme temperatures

### Test the API Manually
```bash
# Get summary
curl http://localhost:5001/api/stats/summary

# Get country temperatures
curl http://localhost:5001/api/analytics/avg-temp-by-country

# Get seasonal data
curl http://localhost:5001/api/analytics/seasonal-analysis

# Get extreme temps
curl http://localhost:5001/api/analytics/extreme-temps
```

### Upload New Data
Use the "Upload" page to add new climate datasets (CSV format)

---

## 🔧 If Services Stop

### Restart Everything
```bash
cd /Users/priscillajosping/Downloads/Mapreduce-MongoDB-BDTT
bash run.sh
```

### Or Start Individually
```bash
# Terminal 1: Backend
cd backend
python3 api_server_fastapi.py

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: MongoDB (if not running)
mongod --dbpath /usr/local/var/mongodb
```

---

## 📊 Data You Have

- **544,811** country temperature records
- **8.2M** city temperature records
- **620K** state temperature records
- **228K** major city records
- **Time range:** 1750-2016 (266 years)

---

## 🌐 Access Points

| What | URL | Port |
|------|-----|------|
| Dashboard | http://localhost:3000 | 3000 |
| API Server | http://localhost:5001 | 5001 |
| API Docs | http://localhost:5001/docs | 5001 |
| Database | localhost:27017 | 27017 |

---

## ✨ Key Features

✅ **Real Data:** 9.6M climate records from MongoDB
✅ **Fast API:** <1 second response times
✅ **Modern UI:** React with Recharts visualizations
✅ **MapReduce:** 6 advanced analytics operations
✅ **Interactive:** Charts update with real data

---

## 🆘 Troubleshooting

### Dashboard shows "Loading" forever
→ Check if backend is running: `curl http://localhost:5001/api/health`

### API returns errors
→ Verify MongoDB: `pgrep mongod`

### Port in use
→ Kill process: `lsof -ti :5001 | xargs kill -9`

### No data showing
→ Reload data: `cd backend && python3 load_data_to_mongo.py`

---

## 📚 Documentation

- **Full setup guide:** `SETUP_GUIDE.md`
- **System details:** `SYSTEM_SUMMARY.md`
- **API docs:** http://localhost:5001/docs
- **Code:** `backend/` and `frontend/` directories

---

## 🎯 Next Steps

1. **Explore the Dashboard** → http://localhost:3000
2. **View API Docs** → http://localhost:5001/docs
3. **Test endpoints** → Copy curl commands and run them
4. **Upload data** → Use the Upload page
5. **Analyze patterns** → View the 6 analytics charts

---

## ✅ System Status

**All Services Running:**
- ✅ MongoDB (9.6M records)
- ✅ FastAPI (12 endpoints)
- ✅ React Frontend (4 pages)
- ✅ Real-time analytics

**Ready to use!** 🚀

---

**Created:** 2025-10-29
**Stack:** MongoDB + FastAPI + React
**Records:** 9,628,095
**Endpoints:** 12
**Charts:** 6
