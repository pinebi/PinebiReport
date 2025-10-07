'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FileText, 
  BarChart3, 
  Settings, 
  User, 
  X, 
  Menu, 
  Bell,
  Search,
  Activity
} from 'lucide-react'
import { useMobileNavigation } from '@/hooks/use-responsive'
import { HoverScale } from '@/components/ui/hover-scale'

interface MobileNavigationProps {
  user?: {
    username: string
    role: string
  }
}

const mobileMenuItems = [
  {
    id: 'home',
    label: 'Ana Sayfa',
    icon: <Home className="w-5 h-5" />,
    href: '/'
  },
  {
    id: 'analytics',
    label: 'Analizler',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/analytics'
  },
  {
    id: 'reports',
    label: 'Raporlar',
    icon: <FileText className="w-5 h-5" />,
    href: '/reports'
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: <Activity className="w-5 h-5" />,
    href: '/performance'
  },
  {
    id: 'products',
    label: 'Ürünler',
    icon: <FileText className="w-5 h-5" />,
    href: '/products'
  },
  {
    id: 'companies',
    label: 'Şirketler',
    icon: <FileText className="w-5 h-5" />,
    href: '/companies'
  },
  {
    id: 'users',
    label: 'Kullanıcılar',
    icon: <User className="w-5 h-5" />,
    href: '/users'
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: <Settings className="w-5 h-5" />,
    href: '/api-config'
  }
]

export default function MobileNavigation({ user }: MobileNavigationProps) {
  const pathname = usePathname()
  const { isMenuOpen, toggleMenu, closeMenu, isMobile } = useMobileNavigation()

  if (!isMobile) return null

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden p-2 rounded-md text-slate-200 hover:text-white hover:bg-slate-600 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {/* Pinebi Logo */}
                  <div className="w-8 h-8 relative">
                    <div className="absolute inset-0">
                      <div className="absolute left-0 top-0 w-0.5 h-full bg-[#A7F300] rounded-full"></div>
                      <div className="absolute left-0.5 top-2 w-2 h-0.5 bg-[#A7F300] rounded-full"></div>
                      <div className="absolute left-0.5 top-0 w-0.5 h-1.5 bg-[#A7F300] rounded-full"></div>
                      <div className="absolute left-3 top-0.5">
                        <div className="w-0 h-0 border-l-[4px] border-l-[#A7F300] border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent"></div>
                      </div>
                      <div className="absolute left-4 top-2 w-3 h-0.5 bg-[#A7F300] rounded-full"></div>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Pinebi</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto">
                <nav className="p-4 space-y-2">
                  {mobileMenuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <HoverScale key={item.id} scale={1.02}>
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                            ${isActive 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <div className={`
                            ${isActive 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-500 dark:text-gray-400'
                            }
                          `}>
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </HoverScale>
                    )
                  })}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span>Bildirimler</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Ayarlar</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Mobile Bottom Navigation
export function MobileBottomNavigation() {
  const pathname = usePathname()
  const { isMobile } = useMobileNavigation()

  if (!isMobile) return null

  const bottomNavItems = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      icon: <Home className="w-5 h-5" />,
      href: '/'
    },
    {
      id: 'analytics',
      label: 'Analiz',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/analytics'
    },
    {
      id: 'reports',
      label: 'Raporlar',
      icon: <FileText className="w-5 h-5" />,
      href: '/reports'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <Activity className="w-5 h-5" />,
      href: '/performance'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: <User className="w-5 h-5" />,
      href: '/profile'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="grid grid-cols-4 h-16">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center space-y-1 transition-colors
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}
            >
              <div className={`
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
