'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface CustomerRevenueData {
  company: string
  totalRevenue: number
  totalCustomers: number
  averageRevenue: number
  change?: number // Önceki döneme göre değişim yüzdesi
  trend?: 'up' | 'down' | 'stable'
}

interface AverageCustomerRevenueProps {
  data: CustomerRevenueData[]
  title?: string
}

export function AverageCustomerRevenue({ 
  data = [], 
  title = "Müşteri Başına Ortalama Ciro" 
}: AverageCustomerRevenueProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₺${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `₺${(amount / 1000).toFixed(0)}K`
    }
    return `₺${amount}`
  }

  // Toplam istatistikler
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0)
  const totalCustomers = data.reduce((sum, item) => sum + item.totalCustomers, 0)
  const overallAverage = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  // Grafik için veri hazırla
  const chartData = data.map(item => ({
    name: item.company.length > 20 ? item.company.substring(0, 20) + '...' : item.company,
    fullName: item.company,
    averageRevenue: item.averageRevenue,
    totalRevenue: item.totalRevenue,
    totalCustomers: item.totalCustomers,
    trend: item.trend,
    change: item.change
  }))

  // Trend'e göre renk
  const getBarColor = (trend?: 'up' | 'down' | 'stable') => {
    switch(trend) {
      case 'up': return '#10b981' // emerald-500
      case 'down': return '#ef4444' // red-500
      default: return '#6b7280' // gray-500
    }
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{data.fullName}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Müşteri Başına: <span className="font-bold">{formatCurrency(data.averageRevenue)}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Toplam Ciro: {formatCurrency(data.totalRevenue)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Müşteri: {data.totalCustomers}
          </p>
          {data.change !== undefined && (
            <p className={`text-sm font-semibold mt-1 ${
              data.trend === 'up' ? 'text-emerald-600' : 
              data.trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {totalCustomers} Müşteri
            </Badge>
            <Badge variant="outline" className="text-xs">
              Ort: {formatCompactCurrency(overallAverage)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Grafik */}
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 11 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                tickFormatter={formatCompactCurrency}
                tick={{ fontSize: 11 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="averageRevenue" 
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.trend)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Henüz müşteri verisi bulunmuyor
            </p>
          </div>
        )}

        {/* Özet Bilgi */}
        {data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Yükseliş</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Düşüş</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Sabit</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Ciro</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCompactCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

