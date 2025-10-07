'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, 
  FileText, 
  Settings, 
  User, 
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Activity,
  BarChart3,
  Download,
  Package,
  Calendar,
  TestTube,
  Palette,
  Menu,
  X,
  Mic,
  Bot,
  Shuffle,
  PencilRuler,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clsx } from 'clsx'
import { PWAUpdateBanner } from '@/components/ui/pwa-update-banner'
import { OfflineIndicator } from '@/components/ui/offline-indicator'

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
    label: 'Ana Panel',
    icon: <Home className="w-4 h-4" />,
    href: '/'
  },
  {
    id: 'products',
    label: 'Ürünler',
    icon: <Package className="w-4 h-4" />,
    href: '/products'
  },
  {
    id: 'calendar',
    label: 'Takvim ve Hatırlatmalar',
    icon: <Calendar className="w-4 h-4" />,
    href: '/calendar'
  },
  {
    id: 'test',
    label: 'Test Merkezi',
    icon: <TestTube className="w-4 h-4" />,
    href: '/test',
    children: [
      {
        id: 'analytics-test',
        label: 'Analytics Test',
        icon: <Activity className="w-4 h-4" />,
        href: '/test/analytics'
      },
      {
        id: 'performance-test',
        label: 'Performance Test',
        icon: <BarChart3 className="w-4 h-4" />,
        href: '/test/performance'
      },
      {
        id: 'realtime-test',
        label: 'Realtime Test',
        icon: <Activity className="w-4 h-4" />,
        href: '/test/realtime'
      },
      {
        id: 'ui-ux-test',
        label: 'UI/UX Test',
        icon: <Palette className="w-4 h-4" />,
        href: '/test/ui-ux'
      },
      {
        id: 'workflow-test',
        label: 'Workflow Test',
        icon: <Settings className="w-4 h-4" />,
        href: '/test/workflow'
      }
    ]
  },
  {
    id: 'reports',
    label: 'Raporlar',
    icon: <FileText className="w-4 h-4" />,
    href: '/reports',
    children: [
      {
        id: 'report-dashboard',
        label: 'Dashboard',
        icon: <BarChart3 className="w-4 h-4" />,
        href: '/reports/dashboard'
      },
      {
        id: 'report-categories',
        label: 'Kategoriler',
        icon: <FileText className="w-4 h-4" />,
        href: '/reports/categories'
      },
      {
        id: 'advanced-reports',
        label: 'Gelişmiş Raporlar',
        icon: <BarChart3 className="w-4 h-4" />,
        href: '/advanced-reports'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: <Settings className="w-4 h-4" />,
    href: '#',
    children: [
      {
        id: 'user-management',
        label: 'Kullanıcı Yönetimi',
        icon: <User className="w-4 h-4" />,
        href: '/user-management'
      },
      {
        id: 'system-settings',
        label: 'Sistem Ayarları',
        icon: <Settings className="w-4 h-4" />,
        href: '/system-settings'
      },
      {
        id: 'notifications',
        label: 'Bildirimler',
        icon: <Bell className="w-4 h-4" />,
        href: '/notifications'
      },
      {
        id: 'data-export',
        label: 'Veri Dışa Aktar',
        icon: <Download className="w-4 h-4" />,
        href: '/data-export'
      }
    ]
  },
  {
    id: 'theme',
    label: 'Tema',
    icon: <Palette className="w-4 h-4" />,
    href: '/theme'
  },
  {
    id: 'new-features',
    label: 'Yeni Özellikler',
    icon: <Bot className="w-4 h-4" />,
    href: '#',
    children: [
      {
        id: 'voice-commands',
        label: 'Sesli Komutlar',
        icon: <Mic className="w-4 h-4" />,
        href: '#voice'
      },
      {
        id: 'ai-chatbot',
        label: 'AI Asistan',
        icon: <Bot className="w-4 h-4" />,
        href: '#chatbot'
      },
      {
        id: 'comparison',
        label: 'Karşılaştırma Modu',
        icon: <Shuffle className="w-4 h-4" />,
        href: '/comparison'
      },
      {
        id: 'report-designer',
        label: 'Rapor Tasarımcı',
        icon: <PencilRuler className="w-4 h-4" />,
        href: '/report-designer'
      },
      {
        id: 'theme-customizer',
        label: 'Tema Kişiselleştirme',
        icon: <Palette className="w-4 h-4" />,
        href: '#theme-custom'
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp Bildirim',
        icon: <MessageSquare className="w-4 h-4" />,
        href: '#whatsapp'
      }
    ]
  }
]

export function TopHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const handleDropdownToggle = useCallback((id: string) => {
    setActiveDropdown((prev) => (prev === id ? null : id))
  }, [])

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    closeDropdown()
    setMobileMenuOpen(false)
  }, [pathname, closeDropdown])

  if (!user) {
    return null
  }

  return (
    <>
      {/* Background Pattern */}
      <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 opacity-95 z-40"></div>
      <div className="fixed top-0 left-0 right-0 h-24 opacity-10 z-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <header className="relative z-50 bg-transparent backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            
            {/* Logo and Brand - Ultra Modern */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-5 group">
                {/* Ultra Modern Pinebi Logo */}
                <div className="w-16 h-16 relative group-hover:scale-110 transition-all duration-500">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-80 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500"></div>
                  
                  {/* Main Logo Container */}
                  <div className="absolute inset-1 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl border border-white/30"></div>
                  
                  {/* Inner Logo */}
                  <div className="absolute inset-3 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>
                      <span className="text-white font-black text-xl relative z-10">P</span>
                    </div>
                  </div>
                  
                  {/* Floating Particles */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700"></div>
                </div>
                
                {/* Pinebi Text - Ultra Modern */}
                <div className="flex flex-col">
                  <span className="text-white font-black text-3xl leading-none group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-500">
                    Pinebi
                  </span>
                  <span className="text-cyan-200 text-sm font-semibold leading-none tracking-wider group-hover:text-white transition-colors duration-300">
                    REPORT SYSTEM
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Ultra Modern */}
            <nav className="hidden lg:flex items-center space-x-3">
              {topMenuItems.map((item, index) => (
                <div key={item.id} className="relative group">
                  {item.children ? (
                    <div className="relative">
                      <button
                        onClick={() => handleDropdownToggle(item.id)}
                        className={clsx(
                          'flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-500 relative overflow-hidden',
                          'hover:scale-105 hover:shadow-2xl',
                          'border border-white/20 hover:border-cyan-400/50',
                          activeDropdown === item.id 
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-2xl border-cyan-400/60 backdrop-blur-xl' 
                            : 'bg-white/10 text-white/90 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-cyan-500/10 backdrop-blur-sm'
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-blue-500/0 to-purple-600/0 group-hover:from-cyan-400/10 group-hover:via-blue-500/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
                        
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/20 group-hover:to-blue-500/20 rounded-2xl blur-sm transition-all duration-500"></div>
                        
                        <div className="relative z-10 text-white/80 group-hover:text-white transition-colors duration-300">
                          {item.icon}
                        </div>
                        <span className="relative z-10">{item.label}</span>
                        <ChevronDown className={clsx(
                          'w-4 h-4 transition-all duration-500 text-white/70 relative z-10',
                          activeDropdown === item.id && 'rotate-180 text-cyan-400'
                        )} />
                      </button>
                      
                      {activeDropdown === item.id && (
                        <div className="absolute top-full left-0 mt-3 w-80 bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 py-4 z-50 animate-in slide-in-from-top-2 duration-500">
                          {/* Header */}
                          <div className="px-6 py-3 border-b border-gray-200/50">
                            <h3 className="text-lg font-bold text-gray-800">{item.label}</h3>
                            <p className="text-sm text-gray-500">Seçenekler</p>
                          </div>
                          
                          {/* Menu Items */}
                          <div className="py-2">
                            {item.children.map((child, childIndex) => (
                              <Link
                                key={child.id}
                                href={child.href}
                                onClick={closeDropdown}
                                className="flex items-center space-x-4 px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 transition-all duration-300 group relative overflow-hidden"
                                style={{ animationDelay: `${childIndex * 80}ms` }}
                              >
                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
                                
                                <div className="text-gray-400 group-hover:text-cyan-600 transition-colors p-2 rounded-xl group-hover:bg-cyan-100 relative z-10">
                                  {child.icon}
                                </div>
                                <span className="font-semibold relative z-10">{child.label}</span>
                                
                                {/* Arrow */}
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                                  <div className="w-2 h-2 border-t-2 border-r-2 border-cyan-500 rotate-45"></div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={clsx(
                        'flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-500 relative overflow-hidden group',
                        'hover:scale-105 hover:shadow-2xl',
                        'border border-white/20 hover:border-cyan-400/50',
                        pathname === item.href 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-2xl border-cyan-400/60 backdrop-blur-xl' 
                          : 'bg-white/10 text-white/90 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-cyan-500/10 backdrop-blur-sm'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-blue-500/0 to-purple-600/0 group-hover:from-cyan-400/10 group-hover:via-blue-500/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
                      
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/20 group-hover:to-blue-500/20 rounded-2xl blur-sm transition-all duration-500"></div>
                      
                      <div className="relative z-10 text-white/80 group-hover:text-white transition-colors duration-300">
                        {item.icon}
                      </div>
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side - Ultra Modern */}
            <div className="flex items-center space-x-4">
              {/* Search - Ultra Modern */}
              <div className="hidden lg:flex items-center">
                <div className="relative group">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 group-hover:text-cyan-400 transition-colors duration-300 z-10" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    className="bg-white/10 backdrop-blur-xl text-white placeholder-white/50 pl-12 pr-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/20 transition-all duration-500 border border-white/20 hover:border-cyan-400/50 w-80 shadow-xl hover:shadow-2xl"
                  />
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/10 group-hover:to-blue-500/10 rounded-2xl blur-sm transition-all duration-500"></div>
                </div>
              </div>

              {/* Notifications - Ultra Modern */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-4 text-white/80 hover:text-white hover:scale-110 transition-all duration-500 rounded-2xl border border-white/20 hover:border-cyan-400/50 bg-white/10 hover:bg-gradient-to-r hover:from-white/15 hover:to-cyan-500/10 backdrop-blur-sm"
                >
                  <Bell className="w-6 h-6 relative z-10" />
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/20 group-hover:to-blue-500/20 rounded-2xl blur-sm transition-all duration-500"></div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg border-2 border-white"></span>
                </Button>
              </div>

              {/* User Menu - Ultra Modern */}
              <div className="relative group">
                <button
                  onClick={() => handleDropdownToggle('user')}
                  className="flex items-center space-x-4 px-5 py-4 rounded-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden border border-white/20 hover:border-cyan-400/50 bg-white/10 hover:bg-gradient-to-r hover:from-white/15 hover:to-cyan-500/10 backdrop-blur-sm"
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-blue-500/0 to-purple-600/0 group-hover:from-cyan-400/10 group-hover:via-blue-500/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/20 group-hover:to-blue-500/20 rounded-2xl blur-sm transition-all duration-500"></div>
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-xl relative z-10 group-hover:shadow-2xl transition-all duration-500">
                    <span className="text-blue-600 font-black text-xl">
                      {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left relative z-10">
                    <div className="text-sm font-bold text-white">{user?.username || 'Kullanıcı'}</div>
                    <div className="text-xs text-white/70">
                      {user?.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                    </div>
                  </div>
                  <ChevronDown className={clsx(
                    'w-4 h-4 transition-all duration-500 text-white/60 relative z-10',
                    activeDropdown === 'user' && 'rotate-180 text-cyan-400'
                  )} />
                </button>

                {activeDropdown === 'user' && (
                  <div className="absolute top-full right-0 mt-3 w-72 bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 py-4 z-50 animate-in slide-in-from-top-2 duration-500">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-white font-black text-xl">
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-900">{user?.username || 'Kullanıcı'}</div>
                          <div className="text-sm text-gray-500">{user?.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="py-3">
                      <button
                        onClick={() => {
                          closeDropdown()
                          logout()
                        }}
                        className="flex items-center space-x-4 w-full px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-300 group relative overflow-hidden"
                      >
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 to-pink-500/0 group-hover:from-red-400/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
                        
                        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors relative z-10" />
                        <span className="font-bold relative z-10">Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button - Ultra Modern */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-4 text-white/80 hover:text-white hover:scale-110 transition-all duration-500 rounded-2xl border border-white/20 hover:border-cyan-400/50 bg-white/10 hover:bg-gradient-to-r hover:from-white/15 hover:to-cyan-500/10 backdrop-blur-sm relative overflow-hidden group"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-blue-500/0 to-purple-600/0 group-hover:from-cyan-400/10 group-hover:via-blue-500/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/20 group-hover:to-blue-500/20 rounded-2xl blur-sm transition-all duration-500"></div>
                
                <div className="relative z-10">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Ultra Modern */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-2xl border-t border-white/20 animate-in slide-in-from-top-2 duration-500">
            <div className="max-w-7xl mx-auto px-4 py-8">
              {/* Header */}
              <div className="mb-6 px-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Menü</h2>
                <p className="text-gray-600">Navigasyon seçenekleri</p>
              </div>
              
              <nav className="space-y-4">
                {topMenuItems.map((item, index) => (
                  <div key={item.id} className="group">
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => handleDropdownToggle(item.id)}
                          className="flex items-center justify-between w-full px-6 py-5 text-left text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-2xl transition-all duration-500 border border-gray-200 hover:border-cyan-300 shadow-sm hover:shadow-xl relative overflow-hidden"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Animated Background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-blue-500/0 to-purple-600/0 group-hover:from-cyan-400/5 group-hover:via-blue-500/5 group-hover:to-purple-600/5 transition-all duration-500"></div>
                          
                          <div className="flex items-center space-x-4 relative z-10">
                            <div className="text-gray-500 group-hover:text-cyan-600 transition-colors duration-300 p-2 rounded-xl group-hover:bg-cyan-100">
                              {item.icon}
                            </div>
                            <span className="font-bold text-lg">{item.label}</span>
                          </div>
                          <ChevronDown className={clsx(
                            'w-5 h-5 transition-all duration-500 text-gray-400 relative z-10',
                            activeDropdown === item.id && 'rotate-180 text-cyan-600'
                          )} />
                        </button>
                        
                        {activeDropdown === item.id && (
                          <div className="ml-6 mt-4 space-y-3 animate-in slide-in-from-top-2 duration-500">
                            {item.children.map((child, childIndex) => (
                              <Link
                                key={child.id}
                                href={child.href}
                                onClick={() => {
                                  setMobileMenuOpen(false)
                                  closeDropdown()
                                }}
                                className="flex items-center space-x-4 px-6 py-4 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 rounded-2xl transition-all duration-500 border border-gray-100 hover:border-cyan-200 shadow-sm hover:shadow-lg group relative overflow-hidden"
                                style={{ animationDelay: `${childIndex * 100}ms` }}
                              >
                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
                                
                                <div className="text-gray-400 group-hover:text-cyan-600 transition-colors p-2 rounded-xl group-hover:bg-cyan-100 relative z-10">
                                  {child.icon}
                                </div>
                                <span className="font-semibold relative z-10">{child.label}</span>
                                
                                {/* Arrow */}
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                                  <div className="w-2 h-2 border-t-2 border-r-2 border-cyan-500 rotate-45"></div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={clsx(
                          'flex items-center space-x-4 px-6 py-5 text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-2xl transition-all duration-500 border border-gray-200 hover:border-cyan-300 shadow-sm hover:shadow-xl group relative overflow-hidden',
                          pathname === item.href && 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-300 shadow-lg'
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-blue-500/0 to-purple-600/0 group-hover:from-cyan-400/5 group-hover:via-blue-500/5 group-hover:to-purple-600/5 transition-all duration-500"></div>
                        
                        <div className="text-gray-500 group-hover:text-cyan-600 transition-colors p-2 rounded-xl group-hover:bg-cyan-100 relative z-10">
                          {item.icon}
                        </div>
                        <span className="font-bold text-lg relative z-10">{item.label}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Close dropdown when clicking outside */}
        {activeDropdown && (
          <div
            className="fixed inset-0 z-30"
            onClick={closeDropdown}
          />
        )}
      </header>
      
      {/* PWA Components */}
      <PWAUpdateBanner />
      <OfflineIndicator />
    </>
  )
}