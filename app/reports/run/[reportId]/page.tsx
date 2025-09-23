'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'
import TabulatorView from '@/components/shared/tabulator-view'
import WebDataRocksPivotView from '@/components/shared/webdatarocks-pivot-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Play, 
  Calendar,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Grid3X3,
  BarChart3
} from 'lucide-react'
import { ReportConfig } from '@/types'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface ReportData {
  [key: string]: any
}

export default function RunSpecificReportPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const reportId = params.reportId as string
  const { user, isLoading: authLoading } = useAuth()
  
  // Get URL parameters for company, client and dates
  const urlCompanyName = searchParams.get('company')
  const urlClientName = searchParams.get('client')
  const urlDate = searchParams.get('date')
  const urlStartDate = searchParams.get('startDate')
  const urlEndDate = searchParams.get('endDate')
  
  const [report, setReport] = useState<ReportConfig | null>(null)
  const [startDate, setStartDate] = useState(() => {
    if (urlStartDate) {
      return urlStartDate
    }
    if (urlDate) {
      return new Date(urlDate).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    if (urlEndDate) {
      return urlEndDate
    }
    if (urlDate) {
      return new Date(urlDate).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [showResults, setShowResults] = useState(false)
  const [resultsView, setResultsView] = useState<'grid' | 'pivot' | 'tabulator'>('grid')
  const [error, setError] = useState('')
  const [hasAutoRun, setHasAutoRun] = useState(false)
  
  // Auto-run report if company/client is provided
  useEffect(() => {
    if (report && startDate && endDate && !loading && !hasAutoRun) {
      console.log('🚀 Otomatik rapor çalıştırılıyor...')
      setHasAutoRun(true)
      setTimeout(() => {
        runReport()
      }, 1000)
    }
  }, [report?.id, startDate, endDate, loading, hasAutoRun])

  // Load report details
  useEffect(() => {
    const loadReport = async () => {
      if (!reportId) return
      
      try {
        const response = await fetch(`/api/report-configs/${reportId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.report) {
          throw new Error('Report not found')
        }
        
        setReport(data.report)
        
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        
        setStartDate(yesterday.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
      } catch (error) {
        console.error('Error loading report:', error)
        setError(`Rapor bilgileri yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      }
    }

    loadReport()
  }, [reportId])

  const handleInvoiceFlagChange = async (id: string, isProcessed: boolean) => {
    try {
      const response = await fetch('/api/invoice-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isProcessed
        })
      })

      if (response.ok) {
        // Update local data
        setReportData(prevData => 
          prevData.map(item => 
            item.ID === id 
              ? { ...item, faturasiIslendi: isProcessed }
              : item
          )
        )
      } else {
        console.error('Failed to update invoice flag')
      }
    } catch (error) {
      console.error('Error updating invoice flag:', error)
    }
  }

  const loadInvoiceFlags = async (dataArray: any[]) => {
    try {
      const ids = dataArray.map(item => item.ID).filter(Boolean)
      
      if (ids.length === 0) return

      const response = await fetch('/api/invoice-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get',
          ids
        })
      })

      if (response.ok) {
        const result = await response.json()
        const processedIds = new Set(result.processedIds || [])
        
        // Update data with invoice flags
        dataArray.forEach(item => {
          if (item.ID && processedIds.has(item.ID)) {
            item.faturasiIslendi = true
          } else {
            item.faturasiIslendi = false
          }
        })
      }
    } catch (error) {
      console.error('Error loading invoice flags:', error)
    }
  }

  const runReport = async () => {
    if (!report || !startDate || !endDate) {
      return
    }

    setLoading(true)
    setError('')
    setShowResults(false)

    try {
      let headers: Record<string, string> = {}
      if (report.headers) {
        if (typeof report.headers === 'string') {
        try {
          headers = JSON.parse(report.headers)
        } catch (e) {
          console.error('Error parsing headers:', e)
          headers = {}
          }
        } else {
          headers = report.headers as Record<string, string>
        }
      }

      const requestBody = {
        apiUrl: report.endpointUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${report.apiUsername}:${report.apiPassword}`)}`,
          ...headers
        },
        method: 'POST',
        body: {
          USER: {
            ID: "df51ad80-ef0b-4cc8-a941-be7a6ca638d9"
          },
          START_DATE: startDate.includes('.') ? 
            startDate.split('.').reverse().join('-') : 
            (startDate.includes('/') ? startDate : new Date(startDate).toISOString().split('T')[0]),
          END_DATE: endDate.includes('.') ? 
            endDate.split('.').reverse().join('-') : 
            (endDate.includes('/') ? endDate : new Date(endDate).toISOString().split('T')[0]),
          ...(urlCompanyName && { FIRMA: urlCompanyName }),
          ...(urlClientName && { CLIENT: urlClientName })
        }
      }


      const response = await fetch('/api/reports/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        let dataArray: ReportData[] = []
        
        if (data.data.DATAS && Array.isArray(data.data.DATAS)) {
          dataArray = data.data.DATAS
        } else if (Array.isArray(data.data)) {
          dataArray = data.data
        } else if (data.data.data && Array.isArray(data.data.data)) {
          dataArray = data.data.data
        } else {
          throw new Error('Rapor verisi beklenen formatta değil.')
        }

        // Load invoice flags for specific report
        if (reportId === 'cmfrcllyp00013528a9a1letz') {
          await loadInvoiceFlags(dataArray)
        }

        setReportData(dataArray)
        setShowResults(true)
        setResultsView('grid')
      } else {
        throw new Error('Rapor çalıştırılırken hata oluştu')
      }
    } catch (error: any) {
      console.error('Error running report:', error)
      setError(error.message || 'Rapor çalıştırılırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const generateColumnDefs = (): ColDef[] => {
    if (!reportData.length) {
      return []
    }

    const columns = Object.keys(reportData[0])

    const baseCols = columns.map((col) => {
      const baseColDef: ColDef = {
        headerName: col,
        field: col,
        sortable: true,
        filter: true,
        resizable: true,
        width: 150,
      }

      // Add click functionality for Firma column
      if (col === 'Firma') {
        baseColDef.cellStyle = {
          cursor: 'pointer',
          color: '#2563eb',
          fontWeight: '500'
        }
        baseColDef.onCellClicked = (params: any) => {
              console.log('🔍 Firma tıklandı:', params.value)
          const firmaRaporuId = 'cmfregql400058tljo44h7zz3'
          const newUrl = `/reports/run/${firmaRaporuId}?company=${encodeURIComponent(params.value)}&startDate=${startDate}&endDate=${endDate}`
          window.location.href = newUrl
        }
      }

      // Add click functionality for CLIENT column
      if (col === 'CLIENT') {
        baseColDef.cellStyle = {
          cursor: 'pointer',
          color: '#16a34a',
          fontWeight: '500'
        }
        baseColDef.onCellClicked = (params: any) => {
              console.log('🔍 CLIENT tıklandı:', params.value)
          const clientRaporuId = 'cmfrfinje00078tljo8ii3wo8'
          const firmaName = params.data?.Firma || urlCompanyName || ''
          const newUrl = `/reports/run/${clientRaporuId}?company=${encodeURIComponent(firmaName)}&client=${encodeURIComponent(params.value)}&startDate=${startDate}&endDate=${endDate}`
          window.location.href = newUrl
        }
      }

      // Add click functionality for Ay column (month-based navigation) - only for specific reports
      if ((col === 'Ay' || col === 'AyAdi') && reportId === 'report_1758563141848_p5zevzpjk') {
        baseColDef.cellStyle = {
          cursor: 'pointer',
          color: '#dc2626',
          fontWeight: '500'
        }
        baseColDef.onCellClicked = (params: any) => {
          // Get month number and name
          const ayNumarasi = params.data?.AyNumarasi || params.data?.AyNumarasi
          const ayAdi = params.value || params.data?.AyAdi
          
          if (ayNumarasi) {
            // Calculate start and end dates for the clicked month
            // Use the year from the current report data or current year
            const dataYear = params.data?.Yil || new Date().getFullYear()
            const monthNumber = parseInt(ayNumarasi)
            
            // Create start date (first day of month)
            const startDate = new Date(dataYear, monthNumber - 1, 1)
            // Create end date (last day of month)
            const endDate = new Date(dataYear, monthNumber, 0)
            
            // Format dates as YYYY-MM-DD for API
            const startDateStr = startDate.toISOString().split('T')[0]
            const endDateStr = endDate.toISOString().split('T')[0]
            
            // Navigate to "report_1758563184051_4aznt9g56" report with month dates
            const tumGirislerRaporuId = 'report_1758563184051_4aznt9g56'
            const newUrl = `/reports/run/${tumGirislerRaporuId}?startDate=${startDateStr}&endDate=${endDateStr}`
            window.location.href = newUrl
          }
        }
      }

      return baseColDef
    })

    // Add special "Faturası İşlendi" column for specific report
    if (reportId === 'cmfrcllyp00013528a9a1letz') {
      const faturasiIslendiCol: ColDef = {
        headerName: 'Faturası İşlendi',
        field: 'faturasiIslendi',
        width: 150,
        pinned: 'right',
        cellRenderer: (params: any) => {
          const isProcessed = params.data.faturasiIslendi || false
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isProcessed}
                onChange={(e) => handleInvoiceFlagChange(params.data.ID, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
          )
        }
      }
      baseCols.push(faturasiIslendiCol)
    }

    return baseCols
  }

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2">
        <div className="w-full flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Kullanıcı bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-2">
        <div className="w-full flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Giriş yapmanız gerekiyor</p>
            <Link href="/login">
              <Button>Giriş Yap</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 p-2">
        <div className="w-full">
            <div className="flex items-center gap-4 mb-4">
            <Link href="/reports">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Rapor Yükleniyor...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2">
        {/* Header */}
        <div className="w-full mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
              <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
              {(urlCompanyName || urlClientName) && (
                <div className="text-sm font-medium space-y-1">
                  {urlCompanyName && (
                    <p className="text-blue-600">
                      🏢 Firma: {urlCompanyName}
                    </p>
                  )}
                  {urlClientName && (
                    <p className="text-green-600">
                      👤 Client: {urlClientName}
                    </p>
                  )}
                  {urlDate && (
                    <p className="text-gray-600">
                      📅 Tarih: {new Date(urlDate).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
              )}
              <p className="text-gray-600">{report.description}</p>
            </div>
          </div>

          {/* Date Parameters and Run Button - Moved to top right */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Label htmlFor="startDate" className="text-sm font-medium">
                Başlangıç:
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-32"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                Bitiş:
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-32"
              />
            </div>
            
            <Button
              onClick={() => runReport()}
              disabled={loading || !startDate || !endDate}
              size="sm"
              className="ml-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Çalıştırılıyor...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Çalıştır
                </>
              )}
            </Button>
          </div>
          </div>
          
          {/* Error Message */}
          {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Rapor Sonuçları
                </CardTitle>
                {showResults && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Son güncelleme: {new Date().toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Button 
                      variant={resultsView === 'grid' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setResultsView('grid')}
                    >
                      Grid
                    </Button>
                    <Button 
                      variant={resultsView === 'pivot' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setResultsView('pivot')}
                    >
                      Pivot
                    </Button>
                    {reportId === 'report_1758563184051_4aznt9g56' && (
                      <Button 
                        variant={resultsView === 'tabulator' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setResultsView('tabulator')}
                      >
                        Tabulator
                      </Button>
                    )}
                  </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!showResults ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Raporu çalıştırmak için tarih aralığını seçin ve "Raporu Çalıştır" butonuna tıklayın.</p>
                </div>
              ) : (
                <div className="h-[800px]">
                {(() => {
                  if (resultsView === 'tabulator' && reportId === 'report_1758563184051_4aznt9g56') {
                    return (
                      <TabulatorView
                        key={`tab-${reportData.length}`}
                        data={reportData}
                        title={`${report.name} - Tabulator`}
                      />
                    )
                  } else if (resultsView === 'pivot') {
                    return (
                      <WebDataRocksPivotView
                        key={`pivot-${reportData.length}`}
                        data={reportData}
                        title={`${report.name} - Pivot`}
                        gridKey={`pivot-${reportId}-${report?.companyId || 'none'}`}
                      />
                    )
                  } else {
                    // Default to grid view
                    const columnDefs = generateColumnDefs()
                    return (
                  <EnhancedDataGrid
                    data={reportData}
                        columnDefs={columnDefs}
                    title={`${report.name} - ${reportData.length} kayıt`}
                    gridType={`report-${reportId}`}
                    loading={loading}
                  />
                    )
                  }
                })()}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
