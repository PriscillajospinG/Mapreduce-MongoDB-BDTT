import { Activity, Database, Thermometer, TrendingUp, Layers, Zap } from 'lucide-react'

export function StatCard({ title, value, unit, icon: Icon, color = 'blue' }) {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      gradient: 'from-red-500 to-red-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    }
  }[color]

  return (
    <div className="card hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <p className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${colorStyles.gradient}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorStyles.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${colorStyles.text}`} />
        </div>
      </div>
    </div>
  )
}

export function StatsGrid({ stats }) {
  if (!stats) return null

  const totalDatasets = Object.keys(stats?.datasets || {}).filter(key => stats.datasets[key].records > 0).length

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Records"
          value={stats?.total_records}
          unit="records"
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Avg Temperature"
          value={stats?.avg_temperature?.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          color="red"
        />
        <StatCard
          title="Active Datasets"
          value={totalDatasets}
          unit="datasets"
          icon={Layers}
          color="green"
        />
        <StatCard
          title="Data Status"
          value="Ready"
          unit="✓"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Dataset Breakdown */}
      <div className="card">
        <h3 className="subsection-title flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Dataset Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(stats?.datasets || {}).map(([key, data]) => (
            data.records > 0 && (
              <div key={key} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  {key.replace('_', ' ')}
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {(data.records / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.records.toLocaleString()} records
                </p>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${(data.records / stats.total_records) * 100}%` }}
                  />
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
