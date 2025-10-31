import { useState } from 'react'
import { Upload, Zap, CheckCircle, AlertCircle, Database, TrendingUp, FileText, Activity } from 'lucide-react'
import { climateAPI } from '../api/api'

export function QuickAnalysis() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid CSV file')
      setFile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)
    setProgress('Uploading file...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setProgress('Processing data and running MapReduce operations...')
      const response = await climateAPI.completePipeline(formData)
      setResults(response.data)
      setProgress('Complete!')
    } catch (err) {
      console.error('Error:', err)
      setError(err.response?.data?.detail || 'An error occurred during processing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Professional Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Quick Analysis Pipeline
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your climate data CSV for instant analysis with automated preprocessing, 
              MapReduce operations, and comprehensive visualization
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Data Source
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-40 px-4 transition-all bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 mb-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      {file ? (
                        <div className="text-center">
                          <p className="mb-1 text-sm font-semibold text-indigo-600">
                            <FileText className="inline w-4 h-4 mr-1" />
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="mb-2 text-sm font-medium text-gray-700">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            CSV files only (Max 100MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {progress && loading && (
                <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-indigo-800">Processing</p>
                      <p className="text-sm text-indigo-700">{progress}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Zap className="w-6 h-6" />
                {loading ? 'Processing Data...' : 'Start Analysis'}
              </button>
            </form>
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-8">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6">
                <div className="flex items-center text-white">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Analysis Complete</h3>
                    <p className="text-emerald-50">Your data has been successfully processed and analyzed</p>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <Database className="w-8 h-8 text-indigo-600" />
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Collection</p>
                  <p className="text-2xl font-bold text-gray-900 truncate" title={results.collection_name}>
                    {results.collection_name?.split('_').slice(-3).join('_')}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="w-8 h-8" />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm font-medium text-purple-100 mb-1">Total Records</p>
                  <p className="text-3xl font-bold">{results.documents_count?.toLocaleString()}</p>
                </div>

                {results.preprocessing && (
                  <>
                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium text-pink-100 mb-1">Removed</p>
                      <p className="text-3xl font-bold">{results.preprocessing.removed_count?.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-3">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium text-teal-100 mb-1">Clean Records</p>
                      <p className="text-3xl font-bold">{results.preprocessing.final_count?.toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Preprocessing Details */}
              {results.preprocessing && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    Data Preprocessing Summary
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Original Dataset</p>
                      <p className="text-4xl font-bold text-indigo-600 mb-1">
                        {results.preprocessing.original_count?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">records uploaded</p>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-pink-100">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Data Cleaned</p>
                      <p className="text-4xl font-bold text-pink-600 mb-1">
                        {results.preprocessing.removed_count?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">invalid records removed</p>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-teal-100">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Final Dataset</p>
                      <p className="text-4xl font-bold text-teal-600 mb-1">
                        {results.preprocessing.final_count?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">ready for analysis</p>
                    </div>
                  </div>
                </div>
              )}

              {/* MapReduce Operations */}
              {results.mapreduce_results && results.mapreduce_results.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    MapReduce Operations
                  </h2>
                  <div className="space-y-4">
                    {results.mapreduce_results.map((result, idx) => (
                      <div
                        key={idx}
                        className="p-6 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all bg-gradient-to-r from-gray-50 to-slate-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{result.operation}</h3>
                          <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                            {result.results?.length || 0} results
                          </span>
                        </div>
                        {result.results && result.results.length > 0 && (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
                              View Results
                            </summary>
                            <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-xs text-green-400 font-mono">
                                {JSON.stringify(result.results.slice(0, 5), null, 2)}
                              </pre>
                              {result.results.length > 5 && (
                                <p className="text-xs text-gray-400 mt-2">
                                  ... and {result.results.length - 5} more results
                                </p>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Data Table */}
              {results.sample_data && results.sample_data.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    Sample Data Preview
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-slate-100">
                        <tr>
                          {Object.keys(results.sample_data[0]).map((key) => (
                            <th
                              key={key}
                              className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.sample_data.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            {Object.values(row).map((value, vidx) => (
                              <td key={vidx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {value !== null && value !== undefined ? String(value) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Temperature Statistics */}
              {results.statistics && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    Temperature Analytics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                      <p className="text-sm font-medium text-purple-100 mb-2">Average Temperature</p>
                      <p className="text-4xl font-bold mb-1">
                        {results.statistics.avg_temp?.toFixed(2)}°C
                      </p>
                      <p className="text-xs text-purple-200">Mean global value</p>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg">
                      <p className="text-sm font-medium text-red-100 mb-2">Maximum Temperature</p>
                      <p className="text-4xl font-bold mb-1">
                        {results.statistics.max_temp?.toFixed(2)}°C
                      </p>
                      <p className="text-xs text-red-200">Highest recorded</p>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                      <p className="text-sm font-medium text-cyan-100 mb-2">Minimum Temperature</p>
                      <p className="text-4xl font-bold mb-1">
                        {results.statistics.min_temp?.toFixed(2)}°C
                      </p>
                      <p className="text-xs text-cyan-200">Lowest recorded</p>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                      <p className="text-sm font-medium text-emerald-100 mb-2">Geographic Coverage</p>
                      <p className="text-4xl font-bold mb-1">
                        {results.statistics.unique_countries}
                      </p>
                      <p className="text-xs text-emerald-200">Countries analyzed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
