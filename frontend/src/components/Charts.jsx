import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Thermometer, Globe, Calendar, AlertTriangle } from 'lucide-react'

export function AverageTempChart({ data }) {
  return (
    <div className="chart-container">
      <h3 className="subsection-title flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-red-500" />
        📈 Average Temperature by Country (Top 15)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data?.slice(0, 15)} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="Country" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            formatter={(value) => `${value.toFixed(2)}°C`}
          />
          <Bar dataKey="average" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TemperatureTrendsChart({ data }) {
  return (
    <div className="chart-container">
      <h3 className="subsection-title flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        📉 Temperature Trends by Year
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            formatter={(value) => `${value.toFixed(2)}°C`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Average" isAnimationActive={true} />
          <Line type="monotone" dataKey="min" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Min" />
          <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Max" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SeasonalAnalysisChart({ data }) {
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444']
  
  return (
    <div className="chart-container">
      <h3 className="subsection-title flex items-center gap-2">
        <Calendar className="w-5 h-5 text-amber-500" />
        🔄 Seasonal Temperature Analysis
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}°C`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="average"
            animationBegin={0}
            animationDuration={800}
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(2)}°C`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DecadeAnalysisChart({ data }) {
  return (
    <div className="chart-container">
      <h3 className="subsection-title flex items-center gap-2">
        <Globe className="w-5 h-5 text-purple-500" />
        📅 Decade Temperature Analysis
      </h3>
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
      <h3 className="subsection-title flex items-center gap-2">
        <Globe className="w-5 h-5 text-green-500" />
        📊 Records per Country (Top 20)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data?.slice(0, 20)} layout="vertical" margin={{ top: 0, right: 30, left: 120, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" />
          <YAxis dataKey="Country" width={110} type="category" tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            formatter={(value) => value.toLocaleString()}
          />
          <Bar dataKey="record_count" fill="#10b981" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ExtremeTempsTable({ data }) {
  return (
    <div className="chart-container">
      <h3 className="subsection-title flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        🌡️ Extreme Temperatures (Top 10 Records)
      </h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="px-4 py-3 text-left">🗓️ Date</th>
              <th className="px-4 py-3 text-left">🌍 Country</th>
              <th className="px-4 py-3 text-right">🌡️ Temperature (°C)</th>
              <th className="px-4 py-3 text-center">Type</th>
            </tr>
          </thead>
          <tbody>
            {data?.slice(0, 10).map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-blue-50 transition-colors">
                <td className="px-4 py-3 text-sm">{item.dt}</td>
                <td className="px-4 py-3 text-sm font-medium">{item.Country}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">
                  {item.AverageTemperature?.toFixed(2) || 'N/A'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    item.AverageTemperature > 20 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.AverageTemperature > 20 ? '🔥 Hot' : '❄️ Cold'}
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
