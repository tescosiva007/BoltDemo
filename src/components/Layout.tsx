import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Store, 
  Package, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  FileText, 
  Settings, 
  Shield,
  LogOut
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: Store, label: 'Stores', path: '/stores' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Truck, label: 'Suppliers', path: '/suppliers' },
    { icon: CreditCard, label: 'Credits', path: '/credits' },
    { icon: RotateCcw, label: 'Returns', path: '/returns' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Service Status', path: '/service-status' },
    { icon: Shield, label: 'Admin', path: '/admin' },
  ]

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="min-h-screen bg-red-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">Demo</h1>
        </div>
        
        <nav className="flex-1 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive(item.path)
                    ? 'bg-red-600 text-white'
                    : 'text-white hover:bg-blue-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white px-6 py-4 shadow-sm flex justify-end items-center">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
              {profile?.full_name || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 bg-white m-6 rounded-lg shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout