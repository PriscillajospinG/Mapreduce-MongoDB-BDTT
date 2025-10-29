import { useState } from 'react'
import { Upload, Loader, Database, Check, AlertCircle, PlayCircle } from 'lucide-react'
import { climateAPI } from '../api/api'

export function DatasetUpload({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [datasetName, setDatasetName] = useState('country')
  const [uploadMode, setUploadMode] = useState('csv-to-mongo') // 'csv-to-mongo' or 'dataset'
  const [uploadResponse, setUploadResponse] = useState(null)
  const [runningMapReduce, setRunningMapReduce] = useState(false)

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setError(null)
    setSuccess(null)
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
        Upload CSV Data
      </h3>

      {/* Mode Selection */}
      <div className="mb-6 flex gap-2 border-b pb-4">
        <button
          onClick={() => setUploadMode('csv-to-mongo')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMode === 'csv-to-mongo'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Upload to MongoDB
        </button>
        <button
          onClick={() => setUploadMode('dataset')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMode === 'dataset'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Replace Dataset
        </button>
      </div>

      {uploadMode === 'csv-to-mongo' ? (
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
