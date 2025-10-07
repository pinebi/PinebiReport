'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkLatency: number
  cacheHitRate: number
  errorRate: number
}

interface PerformanceConfig {
  enableMetrics: boolean
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug'
  maxCacheSize: number
  compressionEnabled: boolean
  lazyLoading: boolean
}

export function usePerformance(config: PerformanceConfig = {
  enableMetrics: true,
  logLevel: 'info',
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  compressionEnabled: true,
  lazyLoading: true
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    errorRate: 0
  })

  const [isOptimized, setIsOptimized] = useState(false)
  const performanceObserverRef = useRef<PerformanceObserver | null>(null)
  const cacheRef = useRef<Map<string, { data: any, timestamp: number, size: number }>>(new Map())

  // Performance monitoring
  useEffect(() => {
    if (!config.enableMetrics || typeof window === 'undefined') return

    // Measure page load time
    const measureLoadTime = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        setMetrics(prev => ({ ...prev, loadTime }))
      }
    }

    // Measure memory usage
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize
        setMetrics(prev => ({ ...prev, memoryUsage }))
      }
    }

    // Monitor network performance
    const monitorNetwork = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const avgLatency = resources.reduce((sum, resource) => {
        return sum + (resource.responseEnd - resource.requestStart)
      }, 0) / resources.length

      setMetrics(prev => ({ ...prev, networkLatency: avgLatency }))
    }

    // Set up performance observer
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} took ${entry.duration}ms`)
        }
      })
    })

    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
    performanceObserverRef.current = observer

    // Initial measurements
    measureLoadTime()
    measureMemoryUsage()
    monitorNetwork()

    // Periodic measurements
    const interval = setInterval(() => {
      measureMemoryUsage()
      monitorNetwork()
    }, 5000)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [config.enableMetrics])

  // Cache management
  const getCachedData = useCallback((key: string) => {
    const cached = cacheRef.current.get(key)
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes TTL
      setMetrics(prev => ({ 
        ...prev, 
        cacheHitRate: prev.cacheHitRate + 1 
      }))
      return cached.data
    }
    return null
  }, [])

  const setCachedData = useCallback((key: string, data: any) => {
    const size = JSON.stringify(data).length
    const currentSize = Array.from(cacheRef.current.values())
      .reduce((sum, item) => sum + item.size, 0)

    // Evict old entries if cache is full
    if (currentSize + size > config.maxCacheSize) {
      const sortedEntries = Array.from(cacheRef.current.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      // Remove oldest 25% of entries
      const toRemove = Math.ceil(sortedEntries.length * 0.25)
      for (let i = 0; i < toRemove; i++) {
        cacheRef.current.delete(sortedEntries[i][0])
      }
    }

    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      size
    })
  }, [config.maxCacheSize])

  // Image optimization
  const optimizeImage = useCallback((src: string, options: {
    width?: number
    height?: number
    quality?: number
  } = {}) => {
    if (!config.compressionEnabled) return src

    // Add optimization parameters
    const params = new URLSearchParams()
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())

    return `${src}?${params.toString()}`
  }, [config.compressionEnabled])

  // Lazy loading hook
  const useLazyLoad = useCallback((threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const elementRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (!config.lazyLoading) {
        setIsVisible(true)
        setHasLoaded(true)
        return
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true)
            setHasLoaded(true)
            observer.disconnect()
          }
        },
        { threshold }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, [threshold, hasLoaded, config.lazyLoading])

    return { elementRef, isVisible, hasLoaded }
  }, [config.lazyLoading])

  // Bundle size optimization
  const optimizeBundle = useCallback(() => {
    // Dynamic imports for code splitting
    const loadComponent = (componentPath: string) => {
      // Use a more specific import pattern to avoid critical dependency warnings
      const importMap: Record<string, () => Promise<any>> = {
        'dashboard': () => import('@/components/dashboard/main-dashboard'),
        'reports': () => import('@/components/reports/sales-report-grid'),
        'users': () => import('@/components/users/user-management'),
      }
      
      const importFn = importMap[componentPath]
      if (importFn) {
        return importFn().catch(error => {
          console.error(`Failed to load component: ${componentPath}`, error)
          setMetrics(prev => ({ ...prev, errorRate: prev.errorRate + 1 }))
        })
      }
      
      console.warn(`Component ${componentPath} not found in import map`)
      return Promise.resolve(null)
    }

    return { loadComponent }
  }, [])

  // Performance recommendations
  const getRecommendations = useMemo(() => {
    const recommendations: string[] = []

    if (metrics.loadTime > 3000) {
      recommendations.push('Sayfa yükleme süresi 3 saniyeden fazla. Lazy loading ve code splitting kullanın.')
    }

    if (metrics.memoryUsage > 0.8) {
      recommendations.push('Yüksek bellek kullanımı tespit edildi. Gereksiz bileşenleri kaldırın.')
    }

    if (metrics.networkLatency > 1000) {
      recommendations.push('Yavaş ağ bağlantısı. Veri sıkıştırma ve önbellekleme kullanın.')
    }

    if (metrics.cacheHitRate < 0.5) {
      recommendations.push('Düşük önbellek hit oranı. Önbellek stratejisini gözden geçirin.')
    }

    if (metrics.errorRate > 0.1) {
      recommendations.push('Yüksek hata oranı. Hata yönetimini iyileştirin.')
    }

    return recommendations
  }, [metrics])

  // Performance optimization status
  useEffect(() => {
    const isOptimized = 
      metrics.loadTime < 2000 &&
      metrics.memoryUsage < 0.7 &&
      metrics.networkLatency < 500 &&
      metrics.cacheHitRate > 0.6 &&
      metrics.errorRate < 0.05

    setIsOptimized(isOptimized)
  }, [metrics])

  return {
    metrics,
    isOptimized,
    getCachedData,
    setCachedData,
    optimizeImage,
    useLazyLoad,
    optimizeBundle,
    getRecommendations,
    config
  }
}



