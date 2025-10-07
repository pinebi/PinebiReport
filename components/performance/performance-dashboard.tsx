'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Zap, 
  Database, 
  Wifi, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { usePerformance } from '@/hooks/use-performance'

interface PerformanceDashboardProps {
  className?: string
}

export function PerformanceDashboard({ className = '' }: PerformanceDashboardProps) {
  const { metrics, isOptimized, getRecommendations } = usePerformance()

  const getPerformanceScore = () => {
    let score = 100

    // Load time penalty
    if (metrics.loadTime > 3000) score -= 20
    else if (metrics.loadTime > 2000) score -= 10
    else if (metrics.loadTime > 1000) score -= 5

    // Memory usage penalty
    if (metrics.memoryUsage > 0.8) score -= 20
    else if (metrics.memoryUsage > 0.7) score -= 10
    else if (metrics.memoryUsage > 0.5) score -= 5

    // Network latency penalty
    if (metrics.networkLatency > 2000) score -= 15
    else if (metrics.networkLatency > 1000) score -= 10
    else if (metrics.networkLatency > 500) score -= 5

    // Cache hit rate penalty
    if (metrics.cacheHitRate < 0.3) score -= 15
    else if (metrics.cacheHitRate < 0.5) score -= 10
    else if (metrics.cacheHitRate < 0.7) score -= 5

    // Error rate penalty
    if (metrics.errorRate > 0.2) score -= 20
    else if (metrics.errorRate > 0.1) score -= 10
    else if (metrics.errorRate > 0.05) score -= 5

    return Math.max(0, score)
  }

  const performanceScore = getPerformanceScore()
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">
              <span className={getScoreColor(performanceScore)}>
                {performanceScore}
              </span>
              <span className="text-gray-500 text-lg">/100</span>
            </div>
            <Badge className={getScoreBadge(performanceScore)}>
              {performanceScore >= 90 ? 'Mükemmel' : 
               performanceScore >= 70 ? 'İyi' : 'Geliştirilmeli'}
            </Badge>
          </div>
          
          <Progress 
            value={performanceScore} 
            className="h-2"
          />
          
          <div className="flex items-center gap-2 mt-2">
            {isOptimized ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Optimized</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Needs Optimization</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Load Time */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Load Time</span>
              </div>
              {metrics.loadTime < 2000 ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="text-2xl font-bold">
              <span className={metrics.loadTime < 2000 ? 'text-green-600' : 'text-red-600'}>
                {metrics.loadTime.toFixed(0)}ms
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {metrics.loadTime < 1000 ? 'Excellent' : 
               metrics.loadTime < 2000 ? 'Good' : 
               metrics.loadTime < 3000 ? 'Fair' : 'Poor'}
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              {metrics.memoryUsage < 0.7 ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="text-2xl font-bold">
              <span className={metrics.memoryUsage < 0.7 ? 'text-green-600' : 'text-red-600'}>
                {(metrics.memoryUsage * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={metrics.memoryUsage * 100} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        {/* Network Latency */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Network Latency</span>
              </div>
              {metrics.networkLatency < 500 ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="text-2xl font-bold">
              <span className={metrics.networkLatency < 500 ? 'text-green-600' : 'text-red-600'}>
                {metrics.networkLatency.toFixed(0)}ms
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {metrics.networkLatency < 200 ? 'Excellent' : 
               metrics.networkLatency < 500 ? 'Good' : 
               metrics.networkLatency < 1000 ? 'Fair' : 'Poor'}
            </div>
          </CardContent>
        </Card>

        {/* Cache Hit Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Cache Hit Rate</span>
              </div>
              {metrics.cacheHitRate > 0.6 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="text-2xl font-bold">
              <span className={metrics.cacheHitRate > 0.6 ? 'text-green-600' : 'text-red-600'}>
                {(metrics.cacheHitRate * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={metrics.cacheHitRate * 100} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              {metrics.errorRate < 0.05 ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="text-2xl font-bold">
              <span className={metrics.errorRate < 0.05 ? 'text-green-600' : 'text-red-600'}>
                {(metrics.errorRate * 100).toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {metrics.errorRate < 0.01 ? 'Excellent' : 
               metrics.errorRate < 0.05 ? 'Good' : 
               metrics.errorRate < 0.1 ? 'Fair' : 'Poor'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {getRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}






