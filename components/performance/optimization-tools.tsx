'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trash2, 
  RefreshCw, 
  Download, 
  Upload,
  Settings,
  Zap,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Network
} from 'lucide-react'
import { usePerformance } from '@/hooks/use-performance'

interface OptimizationToolsProps {
  className?: string
}

export function OptimizationTools({ className = '' }: OptimizationToolsProps) {
  const { 
    metrics, 
    getCachedData, 
    setCachedData, 
    optimizeImage,
    optimizeBundle,
    config 
  } = usePerformance()

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null)

  // Cache management
  const clearCache = async () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)

    try {
      // Simulate cache clearing
      for (let i = 0; i <= 100; i += 10) {
        setOptimizationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      setLastOptimization(new Date())
    } catch (error) {
      console.error('Cache clearing failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Bundle optimization
  const optimizeBundleSize = async () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)

    try {
      // Simulate bundle optimization
      for (let i = 0; i <= 100; i += 20) {
        setOptimizationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Trigger garbage collection if available
      if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc()
      }

      setLastOptimization(new Date())
    } catch (error) {
      console.error('Bundle optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Memory optimization
  const optimizeMemory = async () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)

    try {
      // Simulate memory optimization
      for (let i = 0; i <= 100; i += 15) {
        setOptimizationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 150))
      }

      // Force garbage collection
      if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc()
      }

      setLastOptimization(new Date())
    } catch (error) {
      console.error('Memory optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Network optimization
  const optimizeNetwork = async () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)

    try {
      // Simulate network optimization
      for (let i = 0; i <= 100; i += 25) {
        setOptimizationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Prefetch critical resources
      if (typeof window !== 'undefined') {
        const criticalResources = [
          '/api/dashboard',
          '/api/reports',
          '/manifest.json'
        ]

        criticalResources.forEach(resource => {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = resource
          document.head.appendChild(link)
        })
      }

      setLastOptimization(new Date())
    } catch (error) {
      console.error('Network optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Full optimization
  const runFullOptimization = async () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)

    try {
      const steps = [
        { name: 'Clearing cache...', progress: 20 },
        { name: 'Optimizing bundle...', progress: 40 },
        { name: 'Optimizing memory...', progress: 60 },
        { name: 'Optimizing network...', progress: 80 },
        { name: 'Finalizing...', progress: 100 }
      ]

      for (const step of steps) {
        setOptimizationProgress(step.progress)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      await clearCache()
      await optimizeBundleSize()
      await optimizeMemory()
      await optimizeNetwork()

      setLastOptimization(new Date())
    } catch (error) {
      console.error('Full optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const getCacheSize = () => {
    if (typeof window === 'undefined') return '0 KB'
    
    let totalSize = 0
    
    // Calculate localStorage size
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length
      }
    }
    
    // Calculate sessionStorage size
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        totalSize += sessionStorage[key].length
      }
    }
    
    if (totalSize < 1024) return `${totalSize} B`
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`
    return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Optimization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Optimization Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Size</span>
                <Badge variant="outline">{getCacheSize()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compression</span>
                <Badge variant={config.compressionEnabled ? "default" : "secondary"}>
                  {config.compressionEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lazy Loading</span>
                <Badge variant={config.lazyLoading ? "default" : "secondary"}>
                  {config.lazyLoading ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Optimization</span>
                <span className="text-xs text-gray-500">
                  {lastOptimization ? lastOptimization.toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Max Cache Size</span>
                <span className="text-xs text-gray-500">
                  {(config.maxCacheSize / (1024 * 1024)).toFixed(0)}MB
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={clearCache}
              disabled={isOptimizing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cache
            </Button>
            
            <Button
              onClick={optimizeBundleSize}
              disabled={isOptimizing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Optimize Bundle
            </Button>
            
            <Button
              onClick={optimizeMemory}
              disabled={isOptimizing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MemoryStick className="h-4 w-4" />
              Optimize Memory
            </Button>
            
            <Button
              onClick={optimizeNetwork}
              disabled={isOptimizing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Wifi className="h-4 w-4" />
              Optimize Network
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            Full System Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Run a comprehensive optimization that includes cache clearing, bundle optimization, 
              memory cleanup, and network optimization.
            </p>
            
            {isOptimizing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Optimizing system...</span>
                  <span>{optimizationProgress}%</span>
                </div>
                <Progress value={optimizationProgress} className="h-2" />
              </div>
            )}
            
            <Button
              onClick={runFullOptimization}
              disabled={isOptimizing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
              {isOptimizing ? 'Optimizing...' : 'Run Full Optimization'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-600" />
            System Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-xs text-gray-500">
                    {(metrics.memoryUsage * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.memoryUsage * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Network Latency</span>
                  <span className="text-xs text-gray-500">
                    {metrics.networkLatency.toFixed(0)}ms
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, (metrics.networkLatency / 10))} 
                  className="h-2" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Cache Hit Rate</span>
                  <span className="text-xs text-gray-500">
                    {(metrics.cacheHitRate * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.cacheHitRate * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-xs text-gray-500">
                    {(metrics.errorRate * 100).toFixed(2)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, metrics.errorRate * 1000)} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}













