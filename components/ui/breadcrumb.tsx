'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { clsx } from 'clsx'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
  showHome?: boolean
}

// Path mapping for automatic breadcrumb generation
const pathLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'reports': 'Raporlar',
  'reports/dashboard': 'Rapor Dashboard',
  'reports/category': 'Kategori Raporları',
  'reports/run': 'Rapor Çalıştır',
  'products': 'Ürünler',
  'products/form-builder': 'Form Oluşturucu',
  'companies': 'Firma Yönetimi',
  'users': 'Kullanıcı Yönetimi',
  'settings': 'Ayarlar',
  'calendar': 'Takvim',
  'api': 'API Yapılandırması',
  'data-sources': 'Veri Kaynakları'
}

// Generate breadcrumb items from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []
  
  // Add home
  breadcrumbs.push({
    label: 'Ana Sayfa',
    href: '/',
    icon: <Home className="w-4 h-4" />
  })
  
  // Build path progressively
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Handle dynamic segments (like [id])
    if (segment.match(/^\[.*\]$/) || segment.match(/^[0-9a-f-]+$/)) {
      // This is likely a dynamic segment, try to get meaningful name from context
      const parentPath = segments.slice(0, index).join('/')
      const parentLabel = pathLabels[parentPath] || parentPath
      
      breadcrumbs.push({
        label: `${parentLabel} Detayı`,
        href: currentPath
      })
    } else {
      // Regular segment
      const label = pathLabels[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        label,
        href: index === segments.length - 1 ? undefined : currentPath // Last item is not clickable
      })
    }
  })
  
  return breadcrumbs
}

export function Breadcrumb({ 
  items, 
  className, 
  separator = <ChevronRight className="w-4 h-4" />,
  showHome = true 
}: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Use provided items or generate from pathname
  const breadcrumbItems = items || generateBreadcrumbs(pathname)
  
  // Filter out home if showHome is false
  const displayItems = showHome ? breadcrumbItems : breadcrumbItems.slice(1)
  
  if (displayItems.length <= 1) {
    return null // Don't show breadcrumb if there's only one item
  }
  
  return (
    <nav className={clsx('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isHome = item.href === '/'
          
          return (
            <li key={item.href || index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400 dark:text-gray-500">
                  {separator}
                </span>
              )}
              
              {isLast ? (
                <span className={clsx(
                  'flex items-center gap-1 font-medium',
                  'text-gray-900 dark:text-white',
                  isHome && 'text-blue-600 dark:text-blue-400'
                )}>
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={clsx(
                    'flex items-center gap-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400',
                    'text-gray-600 dark:text-gray-300',
                    isHome && 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Compact breadcrumb for mobile
export function CompactBreadcrumb({ items, className }: Omit<BreadcrumbProps, 'separator'>) {
  const pathname = usePathname()
  const breadcrumbItems = items || generateBreadcrumbs(pathname)
  
  if (breadcrumbItems.length <= 1) {
    return null
  }
  
  const lastItem = breadcrumbItems[breadcrumbItems.length - 1]
  const secondLastItem = breadcrumbItems[breadcrumbItems.length - 2]
  
  return (
    <nav className={clsx('flex items-center space-x-1 text-sm', className)}>
      {breadcrumbItems.length > 2 && (
        <>
          <Link
            href="/"
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Home className="w-4 h-4" />
          </Link>
          <span className="text-gray-400 dark:text-gray-500">...</span>
        </>
      )}
      
      {secondLastItem && (
        <>
          <Link
            href={secondLastItem.href || '#'}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {secondLastItem.label}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </>
      )}
      
      <span className="font-medium text-gray-900 dark:text-white truncate">
        {lastItem.label}
      </span>
    </nav>
  )
}



