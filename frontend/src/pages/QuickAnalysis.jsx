import { useState } from 'react'
import { Upload, Loader, CheckCircle, AlertCircle, BarChart3, Database } from 'lucide-react'
import { climateAPI } from '../api/api'

export function QuickAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState('')

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setError(null)
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select a CSV file')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setResults(null)

    try {
      setProgress('📥 Uploading file...')
      const formData = new FormData()
      formData.append('file', selectedFile)

      setProgress('⚙️ Processing data...')
      const response = await climateAPI.completePipeline(formData)

      setProgress('')
      setResults(response.data)
      setSuccess(response.data.message)
      setSelectedFile(null)
    } catch (err) {
      setProgress('')
      setError(err.response?.data?.detail || err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <BarChart3 className="w-10 h-10 text-blue-600" />
            Quick Analysis
          </h1>
          <p className="text-gray-600">Upload CSV → Preprocess → MapReduce → Visualize</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Dataset
              </h2>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {selectedFile.name}
                    </p>
                  )}
                </div>

                {progress && (
                  <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    {progress}
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      Analyze Dataset
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {success ? (
              <div className="space-y-4">
                {/* Success Message */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-green-800">Analysis Complete! 🎉</h3>
                      <p className="text-sm text-green-700 mt-1">{success}</p>
                    </div>
                  </div>
                </div>

                {/* Collection Info */}
                {results && (
                  <>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Collection Info
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Collection Name</p>
                          <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                            {results.collection}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Documents</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {results.total_documents.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Removed Records</p>
                          <p className="text-lg font-bold text-red-600">
                            -{results.removed_records.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fields</p>
                          <p className="text-sm font-medium text-gray-700">
                            {results.fields.length} columns
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MapReduce Operations */}
                    {results.mapreduce && (
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="font-bold text-gray-800 mb-4">
                          🔄 MapReduce Operations ({results.mapreduce.operations.length})
                        </h3>
                        <div className="space-y-2">
                          {results.mapreduce.operations.map((op) => (
                            <div key={op} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-gray-700">{op}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analysis Results */}
                    {results.mapreduce.results && (
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="font-bold text-gray-800 mb-4">📊 Analysis Results</h3>
                        
                        <div className="space-y-4">
                          {results.mapreduce.results.avg_by_group && (
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Average by Group (Top 5)</h4>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {results.mapreduce.results.avg_by_group.slice(0, 5).map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                    <span className="font-medium">{item._id}</span>
                                    <span className="text-blue-600 font-bold">{item.avg?.toFixed(2) || 'N/A'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {results.mapreduce.results.stats && (
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Temperature Statistics</h4>
                              {results.mapreduce.results.stats.map((stat, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="p-2 bg-blue-50 rounded">
                                    <p className="text-gray-600">Average</p>
                                    <p className="font-bold text-blue-600">{stat.avg?.toFixed(2)}°C</p>
                                  </div>
                                  <div className="p-2 bg-red-50 rounded">
                                    <p className="text-gray-600">Max</p>
                                    <p className="font-bold text-red-600">{stat.max?.toFixed(2)}°C</p>
                                  </div>
                                  <div className="p-2 bg-blue-50 rounded">
                                    <p className="text-gray-600">Min</p>
                                    <p className="font-bold text-blue-600">{stat.min?.toFixed(2)}°C</p>
                                  </div>
                                  <div className="p-2 bg-gray-50 rounded">
                                    <p className="text-gray-600">Count</p>
                                    <p className="font-bold text-gray-700">{stat.count?.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {results.mapreduce.results.distribution && (
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Top Distribution (Top 5)</h4>
                              <div className="space-y-1 max-h-40 overflow-y-auto">
                                {results.mapreduce.results.distribution.slice(0, 5).map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                    <span className="font-medium">{item._id}</span>
                                    <span className="text-purple-600 font-bold">{item.count} records</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sample Data */}
                    {results.sample_data && results.sample_data.length > 0 && (
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="font-bold text-gray-800 mb-4">📋 Sample Data (First 5 Records)</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-200">
                                {results.fields.slice(0, 5).map((field) => (
                                  <th key={field} className="border border-gray-300 px-2 py-1 text-left">
                                    {field}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {results.sample_data.map((row, ridx) => (
                                <tr key={ridx} className={ridx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  {results.fields.slice(0, 5).map((field) => (
                                    <td key={field} className="border border-gray-300 px-2 py-1 truncate max-w-xs">
                                      {String(row[field] ?? '').substring(0, 30)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Upload a CSV file to begin analysis</p>
                <p className="text-gray-400 text-sm mt-2">The system will automatically:</p>
                <ul className="text-gray-400 text-sm mt-2 space-y-1">
                  <li>✓ Upload to MongoDB</li>
                  <li>✓ Preprocess the data</li>
                  <li>✓ Run MapReduce</li>
                  <li>✓ Show visualizations</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
