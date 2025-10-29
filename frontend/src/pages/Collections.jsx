import { useState, useEffect } from 'react'
import { Database, RefreshCw, Loader, AlertCircle, Play } from 'lucide-react'
import { climateAPI } from '../api/api'

export function Collections() {
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [collectionData, setCollectionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState(null)
  const [runningMapReduce, setRunningMapReduce] = useState(null)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await climateAPI.getUploadedCollections()
      setCollections(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load collections')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadCollection = async (collectionName) => {
    setSelectedCollection(collectionName)
    setDataLoading(true)
    setError(null)
    try {
      const response = await climateAPI.getCollectionData(collectionName, 10)
      setCollectionData(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load collection data')
    } finally {
      setDataLoading(false)
    }
  }

  const handleRunMapReduce = async (collectionName) => {
    setRunningMapReduce(collectionName)
    setError(null)
    try {
      const response = await climateAPI.runMapReduceOnCollection(collectionName)
      alert(`✅ ${response.data.message}\n\nOperations completed: ${response.data.operations.join(', ')}`)
      // Reload collections to see new results
      await loadCollections()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to run MapReduce')
    } finally {
      setRunningMapReduce(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-blue-500" />
          MongoDB Collections
        </h1>
        <p className="text-gray-600">View and manage all uploaded collections and MapReduce results</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Collections List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">📁 Collections</h2>
              <button
                onClick={loadCollections}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No collections found</p>
                <p className="text-sm">Upload a CSV to get started</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {collections.map((collection) => (
                  <button
                    key={collection.collection_name}
                    onClick={() => handleLoadCollection(collection.collection_name)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCollection === collection.collection_name
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-800 truncate">
                      {collection.collection_name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      📊 {collection.document_count.toLocaleString()} docs
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      📅 {new Date(collection.upload_date).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Collection Details */}
        <div className="lg:col-span-2">
          {selectedCollection ? (
            <div className="space-y-6">
              {/* Collection Info */}
              <div className="card">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  📋 Collection Info
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-gray-700">Name:</strong>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                      {selectedCollection}
                    </code>
                  </div>
                  {collectionData && (
                    <>
                      <div>
                        <strong className="text-gray-700">Total Documents:</strong>
                        <span className="ml-2 text-blue-600 font-semibold">
                          {collectionData.document_count.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-700">Fields:</strong>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {collectionData.documents && collectionData.documents[0] ? (
                            Object.keys(collectionData.documents[0]).map((field) => (
                              <span
                                key={field}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                              >
                                {field}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No fields available</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleRunMapReduce(selectedCollection)}
                  disabled={runningMapReduce === selectedCollection}
                  className="mt-4 w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {runningMapReduce === selectedCollection ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Running MapReduce...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run MapReduce
                    </>
                  )}
                </button>
              </div>

              {/* Sample Data */}
              {collectionData && collectionData.documents && collectionData.documents.length > 0 && (
                <div className="card">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    📊 Sample Data (First {collectionData.documents.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          {Object.keys(collectionData.documents[0]).map((field) => (
                            <th
                              key={field}
                              className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700"
                            >
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {collectionData.documents.map((doc, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {Object.keys(collectionData.documents[0]).map((field) => (
                              <td
                                key={field}
                                className="border border-gray-300 px-3 py-2 truncate max-w-xs"
                                title={String(doc[field] ?? '')}
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

              {dataLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a collection to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
