'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  ChevronDown,
  Home,
  FolderTree,
  Database,
  LogOut,
  Package,
  List,
  Folder,
  Calendar,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clsx } from 'clsx'
import { ReportCategory } from '@/types'
import { ThemeSelector } from '@/components/theme/ThemeSelector'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  children?: MenuItem[]
}

interface ReportWithCategory {
  id: string
  name: string
  categoryId: string
  category: {
    id: string
    name: string
  }
  showInMenu?: boolean
}

// Static menu items without JSX icons to avoid re-render issues
const getStaticMenuItems = (): Omit<MenuItem, 'icon'>[] => [
  {
    id: 'dashboard',
    label: 'Ana Panel',
    href: '/'
  },
  {
    id: 'products',
    label: 'Ürünler',
    href: '/products',
    children: [
      {
        id: 'products-list',
        label: 'Ürün Listesi',
        href: '/products'
      },
      {
        id: 'products-categories',
        label: 'Kategoriler',
        href: '/products/categories'
      },
      {
        id: 'products-form-builder',
        label: 'Form Oluşturucu',
        href: '/products/form-builder'
      }
    ]
  },
  {
    id: 'calendar',
    label: 'Takvim ve Hatırlatmalar',
    href: '/calendar'
  },
  {
    id: 'reports',
    label: 'Raporlar',
    href: '/reports',
    children: [
      {
        id: 'report-management',
        label: 'Rapor Yönetimi',
        href: '/reports',
        icon: '📊'
      },
      {
        id: 'report-dashboard',
        label: 'Rapor Dashboard',
        href: '/reports/dashboard',
        icon: '📈'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    href: '',
    children: [
      {
        id: 'companies',
        label: 'Firma Yönetimi',
        href: '/companies'
      },
      {
        id: 'users',
        label: 'Kullanıcı Yönetimi',
        href: '/users'
      },
      {
        id: 'categories',
        label: 'Kategori Yönetimi',
        href: '/reports/categories'
      },
      {
        id: 'api-config',
        label: 'API Yapılandırması',
        href: '/api-config'
      },
      {
        id: 'data-sources',
        label: 'Veri Kaynakları',
        href: '/data-sources'
      }
    ]
  }
]

export function TopNavigation() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [reportCategories, setReportCategories] = useState<ReportCategory[]>([])
  const [reports, setReports] = useState<ReportWithCategory[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Helper function to get icon for menu item
  const getIconForMenuItem = (itemId: string) => {
    switch (itemId) {
      case 'dashboard': return <Home className="w-4 h-4" />
      case 'companies': return <Building2 className="w-4 h-4" />
      case 'products': return <Package className="w-4 h-4" />
      case 'products-list': return <List className="w-4 h-4" />
      case 'products-categories': return <Folder className="w-4 h-4" />
      case 'products-form-builder': return <Settings className="w-4 h-4" />
      case 'users': return <Users className="w-4 h-4" />
      case 'calendar': return <Calendar className="w-4 h-4" />
      case 'reports': return <FileText className="w-4 h-4" />
      case 'report-management': return <Settings className="w-4 h-4" />
      case 'report-dashboard': return <BarChart3 className="w-4 h-4" />
      case 'categories': return <FolderTree className="w-4 h-4" />
      case 'api-config': return <Settings className="w-4 h-4" />
      case 'data-sources': return <Database className="w-4 h-4" />
      case 'settings': return <Settings className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  // Load report categories and reports for dynamic menu
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading top navigation data...')
        // Load categories with retry + cache
        const fetchWithRetry = async (url: string, cacheKey: string, attempts = 3, delayMs = 300): Promise<any> => {
          for (let i = 0; i < attempts; i++) {
            try {
              const res = await fetch(url)
              if (res.ok) {
                const json = await res.json()
                try { sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), data: json })) } catch {}
                return json
              }
            } catch {}
            await new Promise(r => setTimeout(r, delayMs * (i + 1)))
          }
          try {
            const cached = sessionStorage.getItem(cacheKey)
            if (cached) return JSON.parse(cached).data
          } catch {}
          return null
        }

        const categoriesData = await fetchWithRetry('/api/report-categories', 'cache-report-categories')
        console.log('📂 Categories loaded:', categoriesData?.categories?.length || 0)
        if (categoriesData?.categories?.length) {
          console.log('📂 Categories data:', categoriesData.categories)
          setReportCategories(categoriesData.categories)
        }
        
        // Don't auto-expand categories - keep menus closed by default

        // Load reports with retry + cache
        const reportsData = await fetchWithRetry('/api/report-configs', 'cache-report-configs') || { reports: [] }
        const reportsWithMenuStatus = reportsData.reports?.map((report: any) => report) || []
        
        if (Array.isArray(reportsWithMenuStatus)) setReports(reportsWithMenuStatus)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()

    // Listen for custom events to refresh navigation
    const handleRefreshNavigation = () => {
      console.log('Top navigation refresh event received, reloading data...')
      loadData()
    }

    window.addEventListener('refreshSidebar', handleRefreshNavigation)
    
    return () => {
      window.removeEventListener('refreshSidebar', handleRefreshNavigation)
    }
  }, [user?.role])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Check if click is outside navigation menu
      if (!target.closest('[data-dropdown-menu]')) {
        setExpandedItems([])
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      // If clicking the same item, toggle it
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        // For nested dropdowns (category-*), keep parent open and add child
        if (itemId.startsWith('category-')) {
          const parentId = 'reports' // Main reports menu
          const newItems = prev.filter(id => id !== parentId && !id.startsWith('category-'))
          return [...newItems, parentId, itemId]
        }
        
        // For main dropdowns, close all others and open this one
        return [itemId]
      }
    })
  }

  const getFilteredMenuItems = useCallback(() => {
    
    // Get static menu items (without icons first)
    const staticMenuItems = getStaticMenuItems()
    
    if (user?.role === 'ADMIN') {
      // Create dynamic reports menu with categories (respect showInMenu as well)
      const reportsMenu = staticMenuItems.find(item => item.id === 'reports')
      if (reportsMenu && reportCategories.length > 0) {
        const dynamicReportsMenu = {
          ...reportsMenu,
          children: [
            // Keep original menu items but exclude 'report-execution'
            ...((reportsMenu.children || []).filter(c => c.id !== 'report-execution')),
            // Add dynamic category items with reports
            ...reportCategories
              .filter(category => !category.parentId) // Only parent categories
              .map(category => {
                // Get reports for this category and its children
                const categoryReports = reports.filter(report => {
                  // Only show active reports that are marked to show in menu
                  if (!report.isActive || report.showInMenu !== true) return false
                  
                  // Check if report belongs to current category (both categoryId and category.id)
                  const belongsToCategory = report.categoryId === category.id || 
                                          (report.category && report.category.id === category.id)
                  
                  if (!belongsToCategory) return false
                  
                  // For REPORTER users, show all reports regardless of company
                  if (user?.role === 'REPORTER') {
                    return true
                  }
                  
                  // Admin can see all reports (no company filtering)
                  if (user?.role === 'ADMIN') {
                    return true
                  }
                  
                  // Regular users can only see reports from their company
                  if (user?.companyId && report.companyId && user.companyId === report.companyId) {
                    return true
                  }
                  
                  return false
                })
                
                // Remove duplicates based on report ID
                const uniqueReports = categoryReports.reduce((acc, report) => {
                  if (!acc.find(r => r.id === report.id)) {
                    acc.push(report)
                  }
                  return acc
                }, [] as any[])
                
                const sortedReports = uniqueReports.sort((a, b) => {
                  // Sort by menuOrder first, then by name
                  const orderA = a.menuOrder || 0
                  const orderB = b.menuOrder || 0
                  if (orderA !== orderB) return orderA - orderB
                  return a.name.localeCompare(b.name)
                })
                
                
                
                return {
                  id: `category-${category.id}`,
                  label: category.name,
                  icon: <FileText className="w-4 h-4" />,
                  href: sortedReports.length > 0 ? '' : `/reports/category/${category.id}`, // Only make it a link if no reports
                  children: sortedReports.length > 0 ? sortedReports.map(report => ({
                    id: `report-${report.id}`,
                    label: report.name, // Remove the "-" prefix for cleaner look
                    icon: <FileText className="w-3 h-3" />,
                    href: `/reports/run/${report.id}`
                  })) : []
                }
              })
          ]
        }
        
        return staticMenuItems.map(item => 
          item.id === 'reports' ? dynamicReportsMenu : item
        )
      }
      
      return staticMenuItems
    } else if (user?.role === 'REPORTER') {
      // REPORTER users only see Reports menu with categories
      const reportsMenu = staticMenuItems.find(item => item.id === 'reports')
      if (reportsMenu && reportCategories.length > 0) {
        const dynamicReportsMenu = {
          ...reportsMenu,
          children: [
            // Exclude 'report-execution' for REPORTER as well
            // Add dynamic category items with reports
            ...reportCategories
              .filter(category => !category.parentId) // Only parent categories
              .map(category => {
                // Get reports for this category and its children
                const categoryReports = reports.filter(report => {
                  // Only show active reports that are marked to show in menu
                  if (!report.isActive || report.showInMenu !== true) return false
                  
                  // Check if report belongs to current category (both categoryId and category.id)
                  const belongsToCategory = report.categoryId === category.id || 
                                          (report.category && report.category.id === category.id)
                  
                  if (!belongsToCategory) return false
                  
                  // For REPORTER users, show all reports regardless of company
                  if (user?.role === 'REPORTER') {
                    return true
                  }
                  
                  // Admin can see all reports (no company filtering)
                  if (user?.role === 'ADMIN') {
                    return true
                  }
                  
                  // Regular users can only see reports from their company
                  if (user?.companyId && report.companyId && user.companyId === report.companyId) {
                    return true
                  }
                  
                  return false
                })
                
                // Remove duplicates based on report ID
                const uniqueReports = categoryReports.reduce((acc, report) => {
                  if (!acc.find(r => r.id === report.id)) {
                    acc.push(report)
                  }
                  return acc
                }, [] as any[])
                
                const sortedReports = uniqueReports.sort((a, b) => {
                  // Sort by menuOrder first, then by name
                  const orderA = a.menuOrder || 0
                  const orderB = b.menuOrder || 0
                  if (orderA !== orderB) return orderA - orderB
                  return a.name.localeCompare(b.name)
                })
                
                console.log(`📊 Category ${category.name} (ID: ${category.id}) has ${categoryReports.length} reports:`, categoryReports.map(r => `${r.name} (catId: ${r.categoryId})`))
                
                return {
                  id: `category-${category.id}`,
                  label: category.name,
                  icon: <FileText className="w-4 h-4" />,
                  href: sortedReports.length > 0 ? '' : `/reports/category/${category.id}`, // Only make it a link if no reports
                  children: sortedReports.length > 0 ? sortedReports.map(report => ({
                    id: `report-${report.id}`,
                    label: report.name, // Remove the "-" prefix for cleaner look
                    icon: <FileText className="w-3 h-3" />,
                    href: `/reports/run/${report.id}`
                  })) : []
                }
              })
          ]
        }
        
        // REPORTER users only see Reports menu
        return [dynamicReportsMenu]
      }
      
      // Fallback to simple reports menu if no categories
      return [
        {
          id: 'reports',
          label: 'Raporlar',
          icon: getIconForMenuItem('reports'),
          href: '/reports'
        }
      ]
    }
    
    // Default menu for all users
    return staticMenuItems
  }, [user?.role, reportCategories, reports])

  const renderDropdownItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    

    return (
      <div key={item.id} className="relative">
        {hasChildren ? (
          <div className="relative group" data-dropdown-menu>
            <button
              className={clsx(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
                isActive && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                !isActive && 'text-gray-700 dark:text-gray-300'
              )}
              onClick={() => toggleExpanded(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              <ChevronDown className={clsx('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
            </button>
            
            {/* Dropdown Menu */}
            {isExpanded && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50" data-dropdown-menu>
                <div className="py-2">
                  {item.children?.map((child) => (
                    child.children && child.children.length > 0 ? (
                      // Render as nested dropdown
                      <div key={child.id} className="relative">
                        <button
                          className={clsx(
                            'flex items-center justify-between w-full px-4 py-2 text-sm transition-colors rounded-lg',
                            'hover:bg-gray-100 dark:hover:bg-gray-700',
                            pathname === child.href && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          )}
                          onClick={() => toggleExpanded(child.id)}
                        >
                          <div className="flex items-center gap-3">
                            {child.icon}
                            <span>{child.label}</span>
                          </div>
                          <ChevronDown className={clsx('w-4 h-4 transition-transform', expandedItems.includes(child.id) && 'rotate-180')} />
                        </button>
                        
                        {/* Nested Dropdown */}
                        {expandedItems.includes(child.id) && (
                          <div className="absolute left-full top-0 ml-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50" data-dropdown-menu>
                            <div className="py-2">
                              {child.children?.map((grandChild) => (
                                <Link
                                  key={grandChild.id}
                                  href={grandChild.href}
                                  className={clsx(
                                    'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                                    pathname === grandChild.href && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                  )}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false)
                                    setExpandedItems([]) // Close all dropdowns when a report is clicked
                                  }}
                                >
                                  {grandChild.icon}
                                  <span>{grandChild.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Render as simple link
                      <Link
                        key={child.id}
                        href={child.href}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                          'hover:bg-gray-100 dark:hover:bg-gray-700',
                          pathname === child.href && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {child.icon}
                        <span>{child.label}</span>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href={item.href}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg',
              'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
              isActive && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
              !isActive && 'text-gray-700 dark:text-gray-300'
            )}
            onClick={() => {
              setIsMobileMenuOpen(false)
              setExpandedItems([]) // Close all dropdowns when a menu item is clicked
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        )}
      </div>
    )
  }

  if (!user) {
    return null
  }

  const filteredMenuItems = getFilteredMenuItems().map(item => ({
    ...item,
    icon: getIconForMenuItem(item.id),
    children: (item as any).children?.map((child: any) => ({
      ...child,
      icon: getIconForMenuItem(child.id)
    }))
  }))

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Pinebi Report
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {filteredMenuItems.map((item) => renderDropdownItem(item))}
          </div>

          {/* Right Side - User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Selector */}
            <ThemeSelector />
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role === 'ADMIN' ? 'Yönetici' : 'Rapor Kullanıcısı'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700" data-dropdown-menu>
            <div className="py-4 space-y-2">
              {filteredMenuItems.map((item) => (
                <div key={item.id} className="block">
                  {item.children && item.children.length > 0 ? (
                    <div>
                      <button
                        className={clsx(
                          'flex items-center justify-between w-full px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                          'hover:bg-gray-100 dark:hover:bg-gray-800',
                          pathname === item.href && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        )}
                        onClick={() => toggleExpanded(item.id)}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className={clsx('w-4 h-4 transition-transform', expandedItems.includes(item.id) && 'rotate-180')} />
                      </button>
                      {expandedItems.includes(item.id) && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href}
                              className={clsx(
                                'flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-lg',
                                'hover:bg-gray-100 dark:hover:bg-gray-800',
                                pathname === child.href && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                              )}
                              onClick={() => setIsMobileMenuOpen(false)}
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
                        'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        pathname === item.href && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      )}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setExpandedItems([]) // Close all dropdowns when a menu item is clicked
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
