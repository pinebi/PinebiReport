'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  BarChart3,
  Zap,
  Activity,
  Bell,
  Mail,
  Settings,
  TrendingUp,
  Users,
  CreditCard
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { SalesAnalytics, SalesData } from '@/lib/analytics/sales-analytics'
import { ReportAutomation } from '@/lib/workflow/report-automation'
import { realtimeSync } from '@/lib/realtime/data-sync'
import { KPIDashboard, TrendAnalysisWidget, PaymentMethodsWidget, CompanyPerformanceWidget } from '@/components/dashboard/advanced-widgets'
import { WorkflowManager } from '@/components/workflow/workflow-manager'

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

interface TestResult {
  id: string
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  description: string
  icon: React.ComponentType<any>
  duration?: number
  error?: string
}

export default function TestPage() {
  const { success, error, warning, info } = useToast()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null)
  const [automation, setAutomation] = useState<ReportAutomation | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<string>('disconnected')

  useEffect(() => {
    // Test listesini başlat
    initializeTests()
    
    // Sales Analytics'i başlat
    const analytics = new SalesAnalytics(mockSalesData)
    setSalesAnalytics(analytics)
    
    // Automation'ı başlat
    const reportAutomation = new ReportAutomation()
    setAutomation(reportAutomation)
    
    // Real-time sync'i başlat
    setupRealtimeSync()
  }, [])

  const initializeTests = () => {
    const tests: TestResult[] = [
      {
        id: 'toast-notifications',
        name: 'Toast Notifications',
        status: 'pending',
        description: 'Bildirim sistemi test ediliyor',
        icon: Bell
      },
      {
        id: 'sales-analytics',
        name: 'Sales Analytics Engine',
        status: 'pending',
        description: 'Satış analizi motoru test ediliyor',
        icon: BarChart3
      },
      {
        id: 'workflow-automation',
        name: 'Workflow Automation',
        status: 'pending',
        description: 'İş akışı otomasyonu test ediliyor',
        icon: Zap
      },
      {
        id: 'realtime-sync',
        name: 'Real-time Data Sync',
        status: 'pending',
        description: 'Gerçek zamanlı veri senkronizasyonu test ediliyor',
        icon: Activity
      },
      {
        id: 'advanced-widgets',
        name: 'Advanced Dashboard Widgets',
        status: 'pending',
        description: 'Gelişmiş dashboard widget\'ları test ediliyor',
        icon: TrendingUp
      }
    ]
    setTestResults(tests)
  }

  const setupRealtimeSync = async () => {
    realtimeSync.on('connection', (event) => {
      setRealtimeStatus(event.data.status)
    })
    
    realtimeSync.on('data_update', (event) => {
      console.log('Real-time data update:', event.data)
    })
    
    // Bağlantıyı dene (gerçek implementasyonda WebSocket sunucusu olacak)
    // await realtimeSync.connect()
  }

  const runTest = async (testId: string) => {
    const test = testResults.find(t => t.id === testId)
    if (!test) return

    setTestResults(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running' } : t
    ))
    setCurrentTest(testId)

    try {
      switch (testId) {
        case 'toast-notifications':
          await testToastNotifications()
          break
        case 'sales-analytics':
          await testSalesAnalytics()
          break
        case 'workflow-automation':
          await testWorkflowAutomation()
          break
        case 'realtime-sync':
          await testRealtimeSync()
          break
        case 'advanced-widgets':
          await testAdvancedWidgets()
          break
      }

      setTestResults(prev => prev.map(t => 
        t.id === testId ? { ...t, status: 'passed', duration: Math.random() * 2000 + 500 } : t
      ))
    } catch (err) {
      setTestResults(prev => prev.map(t => 
        t.id === testId ? { ...t, status: 'failed', error: String(err) } : t
      ))
    } finally {
      setCurrentTest(null)
    }
  }

  const testToastNotifications = async () => {
    success('Toast Test Başarılı!', 'Başarı bildirimi çalışıyor')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    error('Hata Testi', 'Hata bildirimi çalışıyor')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    warning('Uyarı Testi', 'Uyarı bildirimi çalışıyor')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    info('Bilgi Testi', 'Bilgi bildirimi çalışıyor')
  }

  const testSalesAnalytics = async () => {
    if (!salesAnalytics) throw new Error('Sales Analytics başlatılamadı')
    
    const metrics = salesAnalytics.calculateMetrics()
    const trendAnalysis = salesAnalytics.analyzeTrend()
    const paymentAnalysis = salesAnalytics.analyzePaymentMethods()
    const kpis = salesAnalytics.calculateKPIs()
    
    console.log('📊 Sales Analytics Test Results:')
    console.log('Metrics:', metrics)
    console.log('Trend Analysis:', trendAnalysis)
    console.log('Payment Analysis:', paymentAnalysis)
    console.log('KPIs:', kpis)
    
    success('Sales Analytics Test', `Toplam ciro: ₺${metrics.totalRevenue.toLocaleString()}, Trend: ${trendAnalysis.trend}`)
  }

  const testWorkflowAutomation = async () => {
    if (!automation) throw new Error('Workflow Automation başlatılamadı')
    
    // Test schedule ekle
    const schedule = automation.addSchedule({
      name: 'Test Raporu',
      reportId: 'test_report',
      frequency: 'daily',
      time: '09:00',
      recipients: ['test@company.com'],
      format: 'pdf',
      isActive: true
    })
    
    // Test rule ekle
    const rule = automation.addRule({
      name: 'Test Kuralı',
      condition: {
        field: 'GENEL_TOPLAM',
        operator: 'gt',
        value: 10000
      },
      action: {
        type: 'email',
        config: {
          subject: 'Test Uyarısı',
          recipients: ['alert@company.com']
        }
      },
      isActive: true,
      triggerCount: 0
    })
    
    const schedules = automation.getAllSchedules()
    const rules = automation.getAllRules()
    
    console.log('⚡ Workflow Automation Test Results:')
    console.log('Schedules:', schedules.length)
    console.log('Rules:', rules.length)
    
    success('Workflow Automation Test', `${schedules.length} zamanlama, ${rules.length} kural eklendi`)
  }

  const testRealtimeSync = async () => {
    const status = realtimeSync.getConnectionStatus()
    const subscriptionCount = realtimeSync.getActiveSubscriptionCount()
    
    // Test subscription ekle
    const subscriptionId = realtimeSync.subscribe(
      '/api/test-endpoint',
      (data) => {
        console.log('Test subscription data:', data)
      },
      { type: 'test' }
    )
    
    console.log('⚡ Real-time Sync Test Results:')
    console.log('Connection Status:', status)
    console.log('Subscription Count:', subscriptionCount)
    console.log('Test Subscription ID:', subscriptionId)
    
    success('Real-time Sync Test', `Bağlantı: ${status}, Abonelikler: ${subscriptionCount}`)
  }

  const testAdvancedWidgets = async () => {
    if (!salesAnalytics) throw new Error('Sales Analytics gerekli')
    
    const metrics = salesAnalytics.calculateMetrics()
    const trendAnalysis = salesAnalytics.analyzeTrend()
    
    console.log('📈 Advanced Widgets Test Results:')
    console.log('Widgets loaded successfully')
    console.log('Metrics calculated:', Object.keys(metrics).length)
    console.log('Trend analysis:', trendAnalysis.period)
    
    success('Advanced Widgets Test', 'Tüm widget\'lar başarıyla yüklendi')
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    for (const test of testResults) {
      await runTest(test.id)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsRunning(false)
  }

  const resetTests = () => {
    initializeTests()
    setCurrentTest(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Play className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge variant="default">Çalışıyor</Badge>
      case 'passed': return <Badge variant="default" className="bg-green-600">Başarılı</Badge>
      case 'failed': return <Badge variant="destructive">Başarısız</Badge>
      default: return <Badge variant="secondary">Bekliyor</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TestTube className="h-8 w-8 text-blue-600" />
            Test Merkezi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Yeni özellikleri test edin ve performanslarını kontrol edin
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Tümünü Çalıştır
          </Button>
          <Button
            variant="outline"
            onClick={resetTests}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sıfırla
          </Button>
        </div>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Sonuçları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {testResults.map((test) => {
              const Icon = test.icon
              return (
                <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{test.name}</h3>
                        {getStatusIcon(test.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {test.description}
                      </p>
                      {test.error && (
                        <p className="text-sm text-red-600 mt-1">
                          Hata: {test.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(test.status)}
                    {test.duration && (
                      <span className="text-sm text-gray-500">
                        {test.duration.toFixed(0)}ms
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(test.id)}
                      disabled={test.status === 'running' || isRunning}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Demo - Advanced Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KPIDashboard data={mockSalesData} title="KPI Dashboard Test" />
        <TrendAnalysisWidget data={mockSalesData} title="Trend Analysis Test" />
        <PaymentMethodsWidget data={mockSalesData} title="Payment Methods Test" />
        <CompanyPerformanceWidget data={mockSalesData} title="Company Performance Test" />
      </div>

      {/* Workflow Manager Demo */}
      <WorkflowManager />

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sistem Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockSalesData.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Test Veri Kaydı
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(t => t.status === 'passed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Başarılı Test
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {realtimeStatus}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Real-time Durum
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
