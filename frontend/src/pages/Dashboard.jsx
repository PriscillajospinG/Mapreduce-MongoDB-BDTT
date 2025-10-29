import { useState, useEffect } from 'react'
import { Loader, AlertCircle, Play, CheckCircle, Zap, TrendingUp, Activity, Info } from 'lucide-react'
import { climateAPI } from '../api/api'
import { StatsGrid } from '../components/StatsCard'
import { DatasetUpload } from '../components/DatasetUpload'

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mapReduceRunning, setMapReduceRunning] = useState(false)
  const [mapReduceSuccess, setMapReduceSuccess] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await climateAPI.getSummaryStats()
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRunMapReduce = async () => {
    try {
      setMapReduceRunning(true)
      setMapReduceSuccess(false)
      const response = await climateAPI.runMapReduce()
      console.log('MapReduce started:', response.data)
      setMapReduceSuccess(true)
      setTimeout(() => setMapReduceSuccess(false), 3000)
      // Refresh stats after MapReduce completes
      setTimeout(fetchStats, 2000)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setMapReduceRunning(false)
    }
  }

  return (
    <div className="container pb-12">
      {/* Header with controls */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="section-title">Climate Data Analysis Dashboard</h1>
            <p className="text-gray-600">
              Analyze global temperature data using MapReduce operations with MongoDB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-all ${
                autoRefresh
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Auto-refresh every 5 seconds"
            >
              <Activity className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={fetchStats}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              title="Refresh now"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert-error mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchStats}
            className="ml-auto btn-secondary text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Statistics Grid */}
          {stats && <StatsGrid stats={stats} />}

          {/* Main Actions */}
          <div className="mt-8">
            <h2 className="subsection-title flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              MapReduce Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleRunMapReduce}
                disabled={mapReduceRunning}
                className={`card text-left hover:shadow-2xl transition-all flex items-center justify-between group ${
                  mapReduceRunning ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    🚀 Run MapReduce Operations
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Execute all 6 MapReduce operations on your climate data</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Processes: Avg Temp • Trends • Seasonal • Extremes • Decades • Records
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {mapReduceRunning ? (
                    <div className="relative w-10 h-10">
                      <Loader className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                  ) : mapReduceSuccess ? (
                    <CheckCircle className="w-10 h-10 text-green-600 animate-bounce" />
                  ) : (
                    <Play className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </button>

              <a 
                href="/analytics"
                className="card text-left hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                      📊 View Analytics
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Explore all 6 MapReduce visualizations</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Charts • Tables • Trends • Reports
                    </div>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                </div>
              </a>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-8">
            <div className="alert-info">
              <Info className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">How to use this dashboard:</p>
                <ul className="text-sm mt-2 space-y-1 text-blue-700">
                  <li>1️⃣ Click "Run MapReduce Operations" to start analysis</li>
                  <li>2️⃣ Navigate to "Analytics" to view results and visualizations</li>
                  <li>3️⃣ Use auto-refresh to monitor real-time data</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mt-8">
            <DatasetUpload onUploadSuccess={fetchStats} />
          </div>
        </>
      )}
    </div>
  )
}
