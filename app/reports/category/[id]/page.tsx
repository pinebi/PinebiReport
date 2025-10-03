'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Play, Download, FileText } from 'lucide-react'
import { ReportConfig } from '@/types'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'

export default function CategoryReportsPage() {
  const params = useParams()
  const categoryId = params.id as string
  const { user } = useAuth()
  const [reports, setReports] = useState<ReportConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryName, setCategoryName] = useState('')

  // Load reports for this category
  useEffect(() => {
    loadCategoryReports()
  }, [categoryId])

  const loadCategoryReports = async () => {
    setLoading(true)
    try {
      console.log('🔄 Loading category reports for:', categoryId)
      
      const response = await fetch(`/api/report-categories/${categoryId}`)
      const data = await response.json()
      console.log('📂 Category data:', data)
      
      if (data.category) {
        setCategoryName(data.category.name)
        console.log('📂 Category name set to:', data.category.name)
        
        // Load reports for this category
        console.log('🔄 Loading reports for category:', categoryId)
        const reportsResponse = await fetch(`/api/report-configs?categoryId=${categoryId}`)
        const reportsData = await reportsResponse.json()
        console.log('📊 Reports data:', reportsData)
        console.log('📊 Reports count:', reportsData.reports?.length || 0)
        setReports(reportsData.reports || [])
      }
    } catch (error) {
      console.error('❌ Error loading category reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const columnDefs: ColDef[] = [
    { 
      headerName: 'Rapor Adı', 
      field: 'name', 
      width: 200,
      cellRenderer: (params: any) => (
        <div className="font-medium text-blue-600">
          {params.value}
        </div>
      )
    },
    { 
      headerName: 'Açıklama', 
      field: 'description', 
      width: 250 
    },
    { 
      headerName: 'Kategori', 
      field: 'category.name', 
      width: 150,
      cellRenderer: (params: any) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {params.data.category?.name}
        </span>
      )
    },
    { 
      headerName: 'Durum', 
      field: 'isActive', 
      width: 100,
      cellRenderer: (params: any) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          params.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {params.value ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      headerName: 'İşlemler',
      width: 200,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => runReport(params.data)}
            className="text-green-600 hover:text-green-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Çalıştır
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadReport(params.data)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Download className="w-4 h-4 mr-1" />
            İndir
          </Button>
        </div>
      )
    }
  ]

  const runReport = async (report: ReportConfig) => {
    try {
      // Redirect to report run page with this report
      window.location.href = `/reports/run/${report.id}`
    } catch (error) {
      console.error('Error running report:', error)
      alert('Rapor çalıştırılırken hata oluştu')
    }
  }

  const downloadReport = async (report: ReportConfig) => {
    try {
      // Here you would implement the actual download logic
      alert(`Rapor indiriliyor: ${report.name}`)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Rapor indirilirken hata oluştu')
    }
  }

  const filteredReports = reports.filter(report =>
    (report.name && report.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{categoryName} Raporları</h1>
              <p className="text-gray-600 mt-2">
                Bu kategorideki tüm raporları görüntüleyin ve çalıştırın
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rapor ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Reports Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Raporlar ({filteredReports.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <EnhancedDataGrid
                data={filteredReports}
                columnDefs={columnDefs}
                title={`Raporlar (${filteredReports.length})`}
                gridType="category-reports"
              />
            )}
          </CardContent>
        </Card>

        {filteredReports.length === 0 && !loading && (
          <Card className="mt-6">
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Bu kategoride rapor bulunamadı</h3>
                <p className="text-gray-400">
                  Bu kategoride henüz hiç rapor tanımlanmamış.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
