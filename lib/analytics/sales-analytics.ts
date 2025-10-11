// Satış Analizi Engine
export interface SalesData {
  Tarih: string
  Firma: string
  Musteri_Sayisi: number
  NAKIT: number
  KREDI_KARTI: number
  ACIK_HESAP: number
  'NAKIT+KREDI_KARTI': number
  GENEL_TOPLAM: number
}

export interface SalesMetrics {
  totalRevenue: number
  totalCustomers: number
  averageOrderValue: number
  paymentMethodDistribution: {
    cash: number
    card: number
    credit: number
  }
  dailyGrowth: number
  companyPerformance: Array<{
    company: string
    revenue: number
    customers: number
    marketShare: number
  }>
}

export interface TrendAnalysis {
  period: 'daily' | 'weekly' | 'monthly'
  trend: 'up' | 'down' | 'stable'
  percentage: number
  forecast: Array<{
    date: string
    predicted: number
    confidence: number
  }>
}

export class SalesAnalytics {
  private data: SalesData[]

  constructor(data: SalesData[]) {
    this.data = data
  }

  // Temel metrikleri hesapla
  calculateMetrics(): SalesMetrics {
    const totalRevenue = this.data.reduce((sum, item) => sum + item.GENEL_TOPLAM, 0)
    const totalCustomers = this.data.reduce((sum, item) => sum + item.Musteri_Sayisi, 0)
    const averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

    const paymentMethodDistribution = {
      cash: this.data.reduce((sum, item) => sum + item.NAKIT, 0),
      card: this.data.reduce((sum, item) => sum + item.KREDI_KARTI, 0),
      credit: this.data.reduce((sum, item) => sum + item.ACIK_HESAP, 0)
    }

    // Günlük büyüme hesapla
    const dailyGrowth = this.calculateDailyGrowth()

    // Şirket performansı
    const companyPerformance = this.calculateCompanyPerformance(totalRevenue)

    return {
      totalRevenue,
      totalCustomers,
      averageOrderValue,
      paymentMethodDistribution,
      dailyGrowth,
      companyPerformance
    }
  }

  // Günlük büyüme hesapla
  private calculateDailyGrowth(): number {
    if (this.data.length < 2) return 0

    const sortedData = [...this.data].sort((a, b) => 
      new Date(a.Tarih).getTime() - new Date(b.Tarih).getTime()
    )

    const firstDay = sortedData[0]
    const lastDay = sortedData[sortedData.length - 1]

    const firstDayRevenue = firstDay.GENEL_TOPLAM
    const lastDayRevenue = lastDay.GENEL_TOPLAM

    return firstDayRevenue > 0 ? ((lastDayRevenue - firstDayRevenue) / firstDayRevenue) * 100 : 0
  }

  // Şirket performansı hesapla
  private calculateCompanyPerformance(totalRevenue: number) {
    const companyData = new Map<string, { revenue: number; customers: number }>()

    this.data.forEach(item => {
      const existing = companyData.get(item.Firma) || { revenue: 0, customers: 0 }
      companyData.set(item.Firma, {
        revenue: existing.revenue + item.GENEL_TOPLAM,
        customers: existing.customers + item.Musteri_Sayisi
      })
    })

    return Array.from(companyData.entries()).map(([company, data]) => ({
      company,
      revenue: data.revenue,
      customers: data.customers,
      marketShare: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue)
  }

  // Trend analizi
  analyzeTrend(period: 'daily' | 'weekly' | 'monthly' = 'daily'): TrendAnalysis {
    const groupedData = this.groupDataByPeriod(period)
    const values = groupedData.map(group => group.revenue)
    
    const trend = this.calculateTrend(values)
    const percentage = this.calculateTrendPercentage(values)
    const forecast = this.generateForecast(groupedData, period)

    return {
      period,
      trend,
      percentage,
      forecast
    }
  }

  // Veriyi periyoda göre grupla
  private groupDataByPeriod(period: 'daily' | 'weekly' | 'monthly') {
    const groups = new Map<string, { revenue: number; customers: number; count: number }>()

    this.data.forEach(item => {
      const date = new Date(item.Tarih)
      let key: string

      switch (period) {
        case 'weekly':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'monthly':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
        default:
          key = date.toISOString().split('T')[0]
      }

      const existing = groups.get(key) || { revenue: 0, customers: 0, count: 0 }
      groups.set(key, {
        revenue: existing.revenue + item.GENEL_TOPLAM,
        customers: existing.customers + item.Musteri_Sayisi,
        count: existing.count + 1
      })
    })

    return Array.from(groups.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // Trend hesapla
  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable'

    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    const diff = ((secondAvg - firstAvg) / firstAvg) * 100

    if (diff > 5) return 'up'
    if (diff < -5) return 'down'
    return 'stable'
  }

  // Trend yüzdesi hesapla
  private calculateTrendPercentage(values: number[]): number {
    if (values.length < 2) return 0

    const first = values[0]
    const last = values[values.length - 1]

    return first > 0 ? ((last - first) / first) * 100 : 0
  }

  // Tahmin üret
  private generateForecast(data: any[], period: string) {
    if (data.length < 3) return []

    // Basit linear regression ile tahmin
    const forecast: Array<{ date: string; predicted: number; confidence: number }> = []
    const recentData = data.slice(-3) // Son 3 veri noktası

    const avgGrowth = this.calculateAverageGrowth(recentData)
    const lastValue = recentData[recentData.length - 1].revenue

    for (let i = 1; i <= 7; i++) {
      const predictedDate = new Date(data[data.length - 1].date)
      
      switch (period) {
        case 'weekly':
          predictedDate.setDate(predictedDate.getDate() + (i * 7))
          break
        case 'monthly':
          predictedDate.setMonth(predictedDate.getMonth() + i)
          break
        default:
          predictedDate.setDate(predictedDate.getDate() + i)
      }

      const predicted = lastValue * Math.pow(1 + avgGrowth / 100, i)
      const confidence = Math.max(0, 100 - (i * 15)) // Her gün %15 güven azalması

      forecast.push({
        date: predictedDate.toISOString().split('T')[0],
        predicted: Math.round(predicted),
        confidence: Math.round(confidence)
      })
    }

    return forecast
  }

  // Ortalama büyüme hesapla
  private calculateAverageGrowth(data: any[]): number {
    if (data.length < 2) return 0

    let totalGrowth = 0
    let count = 0

    for (let i = 1; i < data.length; i++) {
      const current = data[i].revenue
      const previous = data[i - 1].revenue

      if (previous > 0) {
        totalGrowth += ((current - previous) / previous) * 100
        count++
      }
    }

    return count > 0 ? totalGrowth / count : 0
  }

  // Ödeme yöntemi analizi
  analyzePaymentMethods() {
    const total = this.data.reduce((sum, item) => sum + item.GENEL_TOPLAM, 0)
    const cash = this.data.reduce((sum, item) => sum + item.NAKIT, 0)
    const card = this.data.reduce((sum, item) => sum + item.KREDI_KARTI, 0)
    const credit = this.data.reduce((sum, item) => sum + item.ACIK_HESAP, 0)

    return {
      total,
      cash: {
        amount: cash,
        percentage: total > 0 ? (cash / total) * 100 : 0
      },
      card: {
        amount: card,
        percentage: total > 0 ? (card / total) * 100 : 0
      },
      credit: {
        amount: credit,
        percentage: total > 0 ? (credit / total) * 100 : 0
      }
    }
  }

  // Müşteri analizi
  analyzeCustomers() {
    const totalCustomers = this.data.reduce((sum, item) => sum + item.Musteri_Sayisi, 0)
    const totalRevenue = this.data.reduce((sum, item) => sum + item.GENEL_TOPLAM, 0)
    const averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

    // Günlük müşteri dağılımı
    const dailyCustomers = this.data.map(item => ({
      date: item.Tarih,
      customers: item.Musteri_Sayisi,
      revenue: item.GENEL_TOPLAM
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      totalCustomers,
      averageOrderValue,
      dailyDistribution: dailyCustomers,
      peakDay: dailyCustomers.reduce((peak, current) => 
        current.customers > peak.customers ? current : peak
      )
    }
  }

  // KPI hesaplama
  calculateKPIs() {
    const metrics = this.calculateMetrics()
    const paymentAnalysis = this.analyzePaymentMethods()
    const customerAnalysis = this.analyzeCustomers()
    const trend = this.analyzeTrend()

    return {
      revenue: {
        total: metrics.totalRevenue,
        growth: trend.percentage,
        trend: trend.trend
      },
      customers: {
        total: metrics.totalCustomers,
        averageOrderValue: metrics.averageOrderValue,
        peakDay: customerAnalysis.peakDay
      },
      payment: {
        cashPercentage: paymentAnalysis.cash.percentage,
        cardPercentage: paymentAnalysis.card.percentage,
        creditPercentage: paymentAnalysis.credit.percentage
      },
      performance: {
        topCompany: metrics.companyPerformance[0],
        marketDiversification: metrics.companyPerformance.length
      }
    }
  }
}
















