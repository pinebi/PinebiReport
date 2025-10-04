'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { TopNavigation } from './top-navigation'
import { Breadcrumb, CompactBreadcrumb } from '@/components/ui/breadcrumb'
import { useEffect, useState, memo } from 'react'

export const LayoutWrapper = memo(function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [pathname, setPathname] = useState('')
  const [mounted, setMounted] = useState(false)
  const pathnameFromHook = usePathname()

  useEffect(() => {
    setMounted(true)
    setPathname(pathnameFromHook)
  }, [pathnameFromHook])

  // Show loading while auth is being determined or component is not mounted
  if (!mounted || isLoading) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>
  }

  // Don't show navigation on login page
  if (pathname === '/login' || !user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning={true}>
      <TopNavigation />
      <div className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Breadcrumb */}
            <div className="hidden md:block">
              <Breadcrumb />
            </div>
            {/* Mobile Compact Breadcrumb */}
            <div className="md:hidden">
              <CompactBreadcrumb />
            </div>
          </div>
        </div>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
})

