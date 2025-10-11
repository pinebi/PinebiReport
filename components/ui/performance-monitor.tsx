'use client'

import { useState } from 'react'
import { usePerformance } from '@/hooks/use-performance'

export function PerformanceMonitor() {
  const { metrics, isOptimized, getRecommendations } = usePerformance()
  const [isVisible, setIsVisible] = useState(false)

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          p-2 rounded-full text-white text-xs font-bold
          ${isOptimized ? 'bg-green-500' : 'bg-red-500'}
        `}
      >
        {isOptimized ? '⚡' : '🐌'}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border">
          <h3 className="font-bold mb-2">Performance Metrics</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Load Time:</span>
              <span className={metrics.loadTime < 2000 ? 'text-green-600' : 'text-red-600'}>
                {metrics.loadTime.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span className={metrics.memoryUsage < 0.7 ? 'text-green-600' : 'text-red-600'}>
                {(metrics.memoryUsage * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Network Latency:</span>
              <span className={metrics.networkLatency < 500 ? 'text-green-600' : 'text-red-600'}>
                {metrics.networkLatency.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Cache Hit Rate:</span>
              <span className={metrics.cacheHitRate > 0.6 ? 'text-green-600' : 'text-red-600'}>
                {(metrics.cacheHitRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {getRecommendations.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <h4 className="font-semibold text-sm mb-2">Öneriler:</h4>
              <ul className="text-xs space-y-1">
                {getRecommendations.map((rec, index) => (
                  <li key={index} className="text-yellow-600">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}













