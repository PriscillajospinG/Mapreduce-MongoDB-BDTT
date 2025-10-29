import { useState, useEffect } from 'react'
import { Loader, AlertCircle, RefreshCw } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title">Analytics & MapReduce Results</h1>
          <p className="text-gray-600">
            Visualizations of the 6 MapReduce operations
          </p>
        </div>
        <button
          onClick={fetchAllData}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.avgTemp?.length > 0 && (
            <AverageTempChart data={data.avgTemp} />
          )}
          {data.seasonal?.length > 0 && (
            <SeasonalAnalysisChart data={data.seasonal} />
          )}
        </div>

        {/* Row 2 */}
        {data.tempTrends?.length > 0 && (
          <TemperatureTrendsChart data={data.tempTrends} />
        )}

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.decade?.length > 0 && (
            <DecadeAnalysisChart data={data.decade} />
          )}
          {data.records?.length > 0 && (
            <RecordsPerCountryChart data={data.records} />
          )}
        </div>

        {/* Row 4 */}
        {data.extreme?.length > 0 && (
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
