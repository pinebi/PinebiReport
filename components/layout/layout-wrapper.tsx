'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { TopNavigation } from './top-navigation'
import { MobileBottomNavigation } from './mobile-navigation'
import { usePerformance } from '@/hooks/use-performance'
import { useEffect, useState, memo } from 'react'

export const LayoutWrapper = memo(function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [pathname, setPathname] = useState('')
  const [mounted, setMounted] = useState(false)
  const pathnameFromHook = usePathname()
  
  // Performance optimization
  const { useLazyLoad, optimizeBundle } = usePerformance({
    enableMetrics: true,
    logLevel: 'info',
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    compressionEnabled: true,
    lazyLoading: true
  })

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
        <main className="flex-1 pb-16">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  )
})

