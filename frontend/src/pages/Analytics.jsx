import { useState, useEffect } from 'react'
import { Loader, AlertCircle, RefreshCw, Download, Filter, Activity, Database, Clock, TrendingUp, Globe, Thermometer } from 'lucide-react'
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
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [selectedCharts, setSelectedCharts] = useState({
    avgTemp: true,
    trends: true,
    seasonal: true,
    decade: true,
    records: true,
    extreme: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchData()
      }, 30000) // 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Fetching real data from MongoDB MapReduce results...')
      
      const startTime = Date.now()
      
      const [
        avgTemp,
        trends,
        seasonal,
        extremes,
        decade,
        records
      ] = await Promise.all([
        climateAPI.getAverageTempByCountry(),
        climateAPI.getTempTrendsByYear(),
        climateAPI.getSeasonalAnalysis(),
        climateAPI.getExtremTemperatures(),
        climateAPI.getDecadeAnalysis(),
        climateAPI.getRecordsByCountry()
      ])

      const fetchedData = {
        avgTemp: avgTemp.data || [],
        trends: trends.data || [],
        seasonal: seasonal.data || [],
        extremes: extremes.data || [],
        decade: decade.data || [],
        records: records.data || []
      }

      setData(fetchedData)
      setLastUpdated(new Date())

      const loadTime = Date.now() - startTime

      // Log data statistics
      const totalRecords = Object.values(fetchedData).reduce((sum, arr) => sum + (arr?.length || 0), 0)
      console.log('✅ Real data loaded from backend:', {
        avgTemp: fetchedData.avgTemp?.length || 0,
        trends: fetchedData.trends?.length || 0,
        seasonal: fetchedData.seasonal?.length || 0,
        extremes: fetchedData.extremes?.length || 0,
        decade: fetchedData.decade?.length || 0,
        records: fetchedData.records?.length || 0,
        total: totalRecords,
        loadTime: `${loadTime}ms`
      })

      if (totalRecords === 0) {
        console.warn('⚠️ No data found. Please upload datasets and run MapReduce operations.')
      }
    } catch (err) {
      console.error('❌ Error fetching analytics data:', err)
      setError(err.message || 'Failed to fetch analytics data')
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
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <Activity className="w-12 h-12 text-purple-600 absolute top-6 left-6 animate-pulse" />
        </div>
        <p className="text-gray-700 font-bold text-xl mt-8">Loading Real-Time Analytics</p>
        <p className="text-sm text-gray-500 mt-2 animate-pulse">Fetching MapReduce results from MongoDB...</p>
        <div className="mt-6 flex gap-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    )
  }

  const totalDataPoints = Object.values(data).reduce((sum, arr) => sum + (arr?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
      <div className="container mx-auto px-4 py-8">
      
      {/* Real-time Header with Live Status */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                📊 Live Climate Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Real-time MapReduce Results from MongoDB
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-green-500 animate-ping"></div>
              </div>
              <span className="text-sm font-bold text-green-700">LIVE</span>
            </div>
            
            {/* Data Points Counter */}
            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <p className="text-xs text-gray-600">Data Points</p>
              <p className="text-xl font-bold text-indigo-700">{totalDataPoints.toLocaleString()}</p>
            </div>
            
            {/* Last Updated */}
            {lastUpdated && (
              <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated
                </p>
                <p className="text-sm font-semibold text-purple-700">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}
            
            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                autoRefresh 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 shadow-lg' 
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="text-xs font-semibold">
                  {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
                </span>
              </div>
            </button>
            
            {/* Manual Refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Thermometer className="w-8 h-8 opacity-80" />
            <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">COUNTRIES</div>
          </div>
          <p className="text-3xl font-bold">{data.avgTemp?.length || 0}</p>
          <p className="text-sm opacity-90 mt-1">Countries Analyzed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">YEARS</div>
          </div>
          <p className="text-3xl font-bold">{data.trends?.length || 0}</p>
          <p className="text-sm opacity-90 mt-1">Years of Data</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-8 h-8 opacity-80" />
            <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">RECORDS</div>
          </div>
          <p className="text-3xl font-bold">{totalDataPoints.toLocaleString()}</p>
          <p className="text-sm opacity-90 mt-1">Total Data Points</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">EVENTS</div>
          </div>
          <p className="text-3xl font-bold">{data.extremes?.length || 0}</p>
          <p className="text-sm opacity-90 mt-1">Extreme Events</p>
        </div>
      </div>

        {/* Chart visibility toggle */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-gray-800">Visualization Controls</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'avgTemp', label: '📈 Average Temperature', color: 'from-red-500 to-orange-500' },
              { key: 'trends', label: '📉 Temperature Trends', color: 'from-blue-500 to-cyan-500' },
              { key: 'seasonal', label: '🔄 Seasonal Patterns', color: 'from-amber-500 to-yellow-500' },
              { key: 'decade', label: '📅 Decade Analysis', color: 'from-purple-500 to-pink-500' },
              { key: 'records', label: '📊 Country Records', color: 'from-green-500 to-emerald-500' },
              { key: 'extreme', label: '🌡️ Extreme Events', color: 'from-orange-500 to-red-500' }
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => toggleChart(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                  selectedCharts[key]
                    ? `bg-gradient-to-r ${color} text-white shadow-lg border-2 border-transparent`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-200'
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
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-800">Error Loading Data</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Charts Grid - Full Width Layout */}
      <div className="space-y-6">
        {/* Row 1 - Full Width Temperature Trends */}
        {selectedCharts.trends && data.trends?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <TemperatureTrendsChart data={data.trends} />
          </div>
        )}

        {/* Row 2 - Average Temp & Seasonal Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {selectedCharts.avgTemp && data.avgTemp?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <AverageTempChart data={data.avgTemp} />
            </div>
          )}
          {selectedCharts.seasonal && data.seasonal?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex items-center justify-center">
              <SeasonalAnalysisChart data={data.seasonal} />
            </div>
          )}
        </div>

        {/* Row 3 - Decade & Records Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {selectedCharts.decade && data.decade?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <DecadeAnalysisChart data={data.decade} />
            </div>
          )}
          {selectedCharts.records && data.records?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <RecordsPerCountryChart data={data.records} />
            </div>
          )}
        </div>

        {/* Row 4 - Extreme Temperatures Full Width */}
        {selectedCharts.extreme && data.extremes?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <ExtremeTempsTable data={data.extremes} />
          </div>
        )}
      </div>

      {/* No Data Message */}
      {Object.values(data).every(arr => !arr || arr.length === 0) && (
        <div className="card text-center py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-teal-50">
          <div className="max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              The MongoDB database is empty or MapReduce operations haven't been run yet.
            </p>
            <div className="bg-white rounded-lg p-4 border border-purple-200 text-left mb-4">
              <p className="text-sm font-semibold text-purple-700 mb-2">📝 To see real data:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Upload CSV datasets via <span className="font-semibold">Quick Analysis</span> or <span className="font-semibold">Upload</span> page</li>
                <li>Run MapReduce operations from the backend</li>
                <li>Click <span className="font-semibold">Refresh</span> to reload this page</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.href = '/quick-analysis'}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
            >
              Go to Quick Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
