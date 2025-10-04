'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  Banknote, 
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'
import { SalesAnalytics, SalesData } from '@/lib/analytics/sales-analytics'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

interface AdvancedWidgetProps {
  data: SalesData[]
  title?: string
  className?: string
}

// KPI Dashboard Widget
export function KPIDashboard({ data, title = "Ana Performans Göstergeleri", className }: AdvancedWidgetProps) {
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null)
  const [kpis, setKpis] = useState<any>(null)

  useEffect(() => {
    if (data.length > 0) {
      const salesAnalytics = new SalesAnalytics(data)
      setAnalytics(salesAnalytics)
      setKpis(salesAnalytics.calculateKPIs())
    }
  }, [data])

  if (!kpis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const kpiItems = [
    {
      title: 'Toplam Ciro',
      value: formatCurrency(kpis.revenue.total),
      change: kpis.revenue.growth,
      trend: kpis.revenue.trend,
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      title: 'Toplam Müşteri',
      value: formatNumber(kpis.customers.total),
      change: 0, // Bu hesaplanabilir
      trend: 'up' as const,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Ortalama Sipariş',
      value: formatCurrency(kpis.customers.averageOrderValue),
      change: 0, // Bu hesaplanabilir
      trend: 'up' as const,
      icon: Target,
      color: 'text-purple-600'
    },
    {
      title: 'Kart Ödeme Oranı',
      value: formatPercentage(kpis.payment.cardPercentage / 100),
      change: 0, // Bu hesaplanabilir
      trend: 'up' as const,
      icon: CreditCard,
      color: 'text-orange-600'
    }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiItems.map((item, index) => {
            const Icon = item.icon
            const isPositive = item.change > 0
            const isNegative = item.change < 0
            
            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {item.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {item.title}
                </div>
                {item.change !== 0 && (
                  <div className={`flex items-center justify-center gap-1 text-sm ${
                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : isNegative ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    <span>{Math.abs(item.change).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Trend Analizi Widget
export function TrendAnalysisWidget({ data, title = "Trend Analizi", className }: AdvancedWidgetProps) {
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null)

  useEffect(() => {
    if (data.length > 0) {
      const salesAnalytics = new SalesAnalytics(data)
      setTrendAnalysis(salesAnalytics.analyzeTrend('daily'))
    }
  }, [data])

  if (!trendAnalysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />
      case 'down': return <TrendingDown className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trend Göstergesi */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon(trendAnalysis.trend)}
              <span className="text-sm font-medium">Mevcut Trend</span>
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(trendAnalysis.trend)}`}>
              <span className="text-lg font-bold">
                {Math.abs(trendAnalysis.percentage).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Trend Açıklaması */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {trendAnalysis.trend === 'up' && 'Satışlar artış trendinde'}
            {trendAnalysis.trend === 'down' && 'Satışlar düşüş trendinde'}
            {trendAnalysis.trend === 'stable' && 'Satışlar stabil durumda'}
          </div>

          {/* Tahmin */}
          {trendAnalysis.forecast.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">7 Günlük Tahmin</h4>
              <div className="space-y-2">
                {trendAnalysis.forecast.slice(0, 3).map((forecast: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(forecast.date).toLocaleDateString('tr-TR')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(forecast.predicted)}
                      </span>
                      <span className="text-xs text-gray-500">
                        %{forecast.confidence} güven
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Ödeme Yöntemleri Widget
export function PaymentMethodsWidget({ data, title = "Ödeme Yöntemleri", className }: AdvancedWidgetProps) {
  const [paymentAnalysis, setPaymentAnalysis] = useState<any>(null)

  useEffect(() => {
    if (data.length > 0) {
      const salesAnalytics = new SalesAnalytics(data)
      setPaymentAnalysis(salesAnalytics.analyzePaymentMethods())
    }
  }, [data])

  if (!paymentAnalysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const paymentMethods = [
    {
      name: 'Nakit',
      amount: paymentAnalysis.cash.amount,
      percentage: paymentAnalysis.cash.percentage,
      icon: Banknote,
      color: 'bg-green-500'
    },
    {
      name: 'Kredi Kartı',
      amount: paymentAnalysis.card.amount,
      percentage: paymentAnalysis.card.percentage,
      icon: CreditCard,
      color: 'bg-blue-500'
    },
    {
      name: 'Açık Hesap',
      amount: paymentAnalysis.credit.amount,
      percentage: paymentAnalysis.credit.percentage,
      icon: Activity,
      color: 'bg-purple-500'
    }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Toplam */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(paymentAnalysis.total)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Toplam Ciro
            </div>
          </div>

          {/* Ödeme Yöntemleri */}
          <div className="space-y-3">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${method.color}`} />
                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(method.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(method.percentage / 100)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Şirket Performansı Widget
export function CompanyPerformanceWidget({ data, title = "Şirket Performansı", className }: AdvancedWidgetProps) {
  const [companyPerformance, setCompanyPerformance] = useState<any[]>([])

  useEffect(() => {
    if (data.length > 0) {
      const salesAnalytics = new SalesAnalytics(data)
      const metrics = salesAnalytics.calculateMetrics()
      setCompanyPerformance(metrics.companyPerformance)
    }
  }, [data])

  if (companyPerformance.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companyPerformance.map((company, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{company.company}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatPercentage(company.marketShare / 100)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${company.marketShare}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatCurrency(company.revenue)}</span>
                <span>{formatNumber(company.customers)} müşteri</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}



