import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000 // Increased timeout for large file processing
})

export const climateAPI = {
  // Health check
  getHealth: () => api.get('/health'),

  // Complete workflow: Upload → Preprocess → MapReduce
  completeAnalysisWorkflow: (formData) => {
    return api.post('/workflow/complete-analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Dataset operations
  uploadDataset: (file, datasetName) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('dataset_name', datasetName)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // CSV Upload to MongoDB as JSON
  uploadCSVToMongoDB: (formData) => {
    return api.post('/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Get uploaded collections
  getUploadedCollections: () => api.get('/uploaded-collections'),

  // Get collection data
  getCollectionData: (collectionName, limit = 10) => 
    api.get(`/collection/${collectionName}`, { params: { limit } }),

  // Run MapReduce on specific collection
  runMapReduceOnCollection: (collectionName) => 
    api.post(`/mapreduce/run-on-collection`, null, { 
      params: { collection_name: collectionName } 
    }),

  // Analytics
  getAverageTempByCountry: () => api.get('/analytics/avg-temp-by-country'),
  getTempTrendsByYear: () => api.get('/analytics/temp-trends-by-year'),
  getSeasonalAnalysis: () => api.get('/analytics/seasonal-analysis'),
  getExtremTemperatures: () => api.get('/analytics/extreme-temps'),
  getDecadeAnalysis: () => api.get('/analytics/decade-analysis'),
  getRecordsByCountry: () => api.get('/analytics/records-by-country'),

  // Summary statistics
  getSummaryStats: () => api.get('/stats/summary'),
  getDatasetInfo: () => api.get('/stats/dataset-info'),

  // Operations
  preprocessData: (datasetName) => api.post(`/preprocess/${datasetName}`),
  runMapReduce: () => api.post('/mapreduce/run'),
  getMapReduceStatus: () => api.get('/mapreduce/status'),
  
  // MapReduce results storage
  getMapReduceResult: (operation) => api.get(`/mapreduce/results/${operation}`),
  getMapReduceHistory: () => api.get('/mapreduce/history')
}

export default api
