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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  FolderTree,
  Database,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clsx } from 'clsx'
import { ReportCategory } from '@/types'

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
    id: 'reports',
    label: 'Raporlar',
    href: '/reports',
    children: [
      {
        id: 'report-management',
        label: 'Rapor Yönetimi',
        href: '/reports'
      },
      {
        id: 'report-dashboard',
        label: 'Rapor Dashboard',
        href: '/reports/dashboard'
        }
    ]
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


export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['reports'])
  const [reportCategories, setReportCategories] = useState<ReportCategory[]>([])
  const [reports, setReports] = useState<ReportWithCategory[]>([])
  const pathname = usePathname()
  const { user, logout, hasPermission } = useAuth()

  // Helper function to get icon for menu item
  const getIconForMenuItem = (itemId: string) => {
    switch (itemId) {
      case 'dashboard': return <Home className="w-5 h-5" />
      case 'companies': return <Building2 className="w-5 h-5" />
      case 'users': return <Users className="w-5 h-5" />
      case 'reports': return <FileText className="w-5 h-5" />
      case 'report-management': return <Settings className="w-4 h-4" />
      case 'report-dashboard': return <BarChart3 className="w-4 h-4" />
      // removed 'report-execution'
      case 'categories': return <FolderTree className="w-5 h-5" />
      case 'api-config': return <Settings className="w-5 h-5" />
      case 'data-sources': return <Database className="w-5 h-5" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  // Load report categories and reports for dynamic menu
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading sidebar data...')
        // Load categories
        const categoriesResponse = await fetch('/api/report-categories')
        const categoriesData = await categoriesResponse.json()
        console.log('📂 Categories loaded:', categoriesData.categories?.length || 0)
        console.log('📂 Categories data:', categoriesData.categories)
        setReportCategories(categoriesData.categories || [])
        
        // Auto-expand categories when loaded
        const categoryIds = (categoriesData.categories || [])
          .filter(cat => !cat.parentId) // Only parent categories
          .map(cat => `category-${cat.id}`)
        
        if (categoryIds.length > 0) {
          setExpandedItems(prev => {
            const newExpanded = [...prev, ...categoryIds.filter(id => !prev.includes(id))]
            console.log('🔍 Auto-expanding categories:', categoryIds)
            return newExpanded
          })
        }

        // Load reports
        const reportsResponse = await fetch('/api/report-configs')
        const reportsData = await reportsResponse.json()
        console.log('Loaded reports:', reportsData.reports?.length || 0)
        
        // Debug: Check showInMenu status
        const reportsWithMenuStatus = reportsData.reports?.map((report: any) => {
          console.log(`Report: ${report.name}, showInMenu: ${report.showInMenu}`)
          return report
        }) || []
        
        setReports(reportsWithMenuStatus)
        console.log('📊 Reports set for sidebar:', reportsWithMenuStatus.length)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()

    // Listen for custom events to refresh sidebar
    const handleRefreshSidebar = () => {
      console.log('Sidebar refresh event received, reloading data...')
      loadData()
    }

    window.addEventListener('refreshSidebar', handleRefreshSidebar)
    
    return () => {
      window.removeEventListener('refreshSidebar', handleRefreshSidebar)
    }
  }, [user?.role])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getFilteredMenuItems = useCallback(() => {
    console.log('🔍 User role:', user?.role)
    console.log('🔍 Categories count:', reportCategories.length)
    console.log('🔍 Reports count:', reports.length)
    
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
                  // Only show reports that are marked to show in menu
                  if (report.showInMenu !== true) return false
                  
                  // Match reports by category name (exact match)
                  if (report.category?.name === category.name) return true
                  
                  return false
                })
                
                console.log(`📊 Category ${category.name} has ${categoryReports.length} reports:`, categoryReports.map(r => r.name))
                
                
                return {
                  id: `category-${category.id}`,
                  label: category.name,
                  icon: <FileText className="w-4 h-4" />,
                  href: '', // Remove href so it acts as expandable menu only
                  children: categoryReports.map(report => ({
                    id: `report-${report.id}`,
                    label: `- ${report.name}`,
                    icon: <FileText className="w-3 h-3" />,
                    href: `/reports/run/${report.id}`
                  }))
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
                  // Only show reports that are marked to show in menu
                  if (report.showInMenu !== true) return false
                  
                  // Direct reports to this category (by ID match)
                  if (report.categoryId === category.id) return true
                  
                  // Also match by category name if available
                  if (report.category?.name === category.name) return true
                  
                  // Reports to child categories
                  const childCategory = reportCategories.find(child => 
                    child.id === report.categoryId && child.parentId === category.id
                  )
                  return !!childCategory
                })
                
                console.log(`📊 Category ${category.name} (ID: ${category.id}) has ${categoryReports.length} reports:`, categoryReports.map(r => `${r.name} (catId: ${r.categoryId})`))
                
                return {
                  id: `category-${category.id}`,
                  label: category.name,
                  icon: <FileText className="w-4 h-4" />,
                  href: '', // Remove href so it acts as expandable menu only
                  children: categoryReports.map(report => ({
                    id: `report-${report.id}`,
                    label: `- ${report.name}`,
                    icon: <FileText className="w-3 h-3" />,
                    href: `/reports/run/${report.id}`
                  }))
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

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')


    return (
      <div key={item.id}>
        <div className="relative">
          {hasChildren ? (
            <div
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                isActive && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
                !isActive && 'text-gray-700 dark:text-gray-300',
                level > 0 && 'ml-4'
              )}
              onClick={() => toggleExpanded(item.id)}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="flex-1 truncate">
                  {item.label}
                </span>
              )}
              {!isCollapsed && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                isActive && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
                !isActive && 'text-gray-700 dark:text-gray-300',
                level > 0 && 'ml-4'
              )}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="flex-1 truncate">
                  {item.label}
                </span>
              )}
            </Link>
          )}
        </div>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <div key={child.id}>
                {renderMenuItem(child, level + 1)}
              </div>
            ))}
          </div>
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
    children: item.children?.map(child => ({
      ...child,
      icon: getIconForMenuItem(child.id)
    }))
  }))

  return (
    <div className={clsx(
      'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Link href="/">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors">
              Pinebi Report
            </h2>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.role === 'ADMIN' ? 'Yönetici' : 'Rapor Kullanıcısı'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <div key={item.id}>
            {renderMenuItem(item)}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={logout}
          className={clsx(
            'w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Çıkış Yap</span>}
        </Button>
      </div>
    </div>
  )
}