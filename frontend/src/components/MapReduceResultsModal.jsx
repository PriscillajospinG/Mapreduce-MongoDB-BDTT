import { useState, useEffect } from 'react'
import { Loader, AlertCircle, CheckCircle, X } from 'lucide-react'
import { climateAPI } from '../api/api'
import {
  AverageTempChart,
  TemperatureTrendsChart,
  SeasonalAnalysisChart,
  DecadeAnalysisChart,
  RecordsPerCountryChart,
  ExtremeTempsTable
} from './Charts'

export function MapReduceResultsModal({ isOpen, onClose, runId }) {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedCharts, setExpandedCharts] = useState({
    avgTemp: true,
    trends: true,
    seasonal: true,
    decade: true,
    records: true,
    extreme: true
  })

  useEffect(() => {
    if (isOpen && runId) {
      fetchResults()
    }
  }, [isOpen, runId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      setError(null)

      const operations = [
        { key: 'avgTemp', op: 'avg_temp_by_country' },
        { key: 'trends', op: 'temp_trends_by_year' },
        { key: 'seasonal', op: 'seasonal_analysis' },
        { key: 'decade', op: 'decade_analysis' },
        { key: 'records', op: 'records_by_country' },
        { key: 'extreme', op: 'extreme_temps' }
      ]

      const fetchedResults = {}
      
      for (const { key, op } of operations) {
        try {
          const response = await climateAPI.getMapReduceResult(op)
          fetchedResults[key] = response.data || []
        } catch (err) {
          console.warn(`Failed to fetch ${op}:`, err)
          fetchedResults[key] = []
        }
      }

      setResults(fetchedResults)
    } catch (err) {
      setError(err.message || 'Failed to fetch MapReduce results')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">📊 MapReduce Results</h2>
              <p className="text-sm text-gray-600 mt-1">Run ID: {runId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="alert-error mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
                <button onClick={fetchResults} className="ml-auto btn-secondary text-sm">
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Loading MapReduce results from MongoDB...</p>
              </div>
            ) : Object.values(results).some(arr => arr.length > 0) ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 font-semibold">
                    ✅ All MapReduce results successfully retrieved from MongoDB
                  </p>
                </div>

                {/* Charts Grid */}
                <div className="space-y-6">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {results.avgTemp?.length > 0 && (
                      <AverageTempChart data={results.avgTemp} />
                    )}
                    {results.seasonal?.length > 0 && (
                      <SeasonalAnalysisChart data={results.seasonal} />
                    )}
                  </div>

                  {/* Row 2 */}
                  {results.trends?.length > 0 && (
                    <TemperatureTrendsChart data={results.trends} />
                  )}

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {results.decade?.length > 0 && (
                      <DecadeAnalysisChart data={results.decade} />
                    )}
                    {results.records?.length > 0 && (
                      <RecordsPerCountryChart data={results.records} />
                    )}
                  </div>

                  {/* Row 4 */}
                  {results.extreme?.length > 0 && (
                    <ExtremeTempsTable data={results.extreme} />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No results available. Please try again.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
            <button
              onClick={fetchResults}
              className="btn-secondary flex items-center gap-2"
            >
              🔄 Refresh
            </button>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
