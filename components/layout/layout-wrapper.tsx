'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
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

  // Don't show sidebar on login page
  if (pathname === '/login' || !user) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50" suppressHydrationWarning={true}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
})

