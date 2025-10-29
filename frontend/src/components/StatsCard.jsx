import { Activity, Zap, Database } from 'lucide-react'

export function StatCard({ title, value, unit, icon: Icon, color = 'blue' }) {
  const bgColor = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100'
  }[color]

  const textColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  }[color]

  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

export function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total Records"
        value={stats?.total_records}
        unit="records"
        icon={Database}
        color="blue"
      />
      <StatCard
        title="Datasets"
        value={stats?.dataset_count || 5}
        unit="datasets"
        icon={Activity}
        color="green"
      />
      <StatCard
        title="Average Temp"
        value={stats?.avg_temperature?.toFixed(1)}
        unit="°C"
        icon={Zap}
        color="red"
      />
    </div>
  )
}
