import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Database, FileText } from 'lucide-react'
import { climateAPI } from '../api/api'

export function UploadPage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setUploadStatus(null)
    } else {
      setUploadStatus({
        type: 'error',
        message: 'Please select a valid CSV file'
      })
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file first'
      })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const response = await climateAPI.uploadCSV(formData)
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${file.name} - ${response.data.count || 0} records`
      })
      setFile(null)
      // Reset file input
      document.getElementById('file-upload').value = ''
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.response?.data?.detail || 'Upload failed. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Data Management</h1>
            </div>
            <p className="text-lg text-gray-600">
              Upload climate datasets in CSV format to MongoDB
            </p>
          </div>

          {/* Status Message */}
          {uploadStatus && (
            <div className={`mb-6 p-4 rounded-xl border-l-4 ${
              uploadStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-center gap-3">
                {uploadStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${
                    uploadStatus.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {uploadStatus.type === 'success' ? 'Success' : 'Error'}
                  </p>
                  <p className={`text-sm ${
                    uploadStatus.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {uploadStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Upload className="w-6 h-6 text-indigo-600" />
              Upload Dataset
            </h2>

            <div className="space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-48 px-4 transition-all bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <FileText className="w-16 h-16 mb-3 text-indigo-600" />
                        <p className="mb-2 text-lg font-semibold text-indigo-700">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Click to change file
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 mb-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        <p className="mb-2 text-lg font-medium text-gray-700">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          CSV files only (Max 100MB)
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading to MongoDB...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Upload to Database
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Available Datasets Info */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Available Datasets</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>GlobalLandTemperaturesByCountry.csv</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>GlobalLandTemperaturesByCity.csv</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>GlobalLandTemperaturesByState.csv</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>GlobalLandTemperaturesByMajorCity.csv</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>GlobalTemperatures.csv</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Tip:</span> After uploading, use <strong>Quick Analysis</strong> to automatically process and analyze your data.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
