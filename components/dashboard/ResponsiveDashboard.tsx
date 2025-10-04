'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  Smartphone, 
  Tablet, 
  Monitor,
  Grid3X3,
  List,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResponsiveDashboardProps {
  children: React.ReactNode
  className?: string
}

type ViewMode = 'mobile' | 'tablet' | 'desktop'
type LayoutMode = 'grid' | 'list'

export function ResponsiveDashboard({ children, className }: ResponsiveDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setScreenWidth(width)
      
      if (width < 768) {
        setViewMode('mobile')
      } else if (width < 1024) {
        setViewMode('tablet')
      } else {
        setViewMode('desktop')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      case 'desktop':
        return <Monitor className="w-4 h-4" />
    }
  }

  const getViewModeColor = (mode: ViewMode) => {
    switch (mode) {
      case 'mobile':
        return 'bg-green-100 text-green-800'
      case 'tablet':
        return 'bg-blue-100 text-blue-800'
      case 'desktop':
        return 'bg-purple-100 text-purple-800'
    }
  }

  return (
    <div className={cn(
      "relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300",
      isFullscreen && "fixed inset-0 z-50 bg-white dark:bg-gray-900",
      className
    )}>
      {/* Responsive Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3">
              {viewMode === 'mobile' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
              
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              
              <Badge className={getViewModeColor(viewMode)}>
                {getViewModeIcon(viewMode)}
                <span className="ml-1 hidden sm:inline">
                  {viewMode === 'mobile' ? 'Mobil' : viewMode === 'tablet' ? 'Tablet' : 'Masaüstü'}
                </span>
              </Badge>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Layout Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={layoutMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLayoutMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={layoutMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLayoutMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="hidden md:flex"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Screen Size Info */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Ekran boyutu: {screenWidth}px</span>
            <span className="sm:hidden">{screenWidth}px</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && viewMode === 'mobile' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Menü</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Ana Sayfa
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Raporlar
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Analiz
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Ayarlar
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        layoutMode === 'grid' ? "p-4" : "p-2",
        viewMode === 'mobile' && "p-2"
      )}>
        <div className={cn(
          "transition-all duration-300",
          layoutMode === 'grid' 
            ? "grid gap-4 auto-rows-min"
            : "space-y-3",
          // Responsive grid
          viewMode === 'desktop' && layoutMode === 'grid' && "grid-cols-12",
          viewMode === 'tablet' && layoutMode === 'grid' && "grid-cols-6",
          viewMode === 'mobile' && layoutMode === 'grid' && "grid-cols-1"
        )}>
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return (
                <div
                  key={index}
                  className={cn(
                    "transition-all duration-300",
                    layoutMode === 'grid' && [
                      // Desktop: 4 columns each
                      viewMode === 'desktop' && "col-span-3",
                      // Tablet: 2 columns each  
                      viewMode === 'tablet' && "col-span-3",
                      // Mobile: 1 column
                      viewMode === 'mobile' && "col-span-1"
                    ],
                    layoutMode === 'list' && "w-full"
                  )}
                >
                  {React.cloneElement(child as any, {
                    className: cn(
                      (child as any).props.className,
                      // Mobile optimizations
                      viewMode === 'mobile' && "text-sm",
                      layoutMode === 'list' && "mb-2"
                    )
                  })}
                </div>
              )
            }
            return child
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {viewMode === 'mobile' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-around py-2">
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
              <Monitor className="w-5 h-5" />
              <span className="text-xs">Dashboard</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
              <Grid3X3 className="w-5 h-5" />
              <span className="text-xs">Raporlar</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
              <Menu className="w-5 h-5" />
              <span className="text-xs">Menü</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Responsive Card Component
export function ResponsiveCard({ 
  children, 
  className,
  ...props 
}: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}




