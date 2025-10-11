'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  CreditCard,
  Banknote,
  Activity,
  Target,
  PieChart,
  LineChart,
  RefreshCw,
  Play,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { SalesAnalytics, SalesData } from '@/lib/analytics/sales-analytics'
import { KPIDashboard, TrendAnalysisWidget, PaymentMethodsWidget, CompanyPerformanceWidget } from '@/components/dashboard/advanced-widgets'

// Mock satış verileri (terminal çıktısından alınan gerçek veriler)
const mockSalesData: SalesData[] = [
  {
    Tarih: "2025-10-02T00:00:00",
    Firma: "Rahmi M.Koç Ayvalık",
    Musteri_Sayisi: 16,
    NAKIT: 980.0,
    KREDI_KARTI: 2800.0,
    ACIK_HESAP: 0.0,
    "NAKIT+KREDI_KARTI": 3780.0,
    GENEL_TOPLAM: 3780.0
  },
  {
    Tarih: "2025-10-03T00:00:00",
    Firma: "Rahmi M.Koç Ayvalık",
    Musteri_Sayisi: 8,
    NAKIT: 1140.0,
    KREDI_KARTI: 2735.0,
    ACIK_HESAP: 0.0,
    "NAKIT+KREDI_KARTI": 3875.0,
    GENEL_TOPLAM: 3875.0
  },
  {
    Tarih: "2025-10-03T00:00:00",
    Firma: "Rahmi M.Koç Cunda",
    Musteri_Sayisi: 2,
    NAKIT: 90.0,
    KREDI_KARTI: 240.0,
    ACIK_HESAP: 0.0,
    "NAKIT+KREDI_KARTI": 330.0,
    GENEL_TOPLAM: 330.0
  },
  {
    Tarih: "2025-10-02T00:00:00",
    Firma: "Rahmi M.Koç Cunda",
    Musteri_Sayisi: 11,
    NAKIT: 640.0,
    KREDI_KARTI: 755.0,
    ACIK_HESAP: 0.0,
    "NAKIT+KREDI_KARTI": 1395.0,
    GENEL_TOPLAM: 1395.0
  },
  {
    Tarih: "2025-10-02T00:00:00",
    Firma: "Rahmi M.Koç Kitaplık",
    Musteri_Sayisi: 47,
    NAKIT: 2090.0,
    KREDI_KARTI: 11230.0,
    ACIK_HESAP: 0.0,
    "NAKIT+KREDI_KARTI": 13320.0,
    GENEL_TOPLAM: 13320.0
  },
  {
    Tarih: "2025-10-02T00:00:00",
    Firma: "Rahmi M.Koç Müzesi",
    Musteri_Sayisi: 78,
    NAKIT: 32652.0,
    KREDI_KARTI: 58030.0,
    ACIK_HESAP: 7700.0,
    "NAKIT+KREDI_KARTI": 90682.0,
    GENEL_TOPLAM: 98382.0
  },
  {
    Tarih: "2025-10-03T00:00:00",
    Firma: "Rahmi M.Koç Müzesi",
    Musteri_Sayisi: 155,
    NAKIT: 44886.0,
    KREDI_KARTI: 79110.0,
    ACIK_HESAP: 11300.0,
    "NAKIT+KREDI_KARTI": 123996.0,
    GENEL_TOPLAM: 135296.0
  }
]

export default function AnalyticsTestPage() {
  const { success, error } = useToast()
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null)
  const [analyticsResults, setAnalyticsResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    const analytics = new SalesAnalytics(mockSalesData)
    setSalesAnalytics(analytics)
  }, [])

  const runAnalyticsTests = async () => {
    if (!salesAnalytics) return

    setIsRunning(true)
    
    try {
      // Temel metrikleri hesapla
      const metrics = salesAnalytics.calculateMetrics()
      
      // Trend analizi
      const trendAnalysis = salesAnalytics.analyzeTrend('daily')
      
      // Ödeme yöntemi analizi
      const paymentAnalysis = salesAnalytics.analyzePaymentMethods()
      
      // Müşteri analizi
      const customerAnalysis = salesAnalytics.analyzeCustomers()
      
      // KPI hesaplama
      const kpis = salesAnalytics.calculateKPIs()

      const results = {
        metrics,
        trendAnalysis,
        paymentAnalysis,
        customerAnalysis,
        kpis
      }

      setAnalyticsResults(results)
      
      success('Analytics Test Başarılı!', `Toplam ciro: ₺${metrics.totalRevenue.toLocaleString()}, Trend: ${trendAnalysis.trend}`)
      
    } catch (err) {
      error('Analytics Test Hatası', String(err))
    } finally {
      setIsRunning(false)
    }
  }

  const testIndividualAnalytics = (testName: string, testFn: () => void) => {
    try {
      testFn()
      success(`${testName} Testi`, 'Başarıyla tamamlandı!')
    } catch (err) {
      error(`${testName} Testi`, String(err))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Analytics Test Merkezi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Satış analizi ve veri işleme özelliklerini test edin
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={runAnalyticsTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Çalışıyor...' : 'Tümünü Test Et'}
          </Button>
        </div>
      </div>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Analytics Test Butonları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => testIndividualAnalytics('Metrics', () => {
                if (!salesAnalytics) throw new Error('Analytics başlatılamadı')
                const metrics = salesAnalytics.calculateMetrics()
                console.log('Metrics:', metrics)
              })}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Metrics</span>
            </Button>
            
            <Button
              onClick={() => testIndividualAnalytics('Trend Analysis', () => {
                if (!salesAnalytics) throw new Error('Analytics başlatılamadı')
                const trend = salesAnalytics.analyzeTrend('daily')
                console.log('Trend Analysis:', trend)
              })}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Trend</span>
            </Button>
            
            <Button
              onClick={() => testIndividualAnalytics('Payment Analysis', () => {
                if (!salesAnalytics) throw new Error('Analytics başlatılamadı')
                const payment = salesAnalytics.analyzePaymentMethods()
                console.log('Payment Analysis:', payment)
              })}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">Payment</span>
            </Button>
            
            <Button
              onClick={() => testIndividualAnalytics('Customer Analysis', () => {
                if (!salesAnalytics) throw new Error('Analytics başlatılamadı')
                const customer = salesAnalytics.analyzeCustomers()
                console.log('Customer Analysis:', customer)
              })}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Customer</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Results */}
      {analyticsResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Analytics Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ₺{analyticsResults.metrics.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Ciro</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsResults.metrics.totalCustomers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Müşteri</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ₺{analyticsResults.metrics.averageOrderValue.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ort. Sipariş</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {analyticsResults.trendAnalysis.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Büyüme</div>
              </div>
            </div>

            {/* Trend Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Trend Analizi</h3>
                <div className="flex items-center gap-2 mb-2">
                  {analyticsResults.trendAnalysis.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : analyticsResults.trendAnalysis.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-600" />
                  )}
                  <span className="capitalize">{analyticsResults.trendAnalysis.trend}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {analyticsResults.trendAnalysis.forecast.length} günlük tahmin mevcut
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Ödeme Dağılımı</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nakit:</span>
                    <span>{analyticsResults.paymentAnalysis.cash.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kart:</span>
                    <span>{analyticsResults.paymentAnalysis.card.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Açık Hesap:</span>
                    <span>{analyticsResults.paymentAnalysis.credit.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Dashboard Widgets */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Canlı Dashboard Widget'ları
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KPIDashboard data={mockSalesData} title="KPI Dashboard" />
          <TrendAnalysisWidget data={mockSalesData} title="Trend Analysis" />
          <PaymentMethodsWidget data={mockSalesData} title="Payment Methods" />
          <CompanyPerformanceWidget data={mockSalesData} title="Company Performance" />
        </div>
      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Test Veri Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockSalesData.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Toplam Kayıt
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(mockSalesData.map(d => d.Firma)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Farklı Firma
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(mockSalesData.map(d => d.Tarih.split('T')[0])).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Gün Sayısı
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
















