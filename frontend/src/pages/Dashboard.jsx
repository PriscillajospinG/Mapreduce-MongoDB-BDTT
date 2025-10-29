import { useState, useEffect } from 'react'
import { Loader, AlertCircle } from 'lucide-react'
import { climateAPI } from '../api/api'
import { StatsGrid } from '../components/StatsCard'
import { DatasetUpload } from '../components/DatasetUpload'

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

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

  return (
    <div className="container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Climate Data Analysis Dashboard</h1>
        <p className="text-gray-600">
          Analyze global temperature data using MapReduce operations with MongoDB and PySpark
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={fetchStats}
            className="ml-auto btn-secondary"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Statistics Grid */}
          {stats && <StatsGrid stats={stats} />}

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="subsection-title">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="card text-left hover:shadow-xl transition-all cursor-pointer">
                <h3 className="font-semibold text-gray-800">Run MapReduce</h3>
                <p className="text-sm text-gray-600 mt-1">Execute all 6 MapReduce operations</p>
              </button>
              <button className="card text-left hover:shadow-xl transition-all cursor-pointer">
                <h3 className="font-semibold text-gray-800">Export Results</h3>
                <p className="text-sm text-gray-600 mt-1">Download analysis as CSV or JSON</p>
              </button>
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
