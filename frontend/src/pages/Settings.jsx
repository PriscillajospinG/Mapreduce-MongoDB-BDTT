import { Settings, Database, Zap, Eye, Server, Code, AlertCircle, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { climateAPI } from '../api/api'

export function SettingsPage() {
  const [backendStatus, setBackendStatus] = useState(null)
  const [mongoStatus, setMongoStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      setLoading(true)
      const response = await climateAPI.getHealth()
      setBackendStatus({
        status: response.data.status,
        mongo: response.data.mongo_available
      })
      setMongoStatus(response.data.mongo_available)
    } catch (err) {
      setBackendStatus({ status: 'error', mongo: false })
      setMongoStatus(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container pb-12">
      <h1 className="section-title flex items-center gap-2">
        <Settings className="w-8 h-8 text-blue-600" />
        ⚙️ Settings & Configuration
      </h1>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Backend Status
            </h3>
            {backendStatus?.status === 'healthy' ? (
              <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
            )}
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-semibold">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                backendStatus?.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {backendStatus?.status === 'healthy' ? '✓ Healthy' : '✗ Offline'}
              </span>
            </p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-600" />
              MongoDB Status
            </h3>
            {mongoStatus ? (
              <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
            )}
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-semibold">Connection:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                mongoStatus 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {mongoStatus ? '✓ Connected' : '✗ Disconnected'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Configuration */}
        <div className="card">
          <h3 className="subsection-title flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Backend Configuration
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="border-l-4 border-blue-500 pl-3">
              <label className="font-semibold text-gray-700">Database Type</label>
              <p className="text-gray-600">MongoDB 4.4+</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-3">
              <label className="font-semibold text-gray-700">Processing Engine</label>
              <p className="text-gray-600">FastAPI with PyMongo</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-3">
              <label className="font-semibold text-gray-700">Backend URL</label>
              <p className="text-gray-600 font-mono">http://localhost:5001</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-3">
              <label className="font-semibold text-gray-700">API Documentation</label>
              <a href="http://localhost:5001/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                http://localhost:5001/docs →
              </a>
            </div>
          </div>
        </div>

        {/* Frontend Configuration */}
        <div className="card">
          <h3 className="subsection-title flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-600" />
            Frontend Configuration
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="border-l-4 border-blue-500 pl-3">
              <label className="font-semibold text-gray-700">Framework</label>
              <p className="text-gray-600">React 18 + Vite</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-3">
              <label className="font-semibold text-gray-700">UI Components</label>
              <p className="text-gray-600">Tailwind CSS + Recharts</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-3">
              <label className="font-semibold text-gray-700">Development URL</label>
              <p className="text-gray-600 font-mono">http://localhost:3000</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-3">
              <label className="font-semibold text-gray-700">HTTP Client</label>
              <p className="text-gray-600">Axios with auto-retry</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="subsection-title flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Performance Settings
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-gray-700">Enable data caching</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-gray-700">Auto-refresh dashboard</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-gray-700">Optimize large datasets</span>
            </label>
          </div>
        </div>

        <div className="card">
          <h3 className="subsection-title flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            Display Settings
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-gray-700">Dark mode</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-gray-700">Show data animations</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-gray-700">Compact view</span>
            </label>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="card mt-6">
        <h3 className="subsection-title">📡 Available API Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
            <p className="font-mono text-blue-600 font-semibold">GET /api/health</p>
            <p className="text-gray-600 text-xs">System health check</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
            <p className="font-mono text-blue-600 font-semibold">GET /api/stats/summary</p>
            <p className="text-gray-600 text-xs">Overall statistics</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-500">
            <p className="font-mono text-purple-600 font-semibold">GET /api/analytics/*</p>
            <p className="text-gray-600 text-xs">6 MapReduce operations</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
            <p className="font-mono text-green-600 font-semibold">POST /api/mapreduce/run</p>
            <p className="text-gray-600 text-xs">Execute all operations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="ml-3 text-sm text-gray-700">Auto-refresh analytics</span>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="ml-3 text-sm text-gray-700">Enable data caching</span>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4" />
              <span className="ml-3 text-sm text-gray-700">Show real-time updates</span>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="ml-3 text-sm text-gray-700">Enable animations</span>
            </label>
          </div>
        </div>

        {/* Display Settings */}
        <div className="card">
          <h3 className="subsection-title flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Display Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chart Refresh Interval (seconds)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Records per page
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card bg-gray-50">
          <h3 className="subsection-title">System Information</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Frontend Version:</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">React:</span>
              <span className="font-semibold">18.2.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Update:</span>
              <span className="font-semibold">Oct 29, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="font-semibold">Production</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  )
}
