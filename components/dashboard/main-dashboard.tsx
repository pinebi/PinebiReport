'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from './dashboard-header'
import { KPICards } from './kpi-cards'
import { PaymentDistributionChart } from './payment-distribution-chart'
import { DailySalesChart } from './daily-sales-chart'
import { TopCustomers } from './top-customers'
import { DailyGrid } from './daily-grid'
import { CompanyPerformanceWidget } from './company-performance-widget'
import DailyTrendsChart from './daily-trends-chart'
import MonthlyComparisonChart from './monthly-comparison-chart'
import { AverageCustomerRevenue } from './average-customer-revenue'
import PinebiLoader from '@/components/ui/pinebi-loader'
import { useAuth } from '@/contexts/AuthContext'
import { useTouchGestures } from '@/hooks/use-touch-gestures'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { AnimatedCard } from '@/components/ui/animated-card'
import { StaggeredList } from '@/components/ui/staggered-list'
import { HoverScale } from '@/components/ui/hover-scale'
import { usePerformance } from '@/hooks/use-performance'
import { OptimizedImage } from '@/components/ui/optimized-image'

interface DashboardData {
  kpiData: {
    toplamCiro: number
    nakit: number
    krediKarti: number
    nakitKrediKarti: number
    acikHesap: number
  }
  paymentDistribution: {
    name: string
    value: number
    color: string
  }[]
  dailySales: {
    date: string
    amount: number
    formattedDate: string
    dayOfWeek?: string
  }[]
  topCustomers: {
    name: string
    amount: number
    rank: number
  }[]
  companyPerformance: {
    company: string
    revenue: number
    customers: number
    marketShare: number
  }[]
  dailyGrid: any[]
  monthlyComparison?: {
    month: string
    currentYear: number
    previousYear: number
    growth: number
    formattedMonth: string
  }[]
  customerRevenueData?: {
    company: string
    totalRevenue: number
    totalCustomers: number
    averageRevenue: number
    change?: number
    trend?: 'up' | 'down' | 'stable'
  }[]
}

function MainDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiveData, setIsLiveData] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 1) // Default to yesterday
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Performance optimization
  const { 
    getCachedData, 
    setCachedData, 
    useLazyLoad,
    metrics: performanceMetrics 
  } = usePerformance({
    enableMetrics: true,
    logLevel: 'info',
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    compressionEnabled: true,
    lazyLoading: true
  })

  // Touch gestures for mobile
  const { isTouchDevice } = useTouchGestures({
    onSwipeLeft: () => {
      // Swipe left - show next date range
      const newStartDate = new Date(endDate)
      const newEndDate = new Date(newStartDate)
      newEndDate.setDate(newEndDate.getDate() + 30)
      handleDateChange(newStartDate.toISOString().split('T')[0], newEndDate.toISOString().split('T')[0])
    },
    onSwipeRight: () => {
      // Swipe right - show previous date range
      const newEndDate = new Date(startDate)
      const newStartDate = new Date(newEndDate)
      newStartDate.setDate(newStartDate.getDate() - 30)
      handleDateChange(newStartDate.toISOString().split('T')[0], newEndDate.toISOString().split('T')[0])
    },
    onSwipeUp: () => {
      // Swipe up - refresh data
      handleUpdate()
    },
    onDoubleTap: () => {
      // Double tap - toggle live data
      setIsLiveData(!isLiveData)
    }
  }, {
    swipeThreshold: 80,
    preventDefault: false
  })

  const processDashboardData = (rawData: any[]): DashboardData => {
    console.log('🔍 processDashboardData called with:', rawData)
    console.log('🔍 rawData length:', rawData.length)
    
    // Calculate KPI totals (Pinebi API formatına uygun)
    const totals = rawData.reduce((acc, item) => {
      console.log('🔍 Processing item:', item)
      const nakit = item['NAKIT'] || 0
      const krediKarti = item['KREDI_KARTI'] || 0
      const nakitKrediKarti = item['NAKIT+KREDI_KARTI'] || 0
      const acikHesap = item['ACIK_HESAP'] || 0
      const genelToplam = item['GENEL_TOPLAM'] || 0
      
      console.log('🔍 Values:', { nakit, krediKarti, nakitKrediKarti, acikHesap, genelToplam })
      
      return {
        nakit: acc.nakit + nakit,
        krediKarti: acc.krediKarti + krediKarti,
        nakitKrediKarti: acc.nakitKrediKarti + nakitKrediKarti,
        acikHesap: acc.acikHesap + acikHesap,
        genelToplam: acc.genelToplam + genelToplam
      }
    }, { nakit: 0, krediKarti: 0, nakitKrediKarti: 0, acikHesap: 0, genelToplam: 0 })
    
    console.log('🔍 Final totals:', totals)

    // KPI Data - Doğru format (KPICards component'i için)
    const kpiData = {
      toplamCiro: totals.genelToplam,
      nakit: totals.nakit,
      krediKarti: totals.krediKarti,
      nakitKrediKarti: totals.nakitKrediKarti,
      acikHesap: totals.acikHesap
    }

    // Payment Distribution
    const paymentDistribution = [
      { name: 'Nakit', value: totals.nakit, color: '#10b981' },
      { name: 'Kredi Kartı', value: totals.krediKarti, color: '#6b7280' },
      { name: 'Açık Hesap', value: totals.acikHesap, color: '#ef4444' }
    ].filter(item => item.value > 0)

    // Daily Sales Chart Data (Pinebi API formatına uygun)
    const dailySales = rawData.map(item => ({
      date: item['Tarih'],
      amount: item['GENEL_TOPLAM'] || 0,
      formattedDate: new Date(item['Tarih']).toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }))

    // Top Customers (using Firma as customer for now - Pinebi API formatına uygun)
    const customerTotals = rawData.reduce((acc: any, item) => {
      const firma = item['Firma'] || 'Bilinmeyen'
      acc[firma] = (acc[firma] || 0) + (item['GENEL_TOPLAM'] || 0)
      return acc
    }, {})

    const topCustomers = Object.entries(customerTotals)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 10)
      .map(([name, amount]: any, index) => ({
        name,
        amount,
        rank: index + 1
      }))

    // Company Performance Data (Pinebi API formatına uygun)
    const companyData = rawData.reduce((acc: any, item) => {
      const firma = item['Firma'] || 'Bilinmeyen'
      if (!acc[firma]) {
        acc[firma] = { revenue: 0, customers: 0 }
      }
      acc[firma].revenue += item['GENEL_TOPLAM'] || 0
      acc[firma].customers += item['Musteri Sayisi'] || 0
      return acc
    }, {})

    const companyPerformance = Object.entries(companyData)
      .map(([company, data]: any) => ({
        company,
        revenue: data.revenue,
        customers: data.customers,
        marketShare: totals.genelToplam > 0 ? (data.revenue / totals.genelToplam) * 100 : 0
      }))
      .sort((a, b) => b.marketShare - a.marketShare)

    return {
      kpiData,
      paymentDistribution,
      dailySales,
      topCustomers,
      companyPerformance,
      dailyGrid: rawData
    }
  }

  const fetchDashboardDataWithDates = async (start: string, end: string) => {
    setLoading(true)

    try {
      console.log('🚀 Loading dashboard data from API with dates:', { start, end })

      const requestBody = {
        startDate: start,
        endDate: end,
        firma: user?.company?.name || 'RMK',
        userCompany: user?.company?.name || 'RMK' // Kullanıcının şirket adını ayrı olarak gönder
      }
      
      console.log('📅 Request body:', requestBody)

      // Get auth token from localStorage
      const token = localStorage.getItem('token')
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {}
      
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ API response received:', result)

      if (result.success && result.data) {
        console.log('🔍 API result received:', result)
        console.log('🔍 API already processed data:', result.data)
        console.log('🔍 KPI Data from API:', result.data.kpiData)
        
        // API'de zaten veriler işlenmiş, direkt kullan
        setData(result.data)
        setIsLiveData(!result.isMock)
        setLastUpdate(new Date())
        console.log('✅ Real data loaded successfully')
        if (result.isMock) {
          console.log('⚠️ Using mock data due to API error')
        } else {
          console.log('🎉 Live data from Pinebi API!')
        }
      } else {
        throw new Error('Invalid API response')
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      console.log('🔄 Falling back to mock data')
      const mockData = getDefaultDashboardData()
      setData(mockData)
    } finally {
      setLoading(false)
    }
  }

  // Simple dashboard data fetching without offline complications

  const fetchDashboardData = async () => {
    // Mevcut state'teki startDate ve endDate'i kullanarak çağır
    fetchDashboardDataWithDates(startDate, endDate)
  }

  const getDefaultDashboardData = (): DashboardData => ({
    kpiData: {
      toplamCiro: 202488.00,
      nakit: 46133.00,
      krediKarti: 134835.00,
      nakitKrediKarti: 180968.00,
      acikHesap: 21700.00
    },
    paymentDistribution: [
      { name: 'Nakit', value: 46133, color: '#10b981' },
      { name: 'Kredi Kartı', value: 134835, color: '#6b7280' },
      { name: 'Açık Hesap', value: 21700, color: '#ef4444' }
    ],
    dailySales: [
      { date: '2025-09-18', amount: 100000, formattedDate: '18.09' },
      { date: '2025-09-19', amount: 102488, formattedDate: '19.09' }
    ],
    topCustomers: [
      { name: 'Rahmi M.Koç Müzesi', amount: 140000, rank: 1 },
      { name: 'Rahmi M.Koç Ayvalık', amount: 62488, rank: 2 }
    ],
    companyPerformance: [
      {
        company: "Rahmi M.Koç Müzesi",
        revenue: 233678,
        customers: 233,
        marketShare: 91.1
      },
      {
        company: "Rahmi M.Koç Kitaplık", 
        revenue: 13320,
        customers: 47,
        marketShare: 5.2
      },
      {
        company: "Rahmi M.Koç Ayvalık",
        revenue: 7655,
        customers: 24,
        marketShare: 3.0
      },
      {
        company: "Rahmi M.Koç Cunda",
        revenue: 1725,
        customers: 13,
        marketShare: 0.7
      }
    ],
    dailyGrid: [
      {
        Tarih: '2025-09-18T00:00:00',
        Firma: 'Rahmi M.Koç Ayvalık',
        'Musteri Sayisi': 35,
        NAKIT: 2080.0,
        KREDI_KARTI: 17970.0,
        ACIK_HESAP: 0.0,
        'NAKIT+KREDI_KARTI': 20050.0,
        GENEL_TOPLAM: 20050.0
      },
      {
        Tarih: '2025-09-19T00:00:00',
        Firma: 'Rahmi M.Koç Ayvalık',
        'Musteri Sayisi': 40,
        NAKIT: 1285.0,
        KREDI_KARTI: 20315.0,
        ACIK_HESAP: 0.0,
        'NAKIT+KREDI_KARTI': 21600.0,
        GENEL_TOPLAM: 21600.0
      }
    ],
    monthlyComparison: [
      { month: 'Ocak', currentYear: 195000, previousYear: 175000, growth: 11.4, formattedMonth: 'Oca' },
      { month: 'Şubat', currentYear: 182000, previousYear: 168000, growth: 8.3, formattedMonth: 'Şub' },
      { month: 'Mart', currentYear: 208000, previousYear: 185000, growth: 12.4, formattedMonth: 'Mar' },
      { month: 'Nisan', currentYear: 225000, previousYear: 199000, growth: 13.1, formattedMonth: 'Nis' },
      { month: 'Mayıs', currentYear: 213000, previousYear: 192000, growth: 10.9, formattedMonth: 'May' },
      { month: 'Haziran', currentYear: 199000, previousYear: 181000, growth: 9.9, formattedMonth: 'Haz' },
      { month: 'Temmuz', currentYear: 235000, previousYear: 208000, growth: 13.0, formattedMonth: 'Tem' },
      { month: 'Ağustos', currentYear: 244000, previousYear: 215000, growth: 13.5, formattedMonth: 'Ağu' },
      { month: 'Eylül', currentYear: 257000, previousYear: 228000, growth: 12.7, formattedMonth: 'Eyl' },
      { month: 'Ekim', currentYear: 249000, previousYear: 222000, growth: 12.2, formattedMonth: 'Eki' }
    ]
  })

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    // Tarih değiştiğinde otomatik olarak veri güncelle
    fetchDashboardDataWithDates(newStartDate, newEndDate)
  }

  const handleUpdate = () => {
    fetchDashboardData()
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user]) // user değiştiğinde veya component mount edildiğinde bir kez çağır

  if (loading || !data) {
    return (
            <PinebiLoader 
              size="large" 
              text="Dashboard verileri yükleniyor..." 
              fullScreen={false}
              variant="modern"
            />
    )
  }

  return (
    <PullToRefresh onRefresh={handleUpdate}>
      <div className="flex flex-col h-full">
      <DashboardHeader
          title="Genel Bakış"
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onUpdate={handleUpdate}
        isLiveData={isLiveData}
        lastUpdate={lastUpdate}
      />

      <AnimatedCard delay={0}>
        <KPICards data={data?.kpiData} loading={loading} />
      </AnimatedCard>
        
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <AnimatedCard delay={100}>
          <HoverScale scale={1.02}>
            <PaymentDistributionChart data={data.paymentDistribution} />
          </HoverScale>
        </AnimatedCard>
        <AnimatedCard delay={200}>
          <HoverScale scale={1.02}>
          <DailySalesChart data={data.dailySales} />
          </HoverScale>
        </AnimatedCard>
        <AnimatedCard delay={250}>
          <HoverScale scale={1.02}>
            <AverageCustomerRevenue data={data.customerRevenueData || []} />
          </HoverScale>
        </AnimatedCard>
      </div>

      {/* Firma Performansı ve Ürün Satışı Top 30 yan yana */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AnimatedCard delay={300}>
          <CompanyPerformanceWidget 
            title="Firma Performansı"
            data={data.companyPerformance}
          />
        </AnimatedCard>
        <AnimatedCard delay={400}>
          <HoverScale scale={1.02}>
          <TopCustomers data={data.topCustomers} limit={30} />
          </HoverScale>
        </AnimatedCard>
      </div>
        
      <AnimatedCard delay={500}>
        <div className="flex-grow">
      <DailyGrid data={data.dailyGrid} />
        </div>
      </AnimatedCard>

      {/* Yeni Grafikler - Dashboard'ın En Altı */}
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard delay={600}>
            <HoverScale scale={1.02}>
              <DailyTrendsChart 
                data={data.dailySales} 
                title="Günlük Satış Trendleri" 
              />
            </HoverScale>
          </AnimatedCard>
          <AnimatedCard delay={700}>
            <HoverScale scale={1.02}>
              <MonthlyComparisonChart 
                data={data.monthlyComparison || []} 
                title="Aylık Karşılaştırma" 
              />
            </HoverScale>
          </AnimatedCard>
        </div>
      </div>
    </div>
    </PullToRefresh>
  )
}

export default MainDashboard