import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000
})

export const climateAPI = {
  // Health check
  getHealth: () => api.get('/health'),

  // Complete pipeline: Upload + Preprocess + MapReduce + Visualize
  completePipeline: (formData) => {
    return api.post('/complete-pipeline', formData, {
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
  getMapReduceStatus: () => api.get('/mapreduce/status')
}

export default api
