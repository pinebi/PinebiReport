'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  LineChart,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HoverScale } from '@/hooks/use-ui-animations'

interface AnalyticsData {
  salesData: {
    date: string
    revenue: number
    customers: number
    orders: number
  }[]
  categoryData: {
    category: string
    revenue: number
    percentage: number
    color: string
  }[]
  customerSegments: {
    segment: string
    count: number
    revenue: number
    avgOrderValue: number
  }[]
  timeAnalysis: {
    hour: number
    sales: number
    orders: number
  }[]
  geographicData: {
    region: string
    revenue: number
    customers: number
    growth: number
  }[]
}

interface AdvancedAnalyticsProps {
  data: AnalyticsData
  isLoading?: boolean
  onRefresh?: () => void
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void
}

export default function AdvancedAnalytics({ 
  data, 
  isLoading = false, 
  onRefresh,
  onExport 
}: AdvancedAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = data.salesData.reduce((sum, item) => sum + item.revenue, 0)
    const totalCustomers = data.salesData.reduce((sum, item) => sum + item.customers, 0)
    const totalOrders = data.salesData.reduce((sum, item) => sum + item.orders, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Growth calculation (compare with previous period)
    const currentPeriod = data.salesData.slice(-7) // Last 7 days
    const previousPeriod = data.salesData.slice(-14, -7) // 7 days before
    const currentRevenue = currentPeriod.reduce((sum, item) => sum + item.revenue, 0)
    const previousRevenue = previousPeriod.reduce((sum, item) => sum + item.revenue, 0)
    const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    return {
      totalRevenue,
      totalCustomers,
      totalOrders,
      avgOrderValue,
      growthRate
    }
  }, [data])

  const periods = [
    { value: '7d', label: 'Son 7 Gün' },
    { value: '30d', label: 'Son 30 Gün' },
    { value: '90d', label: 'Son 3 Ay' },
    { value: '1y', label: 'Son 1 Yıl' }
  ]

  const metrics_options = [
    { value: 'revenue', label: 'Gelir', icon: '💰' },
    { value: 'customers', label: 'Müşteri', icon: '👥' },
    { value: 'orders', label: 'Sipariş', icon: '📦' },
    { value: 'conversion', label: 'Dönüşüm', icon: '📈' }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Gelişmiş Analiz</h2>
          <div className="flex items-center gap-2">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HoverScale scale={1.02}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₺{metrics.totalRevenue.toLocaleString('tr-TR')}
                  </p>
                  <div className="flex items-center mt-1">
                    {metrics.growthRate >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${metrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      %{Math.abs(metrics.growthRate).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        <HoverScale scale={1.02}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalCustomers.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Aktif müşteriler
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        <HoverScale scale={1.02}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalOrders.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Ortalama: ₺{metrics.avgOrderValue.toFixed(0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        <HoverScale scale={1.02}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dönüşüm Oranı</p>
                  <p className="text-2xl font-bold text-gray-900">%{((metrics.totalOrders / metrics.totalCustomers) * 100).toFixed(1)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Müşteri başına sipariş
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <LineChart className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <HoverScale scale={1.01}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Gelir Trendi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gelir trendi grafiği</p>
                  <p className="text-sm text-gray-400">Chart.js veya D3.js ile entegre edilecek</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        {/* Category Distribution */}
        <HoverScale scale={1.01}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Kategori Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₺{category.revenue.toLocaleString('tr-TR')}</p>
                      <p className="text-xs text-gray-500">%{category.percentage.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        {/* Customer Segments */}
        <HoverScale scale={1.01}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Müşteri Segmentleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.customerSegments.map((segment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{segment.segment}</h4>
                      <span className="text-sm text-gray-500">{segment.count} müşteri</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Toplam Gelir</p>
                        <p className="font-semibold">₺{segment.revenue.toLocaleString('tr-TR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ort. Sipariş Değeri</p>
                        <p className="font-semibold">₺{segment.avgOrderValue.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        {/* Time Analysis */}
        <HoverScale scale={1.01}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Saatlik Analiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.timeAnalysis.map((hour, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">
                      {hour.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>₺{hour.sales.toLocaleString('tr-TR')}</span>
                        <span>{hour.orders} sipariş</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(hour.sales / Math.max(...data.timeAnalysis.map(h => h.sales))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </HoverScale>
      </div>

      {/* Geographic Analysis */}
      <HoverScale scale={1.01}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Bölgesel Analiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.geographicData.map((region, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{region.region}</h4>
                    <span className={`text-sm font-medium ${region.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {region.growth >= 0 ? '+' : ''}%{region.growth.toFixed(1)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Gelir</p>
                      <p className="font-semibold">₺{region.revenue.toLocaleString('tr-TR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Müşteri</p>
                      <p className="font-semibold">{region.customers.toLocaleString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </HoverScale>
    </div>
  )
}

// Mock data generator for testing
export function generateMockAnalyticsData(): AnalyticsData {
  const salesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 100000) + 50000,
      customers: Math.floor(Math.random() * 200) + 50,
      orders: Math.floor(Math.random() * 150) + 30
    }
  })

  const categoryData = [
    { category: 'Elektronik', revenue: 450000, percentage: 35, color: '#3B82F6' },
    { category: 'Giyim', revenue: 320000, percentage: 25, color: '#10B981' },
    { category: 'Ev & Yaşam', revenue: 280000, percentage: 22, color: '#F59E0B' },
    { category: 'Spor', revenue: 180000, percentage: 14, color: '#EF4444' },
    { category: 'Kitap', revenue: 50000, percentage: 4, color: '#8B5CF6' }
  ]

  const customerSegments = [
    { segment: 'VIP Müşteriler', count: 150, revenue: 800000, avgOrderValue: 2500 },
    { segment: 'Sadık Müşteriler', count: 850, revenue: 450000, avgOrderValue: 800 },
    { segment: 'Yeni Müşteriler', count: 1200, revenue: 200000, avgOrderValue: 300 },
    { segment: 'Düşük Aktif', count: 500, revenue: 50000, avgOrderValue: 150 }
  ]

  const timeAnalysis = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    sales: Math.floor(Math.random() * 50000) + 10000,
    orders: Math.floor(Math.random() * 100) + 10
  }))

  const geographicData = [
    { region: 'İstanbul', revenue: 800000, customers: 2500, growth: 12.5 },
    { region: 'Ankara', revenue: 450000, customers: 1200, growth: 8.3 },
    { region: 'İzmir', revenue: 380000, customers: 980, growth: 15.2 },
    { region: 'Bursa', revenue: 220000, customers: 650, growth: -2.1 },
    { region: 'Antalya', revenue: 180000, customers: 520, growth: 6.7 },
    { region: 'Diğer', revenue: 320000, customers: 850, growth: 4.8 }
  ]

  return {
    salesData,
    categoryData,
    customerSegments,
    timeAnalysis,
    geographicData
  }
}






