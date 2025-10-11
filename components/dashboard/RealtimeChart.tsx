'use client'

import React, { useEffect, useRef } from 'react'
import { useRealtime } from '@/contexts/RealtimeContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Wifi, 
  WifiOff,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface RealtimeChartProps {
  dataType: 'sales' | 'customers' | 'revenue'
  chartType?: 'line' | 'area'
  title?: string
  color?: string
  showControls?: boolean
}

export function RealtimeChart({ 
  dataType, 
  chartType = 'line', 
  title, 
  color = '#3b82f6',
  showControls = true 
}: RealtimeChartProps) {
  const {
    salesData,
    customerData,
    revenueData,
    isConnected,
    connectionStatus,
    startRealtime,
    stopRealtime,
    clearData,
    totalUpdates,
    lastUpdate
  } = useRealtime()

  const chartRef = useRef<HTMLDivElement>(null)

  const getData = () => {
    switch (dataType) {
      case 'sales':
        return salesData
      case 'customers':
        return customerData
      case 'revenue':
        return revenueData
      default:
        return []
    }
  }

  const getTitle = () => {
    if (title) return title
    
    switch (dataType) {
      case 'sales':
        return 'Gerçek Zamanlı Satış'
      case 'customers':
        return 'Gerçek Zamanlı Müşteri Sayısı'
      case 'revenue':
        return 'Gerçek Zamanlı Gelir'
      default:
        return 'Gerçek Zamanlı Veri'
    }
  }

  const data = getData()
  const latestValue = data.length > 0 ? data[data.length - 1]?.value : 0
  const previousValue = data.length > 1 ? data[data.length - 2]?.value : latestValue
  const trend = latestValue > previousValue ? 'up' : latestValue < previousValue ? 'down' : 'stable'

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800'
      case 'disconnected':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Bağlı'
      case 'connecting':
        return 'Bağlanıyor...'
      case 'disconnected':
        return 'Bağlantı Yok'
      case 'error':
        return 'Hata'
      default:
        return 'Bilinmiyor'
    }
  }

  const formatValue = (value: number) => {
    switch (dataType) {
      case 'sales':
        return `${value.toLocaleString('tr-TR')} ₺`
      case 'customers':
        return `${Math.round(value)} kişi`
      case 'revenue':
        return `${value.toLocaleString('tr-TR')} ₺`
      default:
        return value.toString()
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{getTitle()}</CardTitle>
            <Badge className={getStatusColor()}>
              {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {getStatusText()}
            </Badge>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={isConnected ? stopRealtime : startRealtime}
                className="h-8 w-8 p-0"
              >
                {isConnected ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearData}
                className="h-8 w-8 p-0"
                disabled={data.length === 0}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(latestValue)}
            </div>
            {trend !== 'stable' && (
              <div className={`flex items-center gap-1 ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {Math.abs(((latestValue - previousValue) / previousValue * 100)).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            <div>Güncellemeler: {totalUpdates}</div>
            {lastUpdate && (
              <div>Son: {lastUpdate.toLocaleTimeString('tr-TR')}</div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div ref={chartRef} className="h-64 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`gradient-${dataType}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (dataType === 'revenue') {
                        return `${(value / 1000).toFixed(0)}K`
                      }
                      return value.toString()
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatValue(value), getTitle()]}
                    labelFormatter={(label) => `Zaman: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#gradient-${dataType})`}
                    dot={{ fill: color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (dataType === 'revenue') {
                        return `${(value / 1000).toFixed(0)}K`
                      }
                      return value.toString()
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatValue(value), getTitle()]}
                    labelFormatter={(label) => `Zaman: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={3}
                    dot={{ fill: color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Veri bekleniyor...</p>
                <p className="text-sm">Gerçek zamanlı veri akışını başlatın</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}




















