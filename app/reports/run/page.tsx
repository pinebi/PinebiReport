'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'
import PivotView from '@/components/shared/pivot-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Search, 
  Play, 
  Download, 
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { ReportConfig, ReportCategory } from '@/types'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'

interface ReportExecution {
  id: string
  reportId: string
  report: ReportConfig
  status: 'running' | 'completed' | 'failed' | 'scheduled'
  startTime: Date
  endTime?: Date
  duration?: number
  recordCount?: number
  errorMessage?: string
  resultData?: any[]
  parameters: Record<string, any>
}

export default function RunReportsPage() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId')
  
  const [reports, setReports] = useState<ReportConfig[]>([])
  const [categories, setCategories] = useState<ReportCategory[]>([])
  const [executions, setExecutions] = useState<ReportExecution[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null)
  const [showParameters, setShowParameters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [reportResults, setReportResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [resultsView, setResultsView] = useState<'grid' | 'pivot'>('grid')

  // Auto-select report if reportId is provided
  useEffect(() => {
    if (reportId && reports.length > 0) {
      const report = reports.find(r => r.id === reportId)
      if (report) {
        setSelectedReport(report)
        setShowParameters(true)
      }
    }
  }, [reportId, reports])

  // Mock data
  useEffect(() => {
    const mockCategories: ReportCategory[] = [
      {
        id: '1',
        name: 'Satış Raporları',
        description: 'Satış performansı ve analiz raporları',
        icon: '📊',
        color: '#3B82F6',
        sortOrder: 1,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Finansal Raporlar',
        description: 'Muhasebe ve finansal analiz raporları',
        icon: '💰',
        color: '#8B5CF6',
        sortOrder: 2,
        isActive: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ]

    const mockReports: ReportConfig[] = [
      {
        id: '1',
        name: 'Aylık Satış Raporu',
        description: 'Aylık satış performans analizi',
        endpointUrl: 'https://api.erp.com/reports/monthly-sales',
        apiUsername: 'report_user',
        apiPassword: 'secure_pass',
        headers: { 'Content-Type': 'application/json' },
        categoryId: '1',
        category: mockCategories[0],
        companyId: '1',
        userId: '1',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Günlük Satış Detayı',
        description: 'Günlük satış detay raporu',
        endpointUrl: 'https://api.erp.com/reports/daily-sales',
        apiUsername: 'report_user',
        apiPassword: 'secure_pass',
        headers: { 'Content-Type': 'application/json' },
        categoryId: '1',
        category: mockCategories[0],
        companyId: '1',
        userId: '1',
        isActive: true,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      },
      {
        id: '3',
        name: 'Gelir-Gider Analizi',
        description: 'Aylık gelir-gider karşılaştırma raporu',
        endpointUrl: 'https://api.erp.com/reports/income-expense',
        apiUsername: 'finance_user',
        apiPassword: 'finance_pass',
        headers: { 'Content-Type': 'application/json' },
        categoryId: '2',
        category: mockCategories[1],
        companyId: '1',
        userId: '1',
        isActive: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ]

    const mockExecutions: ReportExecution[] = [
      {
        id: '1',
        reportId: '1',
        report: mockReports[0],
        status: 'completed',
        startTime: new Date('2024-03-15T10:30:00'),
        endTime: new Date('2024-03-15T10:32:15'),
        duration: 135000,
        recordCount: 1250,
        parameters: { startDate: '2024-02-01', endDate: '2024-02-29' }
      },
      {
        id: '2',
        reportId: '2',
        report: mockReports[1],
        status: 'failed',
        startTime: new Date('2024-03-15T11:00:00'),
        endTime: new Date('2024-03-15T11:00:45'),
        duration: 45000,
        errorMessage: 'API bağlantı hatası: Timeout',
        parameters: { date: '2024-03-14' }
      },
      {
        id: '3',
        reportId: '3',
        report: mockReports[2],
        status: 'running',
        startTime: new Date('2024-03-15T11:15:00'),
        parameters: { startDate: '2024-03-01', endDate: '2024-03-14' }
      }
    ]

    setCategories(mockCategories)
    setReports(mockReports)
    setExecutions(mockExecutions)
  }, [])

  const reportColumnDefs: ColDef[] = [
    { 
      headerName: 'Rapor Adı', 
      field: 'name', 
      width: 200,
      pinned: 'left',
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{params.data.category?.icon}</span>
          <span className="font-medium">{params.value}</span>
        </div>
      )
    },
    { headerName: 'Açıklama', field: 'description', width: 250 },
    { 
      headerName: 'Kategori', 
      field: 'category.name', 
      width: 150,
      valueGetter: (params) => params.data.category?.name || ''
    },
    { 
      headerName: 'Son Çalıştırma', 
      field: 'lastRun', 
      width: 150,
      valueGetter: (params) => {
        const lastExecution = executions
          .filter(e => e.reportId === params.data.id)
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]
        return lastExecution ? new Date(lastExecution.startTime).toLocaleString('tr-TR') : 'Hiç çalıştırılmadı'
      }
    },
    { 
      headerName: 'Durum', 
      field: 'lastStatus', 
      width: 120,
      valueGetter: (params) => {
        const lastExecution = executions
          .filter(e => e.reportId === params.data.id)
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]
        return lastExecution?.status || 'ready'
      },
      cellRenderer: (params: any) => {
        const status = params.value
        const statusConfig = {
          'completed': { icon: CheckCircle, color: 'text-green-600', text: 'Tamamlandı' },
          'failed': { icon: XCircle, color: 'text-red-600', text: 'Hata' },
          'running': { icon: RefreshCw, color: 'text-blue-600', text: 'Çalışıyor' },
          'scheduled': { icon: Clock, color: 'text-yellow-600', text: 'Zamanlandı' },
          'ready': { icon: AlertCircle, color: 'text-gray-600', text: 'Hazır' }
        }
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ready
        const Icon = config.icon
        
        return (
          <div className={`flex items-center gap-2 ${config.color}`}>
            <Icon className="w-4 h-4" />
            <span className="text-sm">{config.text}</span>
          </div>
        )
      }
    },
    { 
      headerName: 'İşlemler', 
      field: 'actions', 
      width: 200,
      pinned: 'right',
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => handleRunReport(params.data)}
            disabled={loading}
          >
            <Play className="w-3 h-3 mr-1" />
            Çalıştır
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleViewHistory(params.data)}
          >
            <Clock className="w-3 h-3 mr-1" />
            Geçmiş
          </Button>
        </div>
      )
    }
  ]

  const executionColumnDefs: ColDef[] = [
    { headerName: 'Rapor', field: 'report.name', width: 200 },
    { 
      headerName: 'Başlangıç', 
      field: 'startTime', 
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleString('tr-TR')
    },
    { 
      headerName: 'Bitiş', 
      field: 'endTime', 
      width: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString('tr-TR') : '-'
    },
    { 
      headerName: 'Süre', 
      field: 'duration', 
      width: 100,
      valueFormatter: (params) => params.value ? `${Math.round(params.value / 1000)}s` : '-'
    },
    { 
      headerName: 'Kayıt Sayısı', 
      field: 'recordCount', 
      width: 120,
      valueFormatter: (params) => params.value ? params.value.toLocaleString('tr-TR') : '-'
    },
    { 
      headerName: 'Durum', 
      field: 'status', 
      width: 120,
      cellRenderer: (params: any) => {
        const status = params.value
        const statusConfig = {
          'completed': { icon: CheckCircle, color: 'text-green-600', text: 'Tamamlandı' },
          'failed': { icon: XCircle, color: 'text-red-600', text: 'Hata' },
          'running': { icon: RefreshCw, color: 'text-blue-600', text: 'Çalışıyor' },
          'scheduled': { icon: Clock, color: 'text-yellow-600', text: 'Zamanlandı' }
        }
        
        const config = statusConfig[status as keyof typeof statusConfig]
        if (!config) return status
        
        const Icon = config.icon
        
        return (
          <div className={`flex items-center gap-2 ${config.color}`}>
            <Icon className="w-4 h-4" />
            <span className="text-sm">{config.text}</span>
          </div>
        )
      }
    },
    { 
      headerName: 'İşlemler', 
      field: 'actions', 
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          {params.data.status === 'completed' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDownloadResults(params.data)}
            >
              <Download className="w-3 h-3 mr-1" />
              İndir
            </Button>
          )}
          {params.data.errorMessage && (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => alert(params.data.errorMessage)}
            >
              Hata Detayı
            </Button>
          )}
        </div>
      )
    }
  ]

  const filteredReports = reports.filter(report => {
    const matchesSearch = (report.name && report.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || report.categoryId === selectedCategory
    return matchesSearch && matchesCategory && report.isActive
  })

  const handleRunReport = async (report: ReportConfig) => {
    setSelectedReport(report)
    setShowParameters(true)
  }

  const handleExecuteReport = async (parameters: Record<string, any>) => {
    if (!selectedReport) return

    setLoading(true)
    setShowParameters(false)

    // Create new execution record
    const newExecution: ReportExecution = {
      id: Date.now().toString(),
      reportId: selectedReport.id,
      report: selectedReport,
      status: 'running',
      startTime: new Date(),
      parameters
    }

    setExecutions(prev => [newExecution, ...prev])

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock successful response
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        date: new Date(2024, 2, Math.floor(Math.random() * 30) + 1).toLocaleDateString('tr-TR'),
        product: `Ürün ${i + 1}`,
        quantity: Math.floor(Math.random() * 100) + 1,
        amount: (Math.random() * 10000).toFixed(2),
        customer: `Müşteri ${Math.floor(Math.random() * 20) + 1}`
      }))

      const completedExecution = {
        ...newExecution,
        status: 'completed' as const,
        endTime: new Date(),
        duration: 3000,
        recordCount: mockData.length,
        resultData: mockData
      }

      setExecutions(prev => 
        prev.map(exec => exec.id === newExecution.id ? completedExecution : exec)
      )

      setReportResults(mockData)
      setShowResults(true)

    } catch (error) {
      const failedExecution = {
        ...newExecution,
        status: 'failed' as const,
        endTime: new Date(),
        duration: 3000,
        errorMessage: 'API bağlantı hatası'
      }

      setExecutions(prev => 
        prev.map(exec => exec.id === newExecution.id ? failedExecution : exec)
      )
    }

    setLoading(false)
    setSelectedReport(null)
  }

  const handleViewHistory = (report: ReportConfig) => {
    // Filter executions for this report and show in a modal or separate view
    const reportExecutions = executions.filter(e => e.reportId === report.id)
    alert(`${report.name} için ${reportExecutions.length} çalıştırma geçmişi bulundu.`)
  }

  const handleDownloadResults = (execution: ReportExecution) => {
    if (!execution.resultData) return
    
    // Convert to CSV and download
    const csv = [
      Object.keys(execution.resultData[0]).join(','),
      ...execution.resultData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${execution.report.name}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (showParameters && selectedReport) {
    return (
      <div className="p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowParameters(false)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle>
                {selectedReport.name} - Parametreler
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const parameters: Record<string, any> = {}
              for (const [key, value] of formData.entries()) {
                parameters[key] = value
              }
              handleExecuteReport(parameters)
            }} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="date"
                    required 
                    defaultValue="2024-03-01"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Bitiş Tarihi</Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="date"
                    required 
                    defaultValue="2024-03-31"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="format">Çıktı Formatı</Label>
                <select 
                  id="format" 
                  name="format" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              <div>
                <Label htmlFor="limit">Maksimum Kayıt Sayısı</Label>
                <Input 
                  id="limit" 
                  name="limit" 
                  type="number"
                  defaultValue="1000"
                  min="1"
                  max="10000"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  <Play className="w-4 h-4 mr-1" />
                  Raporu Çalıştır
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowParameters(false)}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const resultColumnDefs: ColDef[] = Object.keys(reportResults[0] || {}).map(key => ({
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      field: key,
      sortable: true,
      filter: true
    }))

    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowResults(false)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Rapor Sonuçları</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={resultsView === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setResultsView('grid')}>Grid</Button>
            <Button variant={resultsView === 'pivot' ? 'default' : 'outline'} size="sm" onClick={() => setResultsView('pivot')}>Pivot</Button>
          </div>
          <Button onClick={() => {
            const csv = [
              Object.keys(reportResults[0]).join(','),
              ...reportResults.map(row => Object.values(row).join(','))
            ].join('\n')
            
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `rapor_sonucu_${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            window.URL.revokeObjectURL(url)
          }}>
            <Download className="w-4 h-4 mr-1" />
            Sonuçları İndir
          </Button>
        </div>

        {resultsView === 'grid' ? (
          <EnhancedDataGrid
            data={reportResults}
            columnDefs={resultColumnDefs}
            title={`Rapor Sonuçları (${reportResults.length} kayıt)`}
            gridType={`report-results-${selectedReport?.id || reportId || 'unknown'}-company-${selectedReport?.companyId || 'none'}`}
            loading={false}
          />
        ) : (
          <PivotView
            data={reportResults}
            title={`Pivot (${reportResults.length} kayıt)`}
            gridKey={`pivot-${selectedReport?.id || reportId || 'unknown'}-company-${selectedReport?.companyId || 'none'}`}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Rapor Çalıştırma</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rapor ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-8">
        <EnhancedDataGrid
          data={filteredReports}
          columnDefs={reportColumnDefs}
          title={`Mevcut Raporlar (${filteredReports.length})`}
          gridType="available-reports"
          loading={loading}
        />

        <EnhancedDataGrid
          data={executions}
          columnDefs={executionColumnDefs}
          title={`Çalıştırma Geçmişi (${executions.length})`}
          gridType="execution-history"
          loading={false}
        />
      </div>
    </div>
  )
}

