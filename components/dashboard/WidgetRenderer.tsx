'use client'

import React, { useState, useEffect } from 'react'
import { DashboardWidget } from '@/types'
import { KPICards } from './kpi-cards'
import { DailySalesChart } from './daily-sales-chart'
import { PaymentDistributionChart } from './payment-distribution-chart'
import { TopCustomers } from './top-customers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface WidgetRendererProps {
  widget: DashboardWidget
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Fetch widget data
  useEffect(() => {
    fetchWidgetData()
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      if (widget.refreshRate > 0) {
        fetchWidgetData()
      }
    }, widget.refreshRate)

    return () => clearInterval(interval)
  }, [widget.dataSource, widget.refreshRate, widget.config])

  const fetchWidgetData = async () => {
    if (!widget.dataSource) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(widget.dataSource, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(widget.config)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Widget data fetch error:', error)
      setError(error instanceof Error ? error.message : 'Veri yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchWidgetData()
  }

  const renderWidgetContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Yenile
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    switch (widget.widgetType) {
      case 'kpi':
        return <KPICards data={data} />
      
      case 'chart':
        return <DailySalesChart data={data} />
      
      case 'gauge':
        return <PaymentDistributionChart data={data} />
      
      case 'table':
        return <TopCustomers data={data} />
      
      case 'progress':
        return <ProgressWidget data={data} config={widget.config} />
      
      case 'text':
        return <TextWidget config={widget.config} />
      
      case 'image':
        return <ImageWidget config={widget.config} />
      
      case 'iframe':
        return <IframeWidget config={widget.config} />
      
      default:
        return (
          <div className="flex items-center justify-center h-32 text-gray-500">
            Bilinmeyen widget türü: {widget.widgetType}
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Refresh Button */}
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Widget Content */}
      <div className="flex-1 overflow-hidden">
        {renderWidgetContent()}
      </div>

      {/* Last Refresh Time */}
      {!isLoading && !error && (
        <div className="text-xs text-gray-400 mt-2 text-right">
          Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
        </div>
      )}
    </div>
  )
}

// Additional Widget Components
function ProgressWidget({ data, config }: { data: any; config: any }) {
  const progress = data?.progress || config.defaultProgress || 0
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{progress}%</div>
        <div className="text-sm text-gray-500">{config.title || 'İlerleme'}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function TextWidget({ config }: { config: any }) {
  return (
    <div className="prose prose-sm max-w-none">
      <div 
        dangerouslySetInnerHTML={{ 
          __html: config.content || '<p>Metin içeriği buraya gelecek</p>' 
        }} 
      />
    </div>
  )
}

function ImageWidget({ config }: { config: any }) {
  return (
    <div className="w-full h-full">
      <img
        src={config.src || '/placeholder-image.jpg'}
        alt={config.alt || 'Widget Image'}
        className="w-full h-full object-cover rounded"
      />
    </div>
  )
}

function IframeWidget({ config }: { config: any }) {
  return (
    <iframe
      src={config.src || 'https://example.com'}
      className="w-full h-full border-0 rounded"
      title={config.title || 'Widget Iframe'}
    />
  )
}
