import { useState, useEffect } from 'react'
import { Database, TrendingUp, Zap, FileText, BarChart3, ArrowRight } from 'lucide-react'
import { climateAPI } from '../api/api'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await climateAPI.getSummaryStats()
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Clean Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Climate Analysis Platform
            </h1>
            <p className="text-lg text-gray-600">
              MongoDB MapReduce • Big Data Analytics • Real-time Processing
            </p>
          </div>

          {/* Key Metrics - Clean Cards */}
          {!loading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <Database className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Records</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total_documents?.toLocaleString() || '0'}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Collections</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.collections?.length || '0'}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <BarChart3 className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">MapReduce Results</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.mapreduce_collections || '6'}
                </p>
              </div>
            </div>
          )}

          {/* Main Action Cards - Clean & Focused */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Quick Analysis */}
            <Link
              to="/quick-analysis"
              className="group bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 text-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7" />
                </div>
                <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Quick Analysis</h3>
              <p className="text-indigo-100 text-sm">
                Upload CSV, run MapReduce, and get instant results in one click
              </p>
            </Link>

            {/* Analytics Dashboard */}
            <Link
              to="/analytics"
              className="group bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 text-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold mb-2">View Analytics</h3>
              <p className="text-teal-100 text-sm">
                Explore visualizations, charts, and detailed MapReduce results
              </p>
            </Link>

          </div>

          {/* System Overview - Simple */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Overview</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Database Status</span>
                </div>
                <span className="text-sm text-gray-600">Connected</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">API Server</span>
                </div>
                <span className="text-sm text-gray-600">Running</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">MapReduce Engine</span>
                </div>
                <span className="text-sm text-gray-600">Ready</span>
              </div>
            </div>
          </div>

          {/* Quick Links - Minimal */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/upload"
              className="p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-gray-700 group-hover:text-indigo-600">Upload Data</span>
              </div>
            </Link>

            <Link
              to="/collections"
              className="p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-700 group-hover:text-purple-600">View Collections</span>
              </div>
            </Link>

            <Link
              to="/settings"
              className="p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                <span className="font-medium text-gray-700 group-hover:text-teal-600">Settings</span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
