'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, 
  FileText, 
  Settings, 
  HelpCircle, 
  User, 
  LogOut,
  ChevronDown,
  Bell,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clsx } from 'clsx'

interface TopMenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  children?: TopMenuItem[]
}

const topMenuItems: TopMenuItem[] = [
  {
    id: 'home',
    label: 'Ana Sayfa',
    icon: <Home className="w-4 h-4" />,
    href: '/'
  },
  {
    id: 'reports',
    label: 'Raporlar',
    icon: <FileText className="w-4 h-4" />,
    href: '/reports',
    children: [
      {
        id: 'report-dashboard',
        label: 'Rapor Dashboard',
        icon: <FileText className="w-4 h-4" />,
        href: '/reports/dashboard'
      },
      {
        id: 'report-categories',
        label: 'Kategoriler',
        icon: <FileText className="w-4 h-4" />,
        href: '/reports/categories'
      }
    ]
  },
  {
    id: 'mikroforce',
    label: 'MikroForce',
    icon: <Settings className="w-4 h-4" />,
    href: '/mikroforce',
    children: [
      {
        id: 'companies',
        label: 'Firma Yönetimi',
        icon: <Settings className="w-4 h-4" />,
        href: '/companies'
      },
      {
        id: 'users',
        label: 'Kullanıcı Yönetimi',
        icon: <Settings className="w-4 h-4" />,
        href: '/users'
      }
    ]
  },
  {
    id: 'applications',
    label: 'Uygulamalar',
    icon: <Settings className="w-4 h-4" />,
    href: '/applications',
    children: [
      {
        id: 'api-config',
        label: 'API Yapılandırması',
        icon: <Settings className="w-4 h-4" />,
        href: '/api-config'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: <Settings className="w-4 h-4" />,
    href: '/settings'
  },
  {
    id: 'help',
    label: 'Yardım',
    icon: <HelpCircle className="w-4 h-4" />,
    href: '/help'
  }
]

export function TopHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const handleDropdownToggle = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId)
  }

  const closeDropdown = () => {
    setActiveDropdown(null)
  }

  if (!user) {
    return null
  }

  return (
    <header className="bg-slate-700 text-white shadow-lg border-b border-slate-600">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="text-red-500 font-bold text-lg">MİKRO</div>
              <div className="text-white font-bold text-lg">FORCE</div>
            </div>
          </Link>
        </div>

        {/* Top Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-1">
          {topMenuItems.map((item) => (
            <div key={item.id} className="relative">
              {item.children ? (
                <div className="relative">
                  <button
                    onClick={() => handleDropdownToggle(item.id)}
                    className={clsx(
                      'flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      'hover:bg-slate-600',
                      pathname.startsWith(item.href) && item.href !== '/' 
                        ? 'bg-slate-600 text-white' 
                        : 'text-slate-200 hover:text-white'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ChevronDown className={clsx(
                      'w-4 h-4 transition-transform',
                      activeDropdown === item.id && 'rotate-180'
                    )} />
                  </button>
                  
                  {activeDropdown === item.id && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={closeDropdown}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    'hover:bg-slate-600',
                    pathname === item.href 
                      ? 'bg-slate-600 text-white' 
                      : 'text-slate-200 hover:text-white'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right Side - Search, Notifications, User */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ara..."
                className="bg-slate-600 text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-500"
              />
            </div>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-200 hover:text-white hover:bg-slate-600 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('user')}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-600 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-white">{user.username}</div>
                <div className="text-xs text-slate-300">
                  {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                </div>
              </div>
              <ChevronDown className={clsx(
                'w-4 h-4 transition-transform text-slate-300',
                activeDropdown === 'user' && 'rotate-180'
              )} />
            </button>

            {activeDropdown === 'user' && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    closeDropdown()
                    logout()
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeDropdown}
        />
      )}
    </header>
  )
}
