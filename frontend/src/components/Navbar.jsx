import { Link, useLocation } from 'react-router-dom'
import { Gauge, BarChart3, Download, Settings, Thermometer, Github, ExternalLink, Database, Zap } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Gauge },
    { path: '/quick-analysis', label: 'Quick Analysis', icon: Zap },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/upload', label: 'Upload', icon: Download },
    { path: '/collections', label: 'Collections', icon: Database },
    { path: '/settings', label: 'Settings', icon: Settings }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Climate Analytics Platform
              </h1>
              <p className="text-xs text-gray-500 font-medium">Big Data Processing System</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-all ${
                  isActive(path)
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="http://localhost:5001/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="API Documentation"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-1 pb-4 border-t border-gray-100 pt-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-all ${
                  isActive(path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
