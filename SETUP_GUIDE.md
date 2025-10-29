# Climate Analysis Dashboard - Setup Guide

Complete setup guide for running the React frontend with the Python/MongoDB backend.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)                │
│               • Dashboard • Analytics • Upload               │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Flask API Server (Port 5000)                    │
│          • CORS Proxy • API Routes • Error Handling          │
└────────────────────┬────────────────────────────────────────┘
                     │ Python Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Python Backend (Scripts + MongoDB)                │
│  • MapReduce • Preprocessing • Data Upload • Analytics      │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MongoDB 4.4+
- Git

## 🚀 Quick Start (3 Commands)

### 1. Setup Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start Flask API server
python api_server.py
```

The API server will run at: `http://localhost:5000`

### 2. Setup Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### 3. Open Browser

```bash
# Open in browser
http://localhost:3000
```

## 📁 Project Structure

```
Mapreduce-MongoDB-BDTT/
├── backend/
│   ├── api_server.py              ← Flask API (NEW!)
│   ├── config.py
│   ├── main.py
│   ├── requirements.txt
│   ├── scripts/
│   │   ├── upload_dataset.py
│   │   ├── preprocess_data.py
│   │   ├── mapreduce_operations.py
│   │   └── visualize_data.py
│   └── mongo_scripts/
│
├── frontend/                       ← React App (NEW!)
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js             ← API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Charts.jsx
│   │   │   ├── DatasetUpload.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Upload.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
└── Dataset/
    ├── GlobalLandTemperaturesByCountry.csv
    ├── GlobalLandTemperaturesByCity.csv
    └── ... (other CSV files)
```

## 🔧 Configuration

### Backend (Flask)

Edit `backend/api_server.py`:

```python
# Port configuration
app.run(debug=True, port=5000, host='0.0.0.0')

# File upload size
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB
```

### Frontend (React)

Edit `frontend/.env.local`:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
```

Or use defaults in `frontend/vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

## 📚 API Routes

### Health & Status

```
GET /api/health                    ✓ Health check
GET /api/stats/summary             ✓ Dashboard stats
GET /api/stats/dataset-info        ✓ Dataset information
```

### Analytics (MapReduce Results)

```
GET /api/analytics/avg-temp-by-country      ✓ Op 1
GET /api/analytics/temp-trends-by-year      ✓ Op 2
GET /api/analytics/seasonal-analysis        ✓ Op 3
GET /api/analytics/extreme-temps            ✓ Op 4
GET /api/analytics/decade-analysis          ✓ Op 5
GET /api/analytics/records-by-country       ✓ Op 6
```

### Data Operations

```
POST /api/upload                   ✓ Upload CSV
POST /api/preprocess/<dataset>     ✓ Preprocess data
POST /api/mapreduce/run            ✓ Run MapReduce
GET /api/mapreduce/status          ✓ Operation status
```

## 🎯 Common Tasks

### Run Development Environment

**Terminal 1: Backend API**
```bash
cd backend
source venv/bin/activate
python api_server.py
```

**Terminal 2: Frontend Dev Server**
```bash
cd frontend
npm run dev
```

**Terminal 3: MongoDB (if needed)**
```bash
mongod
```

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Backend:**
```bash
cd backend
# No build needed for Python
# Deploy api_server.py to production server
```

### Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Add New Dependencies

**Backend:**
```bash
pip install package-name
pip freeze > requirements.txt
```

**Frontend:**
```bash
npm install package-name
# Automatically updates package.json
```

## 🐛 Troubleshooting

### "Cannot GET /api/health"
- Backend API not running
- Check if Flask server is on port 5000
- Verify proxy config in vite.config.js

### "Module not found: axios"
- Run `npm install` in frontend folder
- Check node_modules exists

### "Connection refused on port 5000"
- Backend not started
- Check if port 5000 is available
- Try: `lsof -i :5000`

### "CORS error"
- Flask CORS not configured
- Check `from flask_cors import CORS` and `CORS(app)`
- Verify backend URL in frontend config

### Charts not displaying
- Verify API returns proper data format
- Check browser console for errors
- Test API endpoint: `http://localhost:5000/api/analytics/avg-temp-by-country`

### Frontend blank page
- Check if index.html exists
- Verify Node.js is installed: `node -v`
- Clear browser cache and reload

## 🚀 Deployment

### Deploy Frontend

```bash
# Build
cd frontend
npm run build

# The dist/ folder contains static files
# Deploy to: Vercel, Netlify, AWS S3, etc.
```

### Deploy Backend

```bash
# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.api_server:app

# Or use: uWSGI, Waitress, etc.
```

## 📊 Frontend Pages

### Dashboard (`/`)
- Summary statistics
- Quick actions
- Recent uploads
- System status

### Analytics (`/analytics`)
- 6 MapReduce visualizations
- Interactive charts
- Data export options
- Real-time updates

### Upload (`/upload`)
- Dataset file upload
- Data preprocessing
- MapReduce execution
- Processing status

### Settings (`/settings`)
- Backend configuration
- Display preferences
- Performance tuning
- System information

## 🔐 Security Considerations

### Frontend
- Input validation on forms
- XSS protection via React
- CORS enabled only for backend
- Environment variables for API URL

### Backend
- CORS configuration
- File upload validation
- Error handling without exposing internals
- Rate limiting (recommended for production)

### MongoDB
- Authentication enabled
- Network access restricted
- Regular backups
- Query optimization

## 📈 Performance Tips

### Frontend
- Enable caching: check "Enable data caching" in Settings
- Lazy load components
- Optimize bundle size: `npm run build --analyze`
- Use production build in deployment

### Backend
- Enable API caching headers
- Database query optimization
- Connection pooling for MongoDB
- Use production server (Gunicorn, uWSGI)

### General
- Monitor API response times
- Use CDN for static files
- Enable gzip compression
- Monitor server resources

## 🆘 Support

### Logs

**Frontend:** Browser DevTools console
```
F12 → Console tab
```

**Backend:** Terminal output
```
[INFO] Climate Analysis API Server
[WARNING] CORS headers missing
[ERROR] Database connection failed
```

### Debug Mode

**Frontend:**
```javascript
// Add to App.jsx
console.log('Debug mode enabled')
```

**Backend:**
```python
app.run(debug=True)  # Enables debug mode
```

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Flask Documentation](https://flask.palletsprojects.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Vite Guide](https://vitejs.dev)
- [Recharts Charts](https://recharts.org)

## ✅ Checklist

Before going to production:

- [ ] Backend API tested and working
- [ ] Frontend connects to API successfully
- [ ] All 6 MapReduce operations functional
- [ ] Charts display correctly with real data
- [ ] File upload working
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Tests passed

---

**Happy analyzing! 🌍📊**
