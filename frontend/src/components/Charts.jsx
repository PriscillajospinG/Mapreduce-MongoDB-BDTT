import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Thermometer, Globe, Calendar } from 'lucide-react'

export function AverageTempChart({ data }) {
  return (
    <div className="card">
      <h3 className="subsection-title flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-red-500" />
        Average Temperature by Country
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data?.slice(0, 15)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Country" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="average" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TemperatureTrendsChart({ data }) {
  return (
    <div className="card">
      <h3 className="subsection-title flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        Temperature Trends by Year
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="average" stroke="#3b82f6" name="Average" />
          <Line type="monotone" dataKey="min" stroke="#60a5fa" name="Min" />
          <Line type="monotone" dataKey="max" stroke="#ef4444" name="Max" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SeasonalAnalysisChart({ data }) {
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444']
  
  return (
    <div className="card">
      <h3 className="subsection-title flex items-center gap-2">
        <Calendar className="w-5 h-5 text-amber-500" />
        Seasonal Temperature Analysis
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
    <div className="card">
      <h3 className="subsection-title flex items-center gap-2">
        <Globe className="w-5 h-5 text-purple-500" />
        Decade Temperature Analysis
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="decade" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="average" stroke="#8b5cf6" name="Average Temp" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RecordsPerCountryChart({ data }) {
  return (
    <div className="card">
      <h3 className="subsection-title flex items-center gap-2">
        <Globe className="w-5 h-5 text-green-500" />
        Records per Country
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data?.slice(0, 20)} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="Country" width={100} type="category" />
          <Tooltip />
          <Bar dataKey="record_count" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ExtremeTempsTable({ data }) {
  return (
    <div className="card">
      <h3 className="subsection-title">Extreme Temperatures</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Country</th>
              <th className="px-4 py-2 text-right">Temperature (°C)</th>
              <th className="px-4 py-2 text-center">Type</th>
            </tr>
          </thead>
          <tbody>
            {data?.slice(0, 10).map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{item.dt}</td>
                <td className="px-4 py-2">{item.Country}</td>
                <td className="px-4 py-2 text-right font-semibold">
                  {item.AverageTemperature?.toFixed(2) || 'N/A'}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
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
