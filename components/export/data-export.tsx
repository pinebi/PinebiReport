'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  Calendar,
  Filter,
  Settings,
  CheckCircle
} from 'lucide-react'
import { HoverScale } from '@/hooks/use-ui-animations'

interface ExportFormat {
  id: string
  name: string
  extension: string
  icon: React.ReactNode
  description: string
  mimeType: string
}

interface ExportOptions {
  format: string
  dateRange: {
    start: string
    end: string
  }
  filters: {
    includeKPIs: boolean
    includeCharts: boolean
    includeRawData: boolean
    includeMetadata: boolean
  }
  layout: {
    orientation: 'portrait' | 'landscape'
    includeLogo: boolean
    includeTimestamp: boolean
  }
}

interface DataExportProps {
  data: any
  title?: string
  onExport?: (options: ExportOptions) => Promise<void>
}

const exportFormats: ExportFormat[] = [
  {
    id: 'pdf',
    name: 'PDF Raporu',
    extension: 'pdf',
    icon: <FileText className="w-5 h-5" />,
    description: 'Profesyonel PDF raporu',
    mimeType: 'application/pdf'
  },
  {
    id: 'excel',
    name: 'Excel Dosyası',
    extension: 'xlsx',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    description: 'Düzenlenebilir Excel dosyası',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  {
    id: 'csv',
    name: 'CSV Dosyası',
    extension: 'csv',
    icon: <FileText className="w-5 h-5" />,
    description: 'Ham veri CSV formatı',
    mimeType: 'text/csv'
  },
  {
    id: 'png',
    name: 'PNG Görsel',
    extension: 'png',
    icon: <FileImage className="w-5 h-5" />,
    description: 'Dashboard görseli',
    mimeType: 'image/png'
  }
]

export default function DataExport({ data, title = 'Dashboard Raporu', onExport }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [showOptions, setShowOptions] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    filters: {
      includeKPIs: true,
      includeCharts: true,
      includeRawData: false,
      includeMetadata: true
    },
    layout: {
      orientation: 'portrait',
      includeLogo: true,
      includeTimestamp: true
    }
  })

  const handleExport = useCallback(async (format: string) => {
    if (!data) {
      console.warn('No data to export')
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    try {
      const options: ExportOptions = {
        ...exportOptions,
        format
      }

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      if (onExport) {
        await onExport(options)
      } else {
        // Default export logic
        await defaultExport(options, data, title)
      }

      setExportProgress(100)
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 1000)

    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [data, title, exportOptions, onExport])

  const defaultExport = async (options: ExportOptions, data: any, title: string) => {
    const format = exportFormats.find(f => f.id === options.format)
    if (!format) throw new Error('Unsupported format')

    switch (options.format) {
      case 'pdf':
        await exportToPDF(data, title, options)
        break
      case 'excel':
        await exportToExcel(data, title, options)
        break
      case 'csv':
        await exportToCSV(data, title, options)
        break
      case 'png':
        await exportToPNG(title, options)
        break
    }
  }

  const exportToPDF = async (data: any, title: string, options: ExportOptions) => {
    // Mock PDF export - in real implementation, use jsPDF or similar
    console.log('Exporting to PDF:', { data, title, options })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create downloadable link
    const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = async (data: any, title: string, options: ExportOptions) => {
    // Mock Excel export - in real implementation, use SheetJS or similar
    console.log('Exporting to Excel:', { data, title, options })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const blob = new Blob(['Mock Excel content'], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = async (data: any, title: string, options: ExportOptions) => {
    // Mock CSV export
    console.log('Exporting to CSV:', { data, title, options })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Convert data to CSV format
    const csvContent = convertToCSV(data)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToPNG = async (title: string, options: ExportOptions) => {
    // Mock PNG export - in real implementation, use html2canvas
    console.log('Exporting to PNG:', { title, options })
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Create a canvas element and capture dashboard
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 800
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Fill with white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add title
      ctx.fillStyle = '#000000'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(title, canvas.width / 2, 50)
      
      // Add timestamp if enabled
      if (options.layout.includeTimestamp) {
        ctx.font = '14px Arial'
        ctx.fillText(
          `Oluşturulma: ${new Date().toLocaleString('tr-TR')}`,
          canvas.width / 2,
          80
        )
      }
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${title}_${new Date().toISOString().split('T')[0]}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    })
  }

  const convertToCSV = (data: any): string => {
    if (!data) return ''
    
    // Simple CSV conversion for dashboard data
    const headers = ['Metric', 'Value', 'Date']
    const rows = []
    
    if (data.kpiData) {
      Object.entries(data.kpiData).forEach(([key, value]) => {
        rows.push([key, value, new Date().toISOString().split('T')[0]])
      })
    }
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Veri Dışa Aktarma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Dışa aktarılıyor...</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Export Formats */}
        <div className="grid grid-cols-2 gap-3">
          {exportFormats.map((format) => (
            <HoverScale key={format.id} scale={1.02}>
              <Button
                variant={selectedFormat === format.id ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto p-4"
                onClick={() => {
                  setSelectedFormat(format.id)
                  handleExport(format.id)
                }}
                disabled={isExporting}
              >
                {format.icon}
                <div className="text-center">
                  <div className="font-medium">{format.name}</div>
                  <div className="text-xs opacity-70">{format.description}</div>
                </div>
              </Button>
            </HoverScale>
          ))}
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showOptions ? 'Seçenekleri Gizle' : 'Gelişmiş Seçenekler'}
          </Button>

          {showOptions && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tarih Aralığı</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={exportOptions.dateRange.start}
                    onChange={(e) => updateExportOptions({
                      dateRange: { ...exportOptions.dateRange, start: e.target.value }
                    })}
                    className="px-3 py-2 border rounded text-sm"
                  />
                  <input
                    type="date"
                    value={exportOptions.dateRange.end}
                    onChange={(e) => updateExportOptions({
                      dateRange: { ...exportOptions.dateRange, end: e.target.value }
                    })}
                    className="px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">İçerik Filtreleri</label>
                <div className="space-y-2">
                  {Object.entries(exportOptions.filters).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateExportOptions({
                          filters: { ...exportOptions.filters, [key]: e.target.checked }
                        })}
                        className="rounded"
                      />
                      <span>
                        {key === 'includeKPIs' && 'KPI Verileri'}
                        {key === 'includeCharts' && 'Grafikler'}
                        {key === 'includeRawData' && 'Ham Veriler'}
                        {key === 'includeMetadata' && 'Meta Veriler'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Layout */}
              <div>
                <label className="text-sm font-medium mb-2 block">Düzen Seçenekleri</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={exportOptions.layout.includeLogo}
                      onChange={(e) => updateExportOptions({
                        layout: { ...exportOptions.layout, includeLogo: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span>Logo Ekle</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={exportOptions.layout.includeTimestamp}
                      onChange={(e) => updateExportOptions({
                        layout: { ...exportOptions.layout, includeTimestamp: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span>Tarih/Saat Ekle</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Status */}
        {exportProgress === 100 && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Dışa aktarma tamamlandı!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}













