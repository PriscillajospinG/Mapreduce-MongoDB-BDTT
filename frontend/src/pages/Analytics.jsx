import { useState, useEffect } from 'react'
import { Loader, AlertCircle, RefreshCw, Download, Filter } from 'lucide-react'
import { climateAPI } from '../api/api'
import {
  AverageTempChart,
  TemperatureTrendsChart,
  SeasonalAnalysisChart,
  DecadeAnalysisChart,
  RecordsPerCountryChart,
  ExtremeTempsTable
} from '../components/Charts'

export function Analytics() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCharts, setSelectedCharts] = useState({
    avgTemp: true,
    trends: true,
    seasonal: true,
    decade: true,
    records: true,
    extreme: true
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const results = await Promise.all([
        climateAPI.getAverageTempByCountry().catch(() => ({ data: [] })),
        climateAPI.getTempTrendsByYear().catch(() => ({ data: [] })),
        climateAPI.getSeasonalAnalysis().catch(() => ({ data: [] })),
        climateAPI.getExtremTemperatures().catch(() => ({ data: [] })),
        climateAPI.getDecadeAnalysis().catch(() => ({ data: [] })),
        climateAPI.getRecordsByCountry().catch(() => ({ data: [] }))
      ])

      setData({
        avgTemp: results[0].data,
        tempTrends: results[1].data,
        seasonal: results[2].data,
        extreme: results[3].data,
        decade: results[4].data,
        records: results[5].data
      })
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleChart = (chartName) => {
    setSelectedCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    )
  }

  return (
    <div className="container pb-12">
      {/* Header with controls */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="section-title">📊 Analytics & MapReduce Results</h1>
            <p className="text-gray-600">
              Visualizations of the 6 MapReduce operations on climate data
            </p>
          </div>
          <button
            onClick={fetchAllData}
            className="btn-primary flex items-center gap-2 hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Chart visibility toggle */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm text-gray-700">Show charts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'avgTemp', label: '📈 Avg Temp' },
              { key: 'trends', label: '📉 Trends' },
              { key: 'seasonal', label: '🔄 Seasonal' },
              { key: 'decade', label: '📅 Decades' },
              { key: 'records', label: '📊 Records' },
              { key: 'extreme', label: '🌡️ Extremes' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleChart(key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedCharts[key]
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert-error mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Row 1 - Average Temp & Seasonal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedCharts.avgTemp && data.avgTemp?.length > 0 && (
            <AverageTempChart data={data.avgTemp} />
          )}
          {selectedCharts.seasonal && data.seasonal?.length > 0 && (
            <SeasonalAnalysisChart data={data.seasonal} />
          )}
        </div>

        {/* Row 2 - Temperature Trends */}
        {selectedCharts.trends && data.tempTrends?.length > 0 && (
          <TemperatureTrendsChart data={data.tempTrends} />
        )}

        {/* Row 3 - Decade & Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedCharts.decade && data.decade?.length > 0 && (
            <DecadeAnalysisChart data={data.decade} />
          )}
          {selectedCharts.records && data.records?.length > 0 && (
            <RecordsPerCountryChart data={data.records} />
          )}
        </div>

        {/* Row 4 - Extreme Temperatures */}
        {selectedCharts.extreme && data.extreme?.length > 0 && (
          <ExtremeTempsTable data={data.extreme} />
        )}

      </div>

      {/* No Data Message */}
      {Object.values(data).every(arr => !arr || arr.length === 0) && (
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No data available. Please run the MapReduce operations first.
          </p>
        </div>
      )}
    </div>
  )
}
