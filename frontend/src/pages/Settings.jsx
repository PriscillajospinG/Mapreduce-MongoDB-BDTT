import { Settings, Database, Zap, Eye } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="container">
      <h1 className="section-title flex items-center gap-2">
        <Settings className="w-8 h-8" />
        Settings & Configuration
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Configuration */}
        <div className="card">
          <h3 className="subsection-title flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backend Configuration
          </h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <label className="font-semibold text-gray-700">Database Type</label>
              <p className="text-gray-600">MongoDB</p>
            </div>
            
            <div>
              <label className="font-semibold text-gray-700">Processing Engine</label>
              <p className="text-gray-600">PySpark & MapReduce</p>
            </div>
            
            <div>
              <label className="font-semibold text-gray-700">Backend URL</label>
              <p className="text-gray-600">http://localhost:5000</p>
            </div>
            
            <div>
              <label className="font-semibold text-gray-700">API Version</label>
              <p className="text-gray-600">v1.0</p>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="card">
          <h3 className="subsection-title flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Settings
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
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
