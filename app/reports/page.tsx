'use client'

import { useState, useEffect } from 'react'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Search, Plus } from 'lucide-react'
import { ReportConfig, Company, User, ReportCategory } from '@/types'
import { API_CONFIG } from '@/lib/constants'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportConfig[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<ReportCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingReport, setEditingReport] = useState<ReportConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [headers, setHeaders] = useState<{ key: string; value: string }>({ key: '', value: '' })

  // Load data from API
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔄 Loading reports data...')
      
      const [reportsResponse, companiesResponse, usersResponse, categoriesResponse] = await Promise.all([
        fetch('/api/report-configs'),
        fetch('/api/companies'),
        fetch('/api/users'),
        fetch('/api/report-categories')
      ])
      
      console.log('📊 API Responses:', {
        reports: reportsResponse.status,
        companies: companiesResponse.status,
        users: usersResponse.status,
        categories: categoriesResponse.status
      })
      
      let reportsData: any = { reports: [] }
      if (reportsResponse.ok) {
        try { reportsData = await reportsResponse.json() } catch { reportsData = { reports: [] } }
      } else {
        console.warn('GET /api/report-configs failed:', reportsResponse.status)
      }

      let companiesData: any = { companies: [] }
      if (companiesResponse.ok) {
        try { companiesData = await companiesResponse.json() } catch { companiesData = { companies: [] } }
      } else {
        console.warn('GET /api/companies failed:', companiesResponse.status)
      }

      let usersData: any = { users: [] }
      if (usersResponse.ok) {
        try { usersData = await usersResponse.json() } catch { usersData = { users: [] } }
      } else {
        console.warn('GET /api/users failed:', usersResponse.status)
      }

      let categoriesData: any = { categories: [] }
      if (categoriesResponse.ok) {
        try { categoriesData = await categoriesResponse.json() } catch { categoriesData = { categories: [] } }
      } else {
        console.warn('GET /api/report-categories failed:', categoriesResponse.status)
      }
      
      console.log('📋 Reports data:', reportsData)
      console.log('📊 Reports count:', reportsData.reports?.length || 0)
      
      setReports(reportsData.reports || [])
      setCompanies(companiesData.companies || [])
      setUsers(usersData.users || [])
      setCategories(categoriesData.categories || [])
      
      console.log('✅ Data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const columnDefs: ColDef[] = [
    { headerName: 'Rapor Adı', field: 'name', width: 180 },
    { headerName: 'Açıklama', field: 'description', width: 200 },
    { 
      headerName: 'Kategori', 
      field: 'category.name', 
      width: 150,
      valueGetter: (params) => params.data.category?.name || '',
      cellRenderer: (params: any) => {
        const category = params.data.category
        if (!category) return ''
        
        return (
          <div className="flex items-center gap-2">
            {category.icon && <span>{category.icon}</span>}
            <span>{category.name}</span>
          </div>
        )
      }
    },
    { headerName: 'Endpoint URL', field: 'endpointUrl', width: 250 },
    { headerName: 'API Kullanıcı Adı', field: 'apiUsername', width: 150 },
    { 
      headerName: 'Firma', 
      field: 'company.name', 
      width: 180,
      valueGetter: (params) => params.data.company?.name || ''
    },
    { 
      headerName: 'Kullanıcı', 
      field: 'user.firstName', 
      width: 150,
      valueGetter: (params) => params.data.user ? `${params.data.user.firstName} ${params.data.user.lastName}` : ''
    },
    { 
      headerName: 'Durum', 
      field: 'isActive', 
      width: 100,
      valueFormatter: (params) => params.value ? 'Aktif' : 'Pasif',
      cellStyle: (params) => ({
        color: params.value ? '#16a34a' : '#dc2626',
        fontWeight: 'bold'
      })
    },
    { 
      headerName: 'Oluşturma Tarihi', 
      field: 'createdAt', 
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('tr-TR')
    },
    {
      headerName: 'İşlemler',
      field: 'actions',
      width: 200,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(params.data)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleDelete(params.data)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Sil
          </button>
          <button
            onClick={() => runReport(params.data)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Çalıştır
          </button>
        </div>
      )
    }
  ]

  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      (report.name && typeof report.name === 'string' && report.name.toLowerCase().includes(searchLower)) ||
      (report.description && typeof report.description === 'string' && report.description.toLowerCase().includes(searchLower)) ||
      (report.endpointUrl && typeof report.endpointUrl === 'string' && report.endpointUrl.toLowerCase().includes(searchLower))
    )
  })

  const handleAdd = () => {
    setEditingReport(null)
    setHeaders({ key: '', value: '' })
    setShowForm(true)
  }

  const handleEdit = (report: ReportConfig) => {
    setEditingReport(report)
    
    // Parse headers if it's a string, otherwise use as object
    let headersObject = {}
    if (typeof report.headers === 'string') {
      try {
        headersObject = JSON.parse(report.headers)
      } catch (e) {
        console.error('Error parsing headers:', e)
        headersObject = {}
      }
    } else if (report.headers) {
      headersObject = report.headers
    }
    
    // Handle header parsing - look for "url" key or "0" key (legacy)
    const headerEntries = Object.entries(headersObject)
    if (headerEntries.length > 0) {
      const [key, value] = headerEntries[0]
      // If key is "url" or "0", it means it was stored as a single header value
      if (key === 'url' || key === '0') {
        setHeaders({ key: '', value: value as string })
      } else {
        setHeaders({ key: key, value: value as string })
      }
    } else {
      setHeaders({ key: '', value: '' })
    }
    setShowForm(true)
  }

  const handleDelete = async (report: ReportConfig) => {
    if (confirm(`${report.name} raporunu silmek istediğinizden emin misiniz?`)) {
      try {
        const response = await fetch(`/api/report-configs/${report.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          loadData() // Reload data
          // Sidebar'ı güncellemek için custom event tetikle
          window.dispatchEvent(new CustomEvent('refreshSidebar'))
          console.log('Rapor başarıyla silindi!')
        } else {
          alert('Rapor silinirken hata oluştu')
        }
      } catch (error) {
        console.error('Error deleting report:', error)
        alert('Rapor silinirken hata oluştu')
      }
    }
  }

  const updateHeader = (field: 'key' | 'value', value: string) => {
    setHeaders(prev => ({ ...prev, [field]: value }))
  }

  const runReport = async (report: ReportConfig) => {
    try {
      // Parse headers
      let headersObject = {}
      if (typeof report.headers === 'string') {
        try {
          headersObject = JSON.parse(report.headers)
        } catch (e) {
          console.error('Error parsing headers:', e)
          headersObject = {}
        }
      } else if (report.headers) {
        headersObject = report.headers
      }

      // Extract URL from headers if available
      let apiUrl = report.endpointUrl
      if ((headersObject as any)['url']) {
        apiUrl = (headersObject as any)['url']
      } else if ((headersObject as any)['0']) {
        apiUrl = (headersObject as any)['0']
      }

      console.log('Running report:', {
        name: report.name,
        endpointUrl: report.endpointUrl,
        apiUrl: apiUrl,
        apiUsername: report.apiUsername,
        headers: headersObject
      })

      // Prepare request options
      const requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headersObject
        }
      }

      // Add authentication if provided
      if (report.apiUsername && report.apiPassword) {
        const auth = btoa(`${report.apiUsername}:${report.apiPassword}`)
        requestOptions.headers = {
          ...requestOptions.headers,
          'Authorization': `Basic ${auth}`
        }
      }

      // Make API call
      const response = await fetch(apiUrl, requestOptions)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Report data received:', data)
        
        // Show success message with data preview
        alert(`Rapor başarıyla çalıştırıldı!\n\nAPI URL: ${apiUrl}\nDurum: ${response.status}\nVeri boyutu: ${JSON.stringify(data).length} karakter`)
        
        // You can also redirect to a results page or show data in a modal
        // window.location.href = `/reports/run?reportId=${report.id}&data=${encodeURIComponent(JSON.stringify(data))}`
      } else {
        alert(`Rapor çalıştırılamadı!\n\nAPI URL: ${apiUrl}\nDurum: ${response.status}\nHata: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error running report:', error)
      alert(`Rapor çalıştırılırken hata oluştu: ${error}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Convert single header to object - store URL as "url" key
      const headersObject: Record<string, any> = {}
    if (headers.value) {
      headersObject['url'] = headers.value
    }
    
    // Multi-user selection: collect userIds and persist in headers.allowedUserIds
    const selectedUserIds = formData.getAll('userIds') as string[]
    if (selectedUserIds && selectedUserIds.length > 0) {
      headersObject.allowedUserIds = selectedUserIds
    }
    
    // Validation: require at least one user
    const primaryUserId = ((selectedUserIds && selectedUserIds[0]) || (formData.get('userId') as string)) as string
    if (!primaryUserId) {
      alert('Lütfen en az bir kullanıcı seçiniz')
      setLoading(false)
      return
    }

    const reportData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      endpointUrl: formData.get('endpointUrl') as string,
      apiUsername: API_CONFIG.DEFAULT_API_USERNAME, // Sabit API kullanıcı adı
      apiPassword: API_CONFIG.DEFAULT_API_PASSWORD, // Sabit API şifresi
      headers: JSON.stringify(headersObject),
      categoryId: formData.get('categoryId') as string,
      companyId: formData.get('companyId') as string,
      // Backward compatibility: primary user is first selected
      userId: primaryUserId,
      isActive: formData.get('isActive') === 'true',
      showInMenu: formData.get('showInMenu') === 'on', // Checkbox değeri
    }

    try {
      let response
      if (editingReport) {
        // Update existing report
        response = await fetch(`/api/report-configs/${editingReport.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        })
      } else {
        // Add new report
        response = await fetch('/api/report-configs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        })
      }

      if (response.ok) {
        loadData() // Reload data
        setShowForm(false)
        setEditingReport(null)
        setHeaders({ key: '', value: '' })
        
        // Sidebar'ı güncellemek için custom event tetikle
        window.dispatchEvent(new CustomEvent('refreshSidebar'))
        
        console.log(editingReport ? 'Rapor başarıyla güncellendi!' : 'Rapor başarıyla eklendi!')
      } else {
        alert('Rapor kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving report:', error)
      alert('Rapor kaydedilirken hata oluştu')
    }
  }

  if (showForm) {
    return (
      <div className="p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle>
                {editingReport ? 'Rapor Düzenle' : 'Yeni Rapor Ekle'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rapor Adı *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    defaultValue={editingReport?.name || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Input 
                    id="description" 
                    name="description" 
                    defaultValue={editingReport?.description || ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endpointUrl">Ana API Endpoint URL *</Label>
                <Input 
                  id="endpointUrl" 
                  name="endpointUrl" 
                  type="url" 
                  required 
                  defaultValue={editingReport?.endpointUrl || 'http://api.pinebi.com:8191/REST.PROXY'}
                  placeholder="http://api.pinebi.com:8191/REST.PROXY"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ana API endpoint URL'si (örn: http://api.pinebi.com:8191/REST.PROXY)
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiUsername">API Kullanıcı Adı *</Label>
                  <Input 
                    id="apiUsername" 
                    name="apiUsername" 
                    required 
                    value={API_CONFIG.DEFAULT_API_USERNAME}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="API kullanıcı adı (sabit)"
                  />
                </div>
                <div>
                  <Label htmlFor="apiPassword">API Şifresi *</Label>
                  <Input 
                    id="apiPassword" 
                    name="apiPassword" 
                    type="password" 
                    required 
                    value={API_CONFIG.DEFAULT_API_PASSWORD}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="API şifresi (sabit)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    API şifresi otomatik olarak ayarlanmıştır.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="headerInfo">Rapor Endpoint URL</Label>
                <Input 
                  id="headerInfo"
                  name="headerInfo"
                  placeholder="http://31.145.34.232:8190/REST.CIRO.RAPOR.TARIH.URUNDETAYLI"
                  value={headers.value}
                  onChange={(e) => updateHeader('value', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Rapor endpoint URL'sini buraya girin (@ olmadan) (örn: http://31.145.34.232:8190/REST.CIRO.RAPOR.TARIH.URUNDETAYLI)
                </p>
              </div>
              
              <div>
                <Label htmlFor="categoryId">Kategori *</Label>
                <select 
                  id="categoryId" 
                  name="categoryId" 
                  required 
                  defaultValue={editingReport?.categoryId || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyId">Firma *</Label>
                  <select 
                    id="companyId" 
                    name="companyId" 
                    required 
                    defaultValue={editingReport?.companyId || ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Firma Seçin</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="userId">Kullanıcı *</Label>
                  <select 
                    id="userId" 
                    name="userId" 
                    required 
                    defaultValue={editingReport?.userId || ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Kullanıcı Seçin</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Çoklu kullanıcı seçimi (Kullanıcı *) */}
                <div>
                  <Label htmlFor="userIds">Kullanıcı * (çoklu seçim)</Label>
                  <select 
                    id="userIds" 
                    name="userIds" 
                    multiple
                    defaultValue={(function(){
                      try {
                        if (editingReport?.headers) {
                          const h = typeof editingReport.headers === 'string' ? JSON.parse(editingReport.headers) : (editingReport.headers as any)
                          if (Array.isArray(h?.allowedUserIds)) return h.allowedUserIds
                        }
                      } catch {}
                      return editingReport?.userId ? [editingReport.userId] : []
                    })() as any}
                    className="min-h-28 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.username})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Bir veya birden fazla kullanıcı seçin. İlk seçilen kullanıcı ana kullanıcı olarak kaydedilir.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="isActive">Durum</Label>
                  <select 
                    id="isActive" 
                    name="isActive" 
                    defaultValue={editingReport?.isActive ? 'true' : 'false'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="showInMenu"
                    name="showInMenu"
                    defaultChecked={(editingReport as any)?.showInMenu !== false}
                    className="mt-6 h-4 w-4"
                  />
                  <Label htmlFor="showInMenu" className="mt-6">Menüde Gösterilsin</Label>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingReport ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Rapor Yönetimi</h1>
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
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Rapor Ekle
          </Button>
        </div>
      </div>

      <EnhancedDataGrid
        data={filteredReports}
        columnDefs={columnDefs}
        title={`Raporlar (${filteredReports.length})`}
        gridType="reports-management"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
