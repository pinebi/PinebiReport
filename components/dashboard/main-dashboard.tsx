'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from './dashboard-header'
import { KPICards } from './kpi-cards'
import { PaymentDistributionChart } from './payment-distribution-chart'
import { DailySalesChart } from './daily-sales-chart'
import { TopCustomers } from './top-customers'
import { DailyGrid } from './daily-grid'
import { useAuth } from '@/contexts/AuthContext'

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
  }[]
  topCustomers: {
    name: string
    amount: number
    rank: number
  }[]
  dailyGrid: any[]
}

function MainDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 1) // Default to yesterday
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Determine API configuration based on user's company
      let apiConfig = {
        apiUrl: "http://api.pinebi.com:8191/REST.PROXY",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic UElORUJJOnE4MXltQWJ0eDFqSjhob2M4SVBVNzlMalBlbXVYam9rMk5YWVJUYTUx",
          "url": "http://31.145.34.232:8190/REST.CIRO.RAPOR"
        },
        uriString: "REST.CIRO.RAPOR.TARIH.URUNDETAYLI"
      }

      // Check if user belongs to Belpaş company
      if (user?.companyId === 'cmfzrh8c6000010jtu3bun80y') {
        console.log('🏢 Belpaş kullanıcısı - Satış Raporu Belpas API kullanılıyor')
        apiConfig = {
          apiUrl: "http://api.pinebi.com:8191/REST.PROXY",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic UElORUJJOnE4MXltQWJ0eDFqSjhob2M4SVBVNzlMalBlbXVYam9rMk5YWVJUYTUx", // PINEBI:q81ymAbtx1jJ8hoc8IPU79LjPemuXjok2NXYRTa51
            "url": "http://78.189.91.186:8190/REST.CIRO.RAPOR"
          },
          uriString: "REST.CIRO.RAPOR"
        }
      } else {
        console.log('🏢 RMK kullanıcısı - RMK API kullanılıyor')
      }

      // API call to get dashboard data
      const response = await fetch('/api/reports/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiUrl: apiConfig.apiUrl,
          headers: apiConfig.headers,
          method: "POST",
          body: {
            "USER": {
              "ID": "df51ad80-ef0b-4cc8-a941-be7a6ca638d9"
            },
            "START_DATE": startDate,
            "END_DATE": endDate,
            "uriString": apiConfig.uriString
          }
        })
      })

      const result = await response.json()
      
      if (result.success && result.data?.DATAS) {
        const rawData = result.data.DATAS
        
        // Process data for dashboard components
        const processedData = processDashboardData(rawData)
        setData(processedData)
      } else {
        // Set default/mock data if API fails
        setData(getDefaultDashboardData())
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default/mock data on error
      setData(getDefaultDashboardData())
    } finally {
      setLoading(false)
    }
  }

  const processDashboardData = (rawData: any[]): DashboardData => {
    // Calculate KPI totals
    const totals = rawData.reduce((acc, item) => ({
      nakit: acc.nakit + (item.NAKIT || 0),
      krediKarti: acc.krediKarti + (item.KREDI_KARTI || 0),
      nakitKrediKarti: acc.nakitKrediKarti + (item['NAKIT+KREDI_KARTI'] || 0),
      acikHesap: acc.acikHesap + (item.ACIK_HESAP || 0),
      genelToplam: acc.genelToplam + (item.GENEL_TOPLAM || 0)
    }), { nakit: 0, krediKarti: 0, nakitKrediKarti: 0, acikHesap: 0, genelToplam: 0 })

    // KPI Data
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

    // Daily Sales Chart Data
    const dailySales = rawData.map(item => ({
      date: item.Tarih,
      amount: item.GENEL_TOPLAM || 0,
      formattedDate: new Date(item.Tarih).toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }))

    // Top Customers (using Firma as customer for now)
    const customerTotals = rawData.reduce((acc: any, item) => {
      const firma = item.Firma || 'Bilinmeyen'
      acc[firma] = (acc[firma] || 0) + (item.GENEL_TOPLAM || 0)
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

    return {
      kpiData,
      paymentDistribution,
      dailySales,
      topCustomers,
      dailyGrid: rawData
    }
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
    ]
  })

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  const handleUpdate = () => {
    fetchDashboardData()
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, startDate, endDate])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Genel Rapor Özeti"
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onUpdate={handleUpdate}
      />

      <KPICards data={data.kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PaymentDistributionChart data={data.paymentDistribution} />
        </div>
        
        <div className="lg:col-span-1">
          <DailySalesChart data={data.dailySales} />
        </div>
        
        <div className="lg:col-span-1">
          <TopCustomers data={data.topCustomers} />
        </div>
      </div>

      <DailyGrid data={data.dailyGrid} />
    </div>
  )
}

export default MainDashboard
