import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { DatasetUpload } from '../components/DatasetUpload'
import { climateAPI } from '../api/api'

export function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState(null)
  const [preprocessing, setPreprocessing] = useState(false)
  const [runningMapReduce, setRunningMapReduce] = useState(false)

  const handleUploadSuccess = (response) => {
    setUploadStatus({
      type: 'success',
      message: response.message || 'Dataset uploaded successfully!'
    })
    setTimeout(() => setUploadStatus(null), 5000)
  }

  const handlePreprocess = async (datasetName) => {
    try {
      setPreprocessing(true)
      const response = await climateAPI.preprocessData(datasetName)
      setUploadStatus({
        type: 'success',
        message: `Preprocessing complete: ${response.data.message}`
      })
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.response?.data?.error || 'Preprocessing failed'
      })
    } finally {
      setPreprocessing(false)
    }
  }

  const handleRunMapReduce = async () => {
    try {
      setRunningMapReduce(true)
      const response = await climateAPI.runMapReduce()
      setUploadStatus({
        type: 'success',
        message: `MapReduce complete: ${response.data.message}`
      })
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.response?.data?.error || 'MapReduce failed'
      })
    } finally {
      setRunningMapReduce(false)
    }
  }

  return (
    <div className="container">
      <h1 className="section-title flex items-center gap-2">
        <Upload className="w-8 h-8" />
        Data Management
      </h1>

      {/* Status Messages */}
      {uploadStatus && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          uploadStatus.type === 'success'
            ? 'bg-green-100 text-green-700 border border-green-400'
            : 'bg-red-100 text-red-700 border border-red-400'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div>
          <DatasetUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Operations Section */}
        <div>
          <div className="card">
            <h3 className="subsection-title">Data Processing</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preprocess Dataset
                </label>
                <select
                  id="dataset-select"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                >
                  <option value="">Select dataset</option>
                  <option value="country">Country</option>
                  <option value="city">City</option>
                  <option value="state">State</option>
                  <option value="major_city">Major City</option>
                  <option value="global">Global</option>
                </select>
                <button
                  onClick={() => {
                    const dataset = document.getElementById('dataset-select').value
                    if (dataset) handlePreprocess(dataset)
                  }}
                  disabled={preprocessing}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {preprocessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Preprocess Data'
                  )}
                </button>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={handleRunMapReduce}
                  disabled={runningMapReduce}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {runningMapReduce ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Running MapReduce...
                    </>
                  ) : (
                    'Run MapReduce Operations'
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Executes all 6 MapReduce operations
                </p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="card mt-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Processing Steps</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Upload CSV dataset</li>
              <li>Preprocess (clean & transform)</li>
              <li>Run MapReduce operations</li>
              <li>View results in Analytics</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
