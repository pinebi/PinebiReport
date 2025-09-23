'use client'

import { useState, useEffect } from 'react'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Play, Download, FileText, BarChart3, FolderOpen } from 'lucide-react'
import { ReportConfig, ReportCategory } from '@/types'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'

export default function ReporterDashboardPage() {
  const [reports, setReports] = useState<ReportConfig[]>([])
  const [categories, setCategories] = useState<ReportCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reportsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/report-configs'),
        fetch('/api/report-categories')
      ])
      
      const reportsData = await reportsResponse.json()
      const categoriesData = await categoriesResponse.json()
      
      setReports(reportsData.reports || [])
      setCategories(categoriesData.categories || [])
    } catch (error) {
      console.error('Error loading data:', error)
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
      window.location.href = `/reports/run?reportId=${report.id}`
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

  const parentCategories = categories.filter(cat => !cat.parentId)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rapor Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Tüm raporları görüntüleyin, kategorilere göre filtreleyin ve çalıştırın
          </p>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Rapor</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Rapor</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kategori</p>
                  <p className="text-2xl font-bold text-gray-900">{parentCategories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        {parentCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kategoriler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parentCategories.map(category => (
                <Link key={category.id} href={`/reports/category/${category.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600">
                            {category.children?.length || 0} alt kategori
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

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
              <span>Tüm Raporlar ({filteredReports.length})</span>
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
                gridType="reports-dashboard"
              />
            )}
          </CardContent>
        </Card>

        {filteredReports.length === 0 && !loading && (
          <Card className="mt-6">
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Rapor bulunamadı</h3>
                <p className="text-gray-400">
                  Henüz hiç rapor tanımlanmamış.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}