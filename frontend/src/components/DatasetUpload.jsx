import { useState } from 'react'
import { Upload, Loader } from 'lucide-react'
import { climateAPI } from '../api/api'

export function DatasetUpload({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [datasetName, setDatasetName] = useState('country')

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setError(null)
  }

  const handleUpload = async (e) => {
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
      onUploadSuccess?.(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="subsection-title flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload Dataset
      </h3>
      
      <form onSubmit={handleUpload} className="space-y-4">
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
              Upload Dataset
            </>
          )}
        </button>
      </form>
    </div>
  )
}
