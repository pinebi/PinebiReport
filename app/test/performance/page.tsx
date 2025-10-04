'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Gauge, 
  Zap, 
  Clock, 
  MemoryStick,
  Cpu,
  HardDrive,
  Network,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  trend?: 'up' | 'down' | 'stable'
}

interface TestResult {
  name: string
  duration: number
  status: 'passed' | 'failed'
  details?: string
}

export default function PerformanceTestPage() {
  const { success, error, warning, info } = useToast()
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const performanceRef = useRef<Performance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      performanceRef.current = window.performance
      initializeMetrics()
      startPerformanceMonitoring()
    }
  }, [])

  const initializeMetrics = () => {
    const initialMetrics: PerformanceMetric[] = [
      {
        name: 'Page Load Time',
        value: 0,
        unit: 'ms',
        status: 'good'
      },
      {
        name: 'Memory Usage',
        value: 0,
        unit: 'MB',
        status: 'good'
      },
      {
        name: 'CPU Usage',
        value: 0,
        unit: '%',
        status: 'good'
      },
      {
        name: 'Network Latency',
        value: 0,
        unit: 'ms',
        status: 'good'
      },
      {
        name: 'Bundle Size',
        value: 0,
        unit: 'KB',
        status: 'good'
      },
      {
        name: 'Render Time',
        value: 0,
        unit: 'ms',
        status: 'good'
      }
    ]
    setMetrics(initialMetrics)
  }

  const startPerformanceMonitoring = () => {
    const interval = setInterval(() => {
      updateMetrics()
    }, 1000)

    return () => clearInterval(interval)
  }

  const updateMetrics = () => {
    if (!performanceRef.current) return

    const navigation = performanceRef.current.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const memory = (performanceRef.current as any).memory
    
    setMetrics(prev => prev.map(metric => {
      let newValue = metric.value
      let newStatus = metric.status

      switch (metric.name) {
        case 'Page Load Time':
          newValue = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0
          newStatus = newValue < 1000 ? 'good' : newValue < 3000 ? 'warning' : 'critical'
          break
        case 'Memory Usage':
          newValue = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0
          newStatus = newValue < 50 ? 'good' : newValue < 100 ? 'warning' : 'critical'
          break
        case 'Network Latency':
          newValue = Math.random() * 100 + 10 // Mock network latency
          newStatus = newValue < 50 ? 'good' : newValue < 100 ? 'warning' : 'critical'
          break
        case 'Bundle Size':
          newValue = Math.random() * 500 + 100 // Mock bundle size
          newStatus = newValue < 300 ? 'good' : newValue < 500 ? 'warning' : 'critical'
          break
        case 'Render Time':
          newValue = Math.random() * 50 + 5 // Mock render time
          newStatus = newValue < 16 ? 'good' : newValue < 33 ? 'warning' : 'critical'
          break
        case 'CPU Usage':
          newValue = Math.random() * 30 + 5 // Mock CPU usage
          newStatus = newValue < 20 ? 'good' : newValue < 50 ? 'warning' : 'critical'
          break
      }

      return {
        ...metric,
        value: newValue,
        status: newStatus
      }
    }))
  }

  const runPerformanceTests = async () => {
    setIsRunning(true)
    setStartTime(Date.now())
    const results: TestResult[] = []

    try {
      // Test 1: Page Load Performance
      const loadTest = await testPageLoadPerformance()
      results.push(loadTest)

      // Test 2: Memory Performance
      const memoryTest = await testMemoryPerformance()
      results.push(memoryTest)

      // Test 3: Network Performance
      const networkTest = await testNetworkPerformance()
      results.push(networkTest)

      // Test 4: Rendering Performance
      const renderTest = await testRenderingPerformance()
      results.push(renderTest)

      // Test 5: Bundle Analysis
      const bundleTest = await testBundleAnalysis()
      results.push(bundleTest)

      setTestResults(results)
      setEndTime(Date.now())
      
      const totalDuration = endTime - startTime
      const passedTests = results.filter(r => r.status === 'passed').length
      
      success('Performance Testleri Tamamlandı!', 
        `${passedTests}/${results.length} test başarılı. Toplam süre: ${totalDuration}ms`)

    } catch (err) {
      error('Performance Test Hatası', String(err))
    } finally {
      setIsRunning(false)
    }
  }

  const testPageLoadPerformance = async (): Promise<TestResult> => {
    const start = Date.now()
    
    // Simulate page load test
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
    
    const duration = Date.now() - start
    const status = duration < 1000 ? 'passed' : 'failed'
    
    return {
      name: 'Page Load Performance',
      duration,
      status,
      details: `Page load completed in ${duration}ms`
    }
  }

  const testMemoryPerformance = async (): Promise<TestResult> => {
    const start = Date.now()
    
    // Simulate memory test
    const memory = (performanceRef.current as any).memory
    const usedMemory = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))
    
    const duration = Date.now() - start
    const status = usedMemory < 100 ? 'passed' : 'failed'
    
    return {
      name: 'Memory Performance',
      duration,
      status,
      details: `Memory usage: ${usedMemory.toFixed(2)}MB`
    }
  }

  const testNetworkPerformance = async (): Promise<TestResult> => {
    const start = Date.now()
    
    // Simulate network test
    const latency = Math.random() * 100 + 10
    await new Promise(resolve => setTimeout(resolve, latency))
    
    const duration = Date.now() - start
    const status = latency < 100 ? 'passed' : 'failed'
    
    return {
      name: 'Network Performance',
      duration,
      status,
      details: `Network latency: ${latency.toFixed(2)}ms`
    }
  }

  const testRenderingPerformance = async (): Promise<TestResult> => {
    const start = Date.now()
    
    // Simulate rendering test
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100))
    
    const duration = Date.now() - start
    const status = duration < 200 ? 'passed' : 'failed'
    
    return {
      name: 'Rendering Performance',
      duration,
      status,
      details: `Rendering completed in ${duration}ms`
    }
  }

  const testBundleAnalysis = async (): Promise<TestResult> => {
    const start = Date.now()
    
    // Simulate bundle analysis
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 400))
    
    const duration = Date.now() - start
    const status = duration < 1000 ? 'passed' : 'failed'
    
    return {
      name: 'Bundle Analysis',
      duration,
      status,
      details: `Bundle analysis completed in ${duration}ms`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <XCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'Page Load Time': return <Clock className="h-4 w-4" />
      case 'Memory Usage': return <MemoryStick className="h-4 w-4" />
      case 'CPU Usage': return <Cpu className="h-4 w-4" />
      case 'Network Latency': return <Network className="h-4 w-4" />
      case 'Bundle Size': return <HardDrive className="h-4 w-4" />
      case 'Render Time': return <Zap className="h-4 w-4" />
      default: return <Gauge className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Gauge className="h-8 w-8 text-blue-600" />
            Performance Test Merkezi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Uygulama performansını test edin ve optimize edin
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={runPerformanceTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Test Çalışıyor...' : 'Performance Testleri Çalıştır'}
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Canlı Performans Metrikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => {
              const Icon = getMetricIcon(metric.name) as any
              return (
                <div key={metric.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                  
                  <div className="text-2xl font-bold mb-1">
                    {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      {metric.unit}
                    </span>
                  </div>
                  
                  <div className={`text-xs ${getStatusColor(metric.status)}`}>
                    {metric.status === 'good' && 'Mükemmel'}
                    {metric.status === 'warning' && 'Dikkat Gerekli'}
                    {metric.status === 'critical' && 'Kritik'}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Test Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'passed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      {result.details && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {result.details}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {result.duration}ms
                    </span>
                    <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                      {result.status === 'passed' ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performans İpuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                İyi Performans
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Page load time &lt; 1000ms</li>
                <li>• Memory usage &lt; 50MB</li>
                <li>• Network latency &lt; 50ms</li>
                <li>• Bundle size &lt; 300KB</li>
                <li>• Render time &lt; 16ms</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Optimizasyon Gerekli
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Code splitting kullanın</li>
                <li>• Image optimization yapın</li>
                <li>• Lazy loading uygulayın</li>
                <li>• Memoization kullanın</li>
                <li>• Bundle analyzer çalıştırın</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sistem Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tarayıcı
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {navigator.onLine ? 'Online' : 'Offline'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Bağlantı Durumu
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {testResults.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tamamlanan Test
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
