import { useState } from 'react'
import { Upload, Loader, Database, Check, AlertCircle, PlayCircle, Zap, BarChart3 } from 'lucide-react'
import { climateAPI } from '../api/api'

export function DatasetUpload({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [datasetName, setDatasetName] = useState('country')
  const [uploadMode, setUploadMode] = useState('complete-workflow') // 'complete-workflow', 'csv-to-mongo', or 'dataset'
  const [uploadResponse, setUploadResponse] = useState(null)
  const [runningMapReduce, setRunningMapReduce] = useState(false)
  const [progress, setProgress] = useState(null)

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setError(null)
    setSuccess(null)
  }

  const handleCompleteWorkflow = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select a CSV file')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setProgress('Uploading file...')

    try {
      setProgress('Uploading and parsing CSV...')
      const formData = new FormData()
      formData.append('file', selectedFile)

      setProgress('Processing data in MongoDB...')
      const response = await climateAPI.completeAnalysisWorkflow(formData)
      
      setUploadResponse(response.data)
      setSuccess(`✅ Complete analysis workflow finished!\n📊 ${response.data.document_count.toLocaleString()} documents processed\n🔄 ${response.data.mapreduce.operations_completed} MapReduce operations completed`)
      setProgress(null)
      setSelectedFile(null)
      onUploadSuccess?.(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Workflow failed')
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadToMongoDB = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select a CSV file')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await climateAPI.uploadCSVToMongoDB(formData)
      
      setUploadResponse(response.data)
      setSuccess(`✅ Uploaded ${response.data.document_count.toLocaleString()} documents to MongoDB collection: "${response.data.collection_name}"`)
      setSelectedFile(null)
      onUploadSuccess?.(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadDataset = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    try {
      const response = await climateAPI.uploadDataset(selectedFile, datasetName)
      setSelectedFile(null)
      setError(null)
      setSuccess('✅ Dataset uploaded successfully')
      onUploadSuccess?.(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRunMapReduce = async () => {
    if (!uploadResponse) return

    setRunningMapReduce(true)
    try {
      const response = await climateAPI.runMapReduceOnCollection(uploadResponse.collection_name)
      setSuccess(`✅ MapReduce completed! ${response.data.operations_completed} operations run on collection "${uploadResponse.collection_name}"`)
    } catch (err) {
      setError(`Failed to run MapReduce: ${err.response?.data?.detail || err.message}`)
    } finally {
      setRunningMapReduce(false)
    }
  }

  return (
    <div className="card">
      <h3 className="subsection-title flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload & Analyze Dataset
      </h3>

      {/* Mode Selection */}
      <div className="mb-6 flex gap-2 border-b pb-4 overflow-x-auto">
        <button
          onClick={() => setUploadMode('complete-workflow')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            uploadMode === 'complete-workflow'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Complete Workflow
        </button>
        <button
          onClick={() => setUploadMode('csv-to-mongo')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            uploadMode === 'csv-to-mongo'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          CSV Only
        </button>
        <button
          onClick={() => setUploadMode('dataset')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            uploadMode === 'dataset'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Replace Dataset
        </button>
      </div>

      {uploadMode === 'complete-workflow' ? (
        // COMPLETE WORKFLOW MODE
        <form onSubmit={handleCompleteWorkflow} className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <h4 className="font-bold text-green-800 mb-2">🚀 Complete Workflow</h4>
            <p className="text-sm text-green-700">This mode will:</p>
            <ul className="text-sm text-green-700 ml-4 mt-1 space-y-1">
              <li>✅ Upload CSV to MongoDB</li>
              <li>✅ Parse and convert to JSON</li>
              <li>✅ Preprocess the data</li>
              <li>✅ Run 4 MapReduce operations</li>
              <li>✅ Store results in collections</li>
              <li>✅ Return visualization data</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📁 Select CSV File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2">✓ Selected: {selectedFile.name}</p>
            )}
          </div>

          {progress && (
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>{progress}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 text-green-700 rounded-lg text-sm flex items-start gap-2">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line">{success}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Complete Workflow
              </>
            )}
          </button>

          {/* Display Results */}
          {uploadResponse && (
            <div className="mt-6 space-y-4">
              {/* Collection Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">📊 Collection Info</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Collection:</strong>{' '}
                    <code className="bg-gray-200 px-2 py-1 rounded">{uploadResponse.collection_name}</code>
                  </p>
                  <p>
                    <strong>Documents:</strong> {uploadResponse.document_count.toLocaleString()}
                  </p>
                  <p>
                    <strong>Fields:</strong> {uploadResponse.fields.join(', ')}
                  </p>
                </div>
              </div>

              {/* Preprocessing Stats */}
              {uploadResponse.preprocessing && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">🔧 Preprocessing Results</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>Nulls Removed: {uploadResponse.preprocessing.removed_nulls}</p>
                    <p>Duplicates Removed: {uploadResponse.preprocessing.removed_duplicates}</p>
                    <p>Type Conversions: {uploadResponse.preprocessing.type_conversions}</p>
                  </div>
                </div>
              )}

              {/* MapReduce Results */}
              {uploadResponse.mapreduce && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">🔄 MapReduce Operations</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    <strong>{uploadResponse.mapreduce.operations_completed}</strong> operations completed:
                  </p>
                  <div className="space-y-2">
                    {uploadResponse.mapreduce.operations.map((op) => (
                      <div key={op} className="text-sm text-purple-700 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{op}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Data */}
              {uploadResponse.sample_data && uploadResponse.sample_data.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">📋 Sample Data</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          {uploadResponse.fields.map((field) => (
                            <th key={field} className="border border-gray-300 px-2 py-1 text-left">
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResponse.sample_data.map((doc, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                            {uploadResponse.fields.map((field) => (
                              <td key={field} className="border border-gray-300 px-2 py-1 truncate max-w-xs">
                                {String(doc[field] ?? '').substring(0, 30)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      ) : uploadMode === 'csv-to-mongo' ? (
        // CSV to MongoDB Mode
        <form onSubmit={handleUploadToMongoDB} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📁 Select CSV File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2">✓ Selected: {selectedFile.name}</p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            💡 CSV will be automatically converted to JSON and stored in MongoDB with the filename as collection name.
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 text-green-700 rounded-lg text-sm flex items-start gap-2">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{success}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading to MongoDB...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Upload CSV to MongoDB
              </>
            )}
          </button>

          {/* Display Upload Response */}
          {uploadResponse && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Upload Complete</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Collection:</strong>{' '}
                  <code className="bg-gray-200 px-2 py-1 rounded">{uploadResponse.collection_name}</code>
                </p>
                <p>
                  <strong>Documents:</strong> {uploadResponse.document_count.toLocaleString()}
                </p>
                <p>
                  <strong>Fields:</strong> {uploadResponse.fields.join(', ')}
                </p>
              </div>

              {/* Sample Data */}
              {uploadResponse.sample_data && uploadResponse.sample_data.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-semibold text-gray-800 mb-2">📋 Sample Data (First 5):</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          {uploadResponse.fields.map((field) => (
                            <th
                              key={field}
                              className="border border-gray-300 px-2 py-1 text-left"
                            >
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResponse.sample_data.map((doc, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {uploadResponse.fields.map((field) => (
                              <td
                                key={field}
                                className="border border-gray-300 px-2 py-1 truncate max-w-xs"
                              >
                                {String(doc[field] ?? '').substring(0, 50)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Run MapReduce Button */}
              <button
                onClick={handleRunMapReduce}
                disabled={runningMapReduce}
                className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {runningMapReduce ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Running MapReduce...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    Run MapReduce on This Collection
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      ) : (
        // Dataset Replacement Mode
        <form onSubmit={handleUploadDataset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dataset Type
            </label>
            <select
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="country">Country</option>
              <option value="city">City</option>
              <option value="state">State</option>
              <option value="major_city">Major City</option>
              <option value="global">Global</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Replace Dataset
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
