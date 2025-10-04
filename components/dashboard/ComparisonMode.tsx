'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Users,
  DollarSign,
  Target,
  X,
  Plus,
  ArrowRightLeft,
  Percent,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComparisonData {
  period: string
  label: string
  value: number
  change?: number
  changePercent?: number
}

interface ComparisonModeProps {
  data: ComparisonData[]
  onPeriodChange?: (period: string) => void
  className?: string
}

type ComparisonType = 'period' | 'metric' | 'category'
type ViewType = 'side-by-side' | 'overlay' | 'percentage'

export function ComparisonMode({ 
  data, 
  onPeriodChange, 
  className 
}: ComparisonModeProps) {
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['current', 'previous'])
  const [comparisonType, setComparisonType] = useState<ComparisonType>('period')
  const [viewType, setViewType] = useState<ViewType>('side-by-side')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['sales', 'customers'])
  const [isActive, setIsActive] = useState(false)

  const periods = [
    { value: 'current', label: 'Bu Ay' },
    { value: 'previous', label: 'Geçen Ay' },
    { value: 'last3months', label: 'Son 3 Ay' },
    { value: 'last6months', label: 'Son 6 Ay' },
    { value: 'lastyear', label: 'Geçen Yıl' },
    { value: 'custom', label: 'Özel Dönem' }
  ]

  const metrics = [
    { value: 'sales', label: 'Satış', icon: DollarSign },
    { value: 'customers', label: 'Müşteri', icon: Users },
    { value: 'orders', label: 'Sipariş', icon: Target },
    { value: 'revenue', label: 'Gelir', icon: TrendingUp },
    { value: 'growth', label: 'Büyüme', icon: Activity }
  ]

  const getComparisonData = () => {
    if (comparisonType === 'period') {
      return data.filter(d => selectedPeriods.includes(d.period))
    }
    return data
  }

  const calculateComparison = (current: ComparisonData, previous: ComparisonData) => {
    const change = current.value - previous.value
    const changePercent = previous.value !== 0 ? (change / previous.value) * 100 : 0
    
    return {
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    }
  }

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'sales':
      case 'revenue':
        return `₺${value.toLocaleString('tr-TR')}`
      case 'customers':
      case 'orders':
        return value.toLocaleString('tr-TR')
      case 'growth':
        return `${value.toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50'
      case 'down':
        return 'text-red-600 bg-red-50'
      case 'stable':
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Comparison Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Karşılaştırma Modu
            </CardTitle>
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? 'Deaktif Et' : 'Aktif Et'}
            </Button>
          </div>
        </CardHeader>

        {isActive && (
          <CardContent className="space-y-4">
            {/* Comparison Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Karşılaştırma Türü</label>
              <ToggleGroup
                type="single"
                value={comparisonType}
                onValueChange={(value) => value && setComparisonType(value as ComparisonType)}
                className="justify-start"
              >
                <ToggleGroupItem value="period">Dönem</ToggleGroupItem>
                <ToggleGroupItem value="metric">Metrik</ToggleGroupItem>
                <ToggleGroupItem value="category">Kategori</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Period Selection */}
            {comparisonType === 'period' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Karşılaştırılacak Dönemler</label>
                <div className="flex flex-wrap gap-2">
                  {periods.map(period => (
                    <Button
                      key={period.value}
                      variant={selectedPeriods.includes(period.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedPeriods.includes(period.value)) {
                          setSelectedPeriods(prev => prev.filter(p => p !== period.value))
                        } else if (selectedPeriods.length < 3) {
                          setSelectedPeriods(prev => [...prev, period.value])
                        }
                      }}
                      disabled={!selectedPeriods.includes(period.value) && selectedPeriods.length >= 3}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Metric Selection */}
            {comparisonType === 'metric' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Karşılaştırılacak Metrikler</label>
                <div className="flex flex-wrap gap-2">
                  {metrics.map(metric => {
                    const Icon = metric.icon
                    return (
                      <Button
                        key={metric.value}
                        variant={selectedMetrics.includes(metric.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (selectedMetrics.includes(metric.value)) {
                            setSelectedMetrics(prev => prev.filter(m => m !== metric.value))
                          } else if (selectedMetrics.length < 4) {
                            setSelectedMetrics(prev => [...prev, metric.value])
                          }
                        }}
                        disabled={!selectedMetrics.includes(metric.value) && selectedMetrics.length >= 4}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {metric.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* View Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Görünüm Türü</label>
              <ToggleGroup
                type="single"
                value={viewType}
                onValueChange={(value) => value && setViewType(value as ViewType)}
                className="justify-start"
              >
                <ToggleGroupItem value="side-by-side">Yan Yana</ToggleGroupItem>
                <ToggleGroupItem value="overlay">Üst Üste</ToggleGroupItem>
                <ToggleGroupItem value="percentage">Yüzde</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Comparison Results */}
      {isActive && (
        <div className={cn(
          "space-y-4",
          viewType === 'side-by-side' && "grid grid-cols-1 lg:grid-cols-2 gap-4",
          viewType === 'overlay' && "space-y-4",
          viewType === 'percentage' && "space-y-4"
        )}>
          {getComparisonData().map((item, index) => {
            const previousItem = getComparisonData()[index + 1]
            const comparison = previousItem ? calculateComparison(item, previousItem) : null
            
            return (
              <Card key={item.period} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.label}</CardTitle>
                    <Badge variant="outline">{item.period}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Main Value */}
                  <div className="text-3xl font-bold text-gray-900">
                    {formatValue(item.value, 'sales')}
                  </div>

                  {/* Comparison */}
                  {comparison && (
                    <div className={cn(
                      "flex items-center gap-2 p-3 rounded-lg",
                      getTrendColor(comparison.trend as any)
                    )}>
                      {getTrendIcon(comparison.trend as any)}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {comparison.changePercent > 0 ? '+' : ''}{comparison.changePercent.toFixed(1)}%
                        </span>
                        <span className="text-sm">
                          ({comparison.change > 0 ? '+' : ''}{formatValue(comparison.change, 'sales')})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Additional Metrics */}
                  {comparisonType === 'metric' && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      {selectedMetrics.slice(0, 4).map(metric => {
                        const metricData = metrics.find(m => m.value === metric)
                        const Icon = metricData?.icon || Activity
                        
                        return (
                          <div key={metric} className="text-center p-2 bg-gray-50 rounded">
                            <Icon className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                            <div className="text-xs text-gray-600">{metricData?.label}</div>
                            <div className="text-sm font-medium">
                              {formatValue(Math.random() * 1000, metric)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>

                {/* Overlay Mode Indicator */}
                {viewType === 'overlay' && comparison && (
                  <div className="absolute top-2 right-2">
                    <Badge 
                      className={cn(
                        "text-xs",
                        comparison.trend === 'up' ? "bg-green-100 text-green-800" :
                        comparison.trend === 'down' ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      )}
                    >
                      {comparison.changePercent > 0 ? '+' : ''}{comparison.changePercent.toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}




