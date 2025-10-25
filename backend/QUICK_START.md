# ⚡ Quick Start Guide

## 1️⃣ Start MongoDB
```bash
brew services start mongodb-community
```

## 2️⃣ Setup Environment
```bash
cd /Users/priscillajosping/Downloads/Mapreduce-MongoDB-BDTT
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

## 3️⃣ Upload Data
```bash
python scripts/upload_dataset.py
```
⏱️ Takes ~5-10 minutes

## 4️⃣ Preprocess Data
```bash
python scripts/preprocess_data.py
```
⏱️ Takes ~3-5 minutes

## 5️⃣ Run MapReduce ⭐
```bash
cd mongo_scripts
mongosh < run_all.js
```
⏱️ Takes ~10-15 minutes

## 6️⃣ Fetch Results (Optional)
```bash
cd ..
python scripts/mapreduce_operations.py
```

## 7️⃣ Visualize (Optional)
```bash
python scripts/visualize_data.py
```

---

## 🎯 One Command (after setup)

```bash
# From backend folder
python scripts/upload_dataset.py && \
python scripts/preprocess_data.py && \
cd mongo_scripts && mongosh < run_all.js && cd .. && \
python scripts/mapreduce_operations.py && \
python scripts/visualize_data.py
```

---

## ✅ Check Results

```bash
# View MongoDB collections
mongosh
> use climate_db
> show collections
> db.avg_temp_by_country.find().limit(5)

# View output files
ls output/mapreduce_results/
ls output/visualizations/

# Open interactive chart
open output/visualizations/temp_trends_by_year.html
```

---

**Total Time:** ~30-40 minutes
**For detailed instructions:** See `HOW_TO_RUN.md`
