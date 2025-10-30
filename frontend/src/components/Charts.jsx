import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Thermometer, Globe, Calendar, AlertTriangle } from 'lucide-react'

export function AverageTempChart({ data }) {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-2">
        <h3 className="subsection-title flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-red-500" />
          📈 Average Temperature by Country (Top 30 Countries)
        </h3>
        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
          {data?.length || 0} countries • Real Climate Data
        </span>
      </div>
      <ResponsiveContainer width="100%" height={600}>
        <BarChart data={data?.slice(0, 30)} margin={{ top: 20, right: 30, left: 0, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="Country" 
            angle={-45} 
            textAnchor="end" 
            height={120}
            style={{ fontSize: '10px', fontWeight: 500 }}
          />
          <YAxis 
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
            domain={[0, 'dataMax + 5']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name, props) => [
              `${value.toFixed(2)}°C (${props.payload.count?.toLocaleString()} records)`,
              'Average Temperature'
            ]}
          />
          <Bar dataKey="average" radius={[8, 8, 0, 0]}>
            {data?.slice(0, 30).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.average > 25 ? '#dc2626' : entry.average > 15 ? '#f97316' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TemperatureTrendsChart({ data }) {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-2">
        <h3 className="subsection-title flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          📉 Temperature Trends Over Time (Complete Historical Data)
        </h3>
        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
          {data?.length || 0} years • Historical Climate Data
        </span>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="year" 
            style={{ fontSize: '11px' }}
            label={{ value: 'Year', position: 'insideBottom', offset: -10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            formatter={(value) => `${value.toFixed(2)}°C`}
            labelFormatter={(year) => `Year: ${year}`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            type="monotone" 
            dataKey="average" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6 }}
            name="Average Temperature" 
            isAnimationActive={true} 
          />
          <Line 
            type="monotone" 
            dataKey="min" 
            stroke="#60a5fa" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false}
            name="Minimum" 
          />
          <Line 
            type="monotone" 
            dataKey="max" 
            stroke="#ef4444" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false}
            name="Maximum" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SeasonalAnalysisChart({ data }) {
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444']
  const SEASON_COLORS = {
    'Winter': '#0ea5e9',
    'Spring': '#10b981', 
    'Summer': '#f59e0b',
    'Fall': '#ef4444',
    'Autumn': '#ef4444'
  }
  
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-2">
        <h3 className="subsection-title flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          🔄 Seasonal Temperature Patterns
        </h3>
        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
          {data?.length || 0} seasons • Real Weather Patterns
        </span>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value, percent }) => `${name}: ${value.toFixed(1)}°C (${(percent * 100).toFixed(0)}%)`}
            outerRadius={130}
            fill="#8884d8"
            dataKey="average"
            animationBegin={0}
            animationDuration={800}
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SEASON_COLORS[entry.name] || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              `${value.toFixed(2)}°C (${props.payload.count?.toLocaleString()} records)`,
              'Average Temperature'
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DecadeAnalysisChart({ data }) {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-2">
        <h3 className="subsection-title flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-500" />
          📅 Decade Temperature Analysis
        </h3>
        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
          {data?.length || 0} decades
        </span>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="decade" />
          <YAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            formatter={(value) => `${value.toFixed(2)}°C`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line type="monotone" dataKey="average" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 5 }} name="Average Temp" isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RecordsPerCountryChart({ data }) {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-2">
        <h3 className="subsection-title flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-500" />
          📊 Records per Country (Top 40 Countries)
        </h3>
        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
          {data?.length || 0} countries
        </span>
      </div>
      <ResponsiveContainer width="100%" height={800}>
        <BarChart data={data?.slice(0, 40)} layout="vertical" margin={{ top: 0, right: 30, left: 150, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" />
          <YAxis dataKey="Country" width={140} type="category" tick={{ fontSize: 11 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            formatter={(value) => value.toLocaleString()}
          />
          <Bar dataKey="record_count" radius={[0, 8, 8, 0]}>
            {data?.slice(0, 40).map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.record_count > 10000 ? '#059669' : 
                  entry.record_count > 5000 ? '#10b981' : 
                  entry.record_count > 2000 ? '#34d399' : 
                  '#6ee7b7'
                } 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ExtremeTempsTable({ data }) {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="subsection-title flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          🌡️ Extreme Temperature Records (Top 25 Events from Climate Database)
        </h3>
        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
          {data?.length || 0} extreme events • Verified Records
        </span>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table>
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left bg-gradient-to-r from-purple-100 to-pink-100">#</th>
              <th className="px-4 py-3 text-left bg-gradient-to-r from-purple-100 to-pink-100">🗓️ Date</th>
              <th className="px-4 py-3 text-left bg-gradient-to-r from-purple-100 to-pink-100">🌍 Country/Region</th>
              <th className="px-4 py-3 text-right bg-gradient-to-r from-purple-100 to-pink-100">🌡️ Temperature (°C)</th>
              <th className="px-4 py-3 text-center bg-gradient-to-r from-purple-100 to-pink-100">Classification</th>
            </tr>
          </thead>
          <tbody>
            {data?.slice(0, 25).map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">
                <td className="px-4 py-3 text-sm font-bold text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">{item.dt}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.Country}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-lg font-bold ${
                    item.AverageTemperature > 30 ? 'text-red-600' : 
                    item.AverageTemperature > 20 ? 'text-orange-600' : 
                    item.AverageTemperature > 10 ? 'text-blue-600' : 
                    'text-cyan-600'
                  }`}>
                    {item.AverageTemperature?.toFixed(2) || 'N/A'}°
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    item.AverageTemperature > 30 ? 'bg-red-100 text-red-800 border border-red-200' : 
                    item.AverageTemperature > 20 ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                    item.AverageTemperature > 10 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-cyan-100 text-cyan-800 border border-cyan-200'
                  }`}>
                    {item.AverageTemperature > 30 ? '🔥 Very Hot' : 
                     item.AverageTemperature > 20 ? '☀️ Hot' : 
                     item.AverageTemperature > 10 ? '❄️ Cool' : 
                     '🧊 Very Cold'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
