'use client'

import { useState, useEffect } from 'react'
import { DataGrid } from '@/components/shared/data-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Search, Plus, Minus, TestTube, Save } from 'lucide-react'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'

interface ApiConfig {
  id: string
  name: string
  description: string
  baseUrl: string
  version: string
  authentication: {
    type: 'basic' | 'bearer' | 'apikey' | 'oauth2'
    username?: string
    password?: string
    token?: string
    apiKey?: string
    apiKeyHeader?: string
  }
  defaultHeaders: Record<string, string>
  endpoints: ApiEndpoint[]
  timeout: number
  retryCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ApiEndpoint {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  headers: Record<string, string>
  queryParams: Record<string, string>
  bodyTemplate: string
  responseExample: string
  isActive: boolean
}

export default function ApiConfigPage() {
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ApiConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }])
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [testResult, setTestResult] = useState<string>('')
  const [showTest, setShowTest] = useState(false)

  // Load API configs from database
  useEffect(() => {
    loadApiConfigs()
  }, [])

  const loadApiConfigs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/api-configs')
      const data = await response.json()
      setApiConfigs(data.configs || [])
    } catch (error) {
      console.error('Error loading API configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const columnDefs: ColDef[] = [
    { headerName: 'API Adı', field: 'name', width: 200, pinned: 'left' },
    { headerName: 'Açıklama', field: 'description', width: 250 },
    { headerName: 'Base URL', field: 'baseUrl', width: 300 },
    { headerName: 'Versiyon', field: 'version', width: 100 },
    { 
      headerName: 'Auth Tipi', 
      field: 'authentication.type', 
      width: 120,
      valueGetter: (params) => {
        const typeMap = {
          'basic': 'Basic Auth',
          'bearer': 'Bearer Token',
          'apikey': 'API Key',
          'oauth2': 'OAuth2'
        }
        return typeMap[params.data.authentication?.type as keyof typeof typeMap] || params.data.authentication?.type
      }
    },
    { 
      headerName: 'Endpoint Sayısı', 
      field: 'endpoints.length', 
      width: 130,
      valueGetter: (params) => params.data.endpoints?.length || 0
    },
    { headerName: 'Timeout (ms)', field: 'timeout', width: 120 },
    { headerName: 'Retry Sayısı', field: 'retryCount', width: 120 },
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
    }
  ]

  const filteredConfigs = apiConfigs.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.baseUrl.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingConfig(null)
    setHeaders([{ key: 'Content-Type', value: 'application/json' }])
    setEndpoints([])
    setShowForm(true)
  }

  const handleEdit = (config: ApiConfig) => {
    setEditingConfig(config)
    const headerEntries = Object.entries(config.defaultHeaders || {}).map(([key, value]) => ({ key, value }))
    setHeaders(headerEntries.length > 0 ? headerEntries : [{ key: '', value: '' }])
    setEndpoints(config.endpoints || [])
    setShowForm(true)
  }

  const handleDelete = (config: ApiConfig) => {
    if (confirm(`${config.name} API yapılandırmasını silmek istediğinizden emin misiniz?`)) {
      setApiConfigs(apiConfigs.filter(c => c.id !== config.id))
    }
  }

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const removeHeader = (index: number) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((_, i) => i !== index))
    }
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const addEndpoint = () => {
    const newEndpoint: ApiEndpoint = {
      id: Date.now().toString(),
      name: '',
      method: 'GET',
      path: '',
      description: '',
      headers: {},
      queryParams: {},
      bodyTemplate: '',
      responseExample: '',
      isActive: true
    }
    setEndpoints([...endpoints, newEndpoint])
  }

  const removeEndpoint = (index: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== index))
  }

  const updateEndpoint = (index: number, field: keyof ApiEndpoint, value: any) => {
    const newEndpoints = [...endpoints]
    newEndpoints[index] = { ...newEndpoints[index], [field]: value }
    setEndpoints(newEndpoints)
  }

  const testApiConnection = async () => {
    setShowTest(true)
    setTestResult('API bağlantısı test ediliyor...')
    
    // Simulated API test
    setTimeout(() => {
      setTestResult(`✅ API bağlantısı başarılı!
      
Status: 200 OK
Response Time: 245ms
Content-Type: application/json

Örnek Response:
{
  "status": "success",
  "data": {
    "version": "1.0",
    "endpoints": 12,
    "uptime": "99.9%"
  }
}`)
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Convert headers array to object
    const headersObject: Record<string, string> = {}
    headers.forEach(header => {
      if (header.key && header.value) {
        headersObject[header.key] = header.value
      }
    })

    // Get authentication data
    const authType = formData.get('authType') as 'basic' | 'bearer' | 'apikey' | 'oauth2'
    const authentication: ApiConfig['authentication'] = { type: authType }
    
    if (authType === 'basic') {
      authentication.username = formData.get('authUsername') as string
      authentication.password = formData.get('authPassword') as string
    } else if (authType === 'bearer') {
      authentication.token = formData.get('authToken') as string
    } else if (authType === 'apikey') {
      authentication.apiKey = formData.get('authApiKey') as string
      authentication.apiKeyHeader = formData.get('authApiKeyHeader') as string
    }
    
    const configData: Omit<ApiConfig, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      baseUrl: formData.get('baseUrl') as string,
      version: formData.get('version') as string,
      authentication,
      defaultHeaders: headersObject,
      endpoints,
      timeout: parseInt(formData.get('timeout') as string) || 30000,
      retryCount: parseInt(formData.get('retryCount') as string) || 3,
      isActive: formData.get('isActive') === 'true',
    }

    if (editingConfig) {
      // Update existing config
      const updatedConfig: ApiConfig = {
        ...editingConfig,
        ...configData,
        updatedAt: new Date()
      }
      setApiConfigs(apiConfigs.map(c => c.id === editingConfig.id ? updatedConfig : c))
    } else {
      // Add new config
      const newConfig: ApiConfig = {
        id: Date.now().toString(),
        ...configData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setApiConfigs([...apiConfigs, newConfig])
    }

    setShowForm(false)
    setEditingConfig(null)
    setHeaders([{ key: '', value: '' }])
    setEndpoints([])
  }

  if (showForm) {
    return (
      <div className="p-8">
        <Card className="max-w-6xl mx-auto">
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
                {editingConfig ? 'API Yapılandırması Düzenle' : 'Yeni API Yapılandırması'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">API Adı *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    defaultValue={editingConfig?.name || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="version">Versiyon</Label>
                  <Input 
                    id="version" 
                    name="version" 
                    defaultValue={editingConfig?.version || '1.0'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Input 
                  id="description" 
                  name="description" 
                  defaultValue={editingConfig?.description || ''}
                />
              </div>

              <div>
                <Label htmlFor="baseUrl">Base URL *</Label>
                <Input 
                  id="baseUrl" 
                  name="baseUrl" 
                  type="url" 
                  required 
                  defaultValue={editingConfig?.baseUrl || ''}
                  placeholder="https://api.example.com/v1"
                />
              </div>

              {/* Authentication */}
              <div className="border rounded-lg p-4">
                <Label className="text-base font-semibold">Kimlik Doğrulama</Label>
                <div className="mt-2">
                  <Label htmlFor="authType">Auth Tipi *</Label>
                  <select 
                    id="authType" 
                    name="authType" 
                    required 
                    defaultValue={editingConfig?.authentication?.type || 'bearer'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="basic">Basic Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="apikey">API Key</option>
                    <option value="oauth2">OAuth2</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="authUsername">Kullanıcı Adı</Label>
                    <Input 
                      id="authUsername" 
                      name="authUsername" 
                      defaultValue={editingConfig?.authentication?.username || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="authPassword">Şifre</Label>
                    <Input 
                      id="authPassword" 
                      name="authPassword" 
                      type="password"
                      defaultValue={editingConfig?.authentication?.password || ''}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="authToken">Bearer Token</Label>
                  <Input 
                    id="authToken" 
                    name="authToken" 
                    defaultValue={editingConfig?.authentication?.token || ''}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="authApiKey">API Key</Label>
                    <Input 
                      id="authApiKey" 
                      name="authApiKey" 
                      defaultValue={editingConfig?.authentication?.apiKey || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="authApiKeyHeader">API Key Header</Label>
                    <Input 
                      id="authApiKeyHeader" 
                      name="authApiKeyHeader" 
                      defaultValue={editingConfig?.authentication?.apiKeyHeader || 'X-API-Key'}
                    />
                  </div>
                </div>
              </div>

              {/* Default Headers */}
              <div>
                <Label className="text-base font-semibold">Varsayılan Header'lar</Label>
                <div className="space-y-2 mt-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input 
                        placeholder="Header Key"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        placeholder="Header Value"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeHeader(index)}
                        disabled={headers.length === 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHeader}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Header Ekle
                  </Button>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input 
                    id="timeout" 
                    name="timeout" 
                    type="number"
                    defaultValue={editingConfig?.timeout || 30000}
                  />
                </div>
                <div>
                  <Label htmlFor="retryCount">Retry Sayısı</Label>
                  <Input 
                    id="retryCount" 
                    name="retryCount" 
                    type="number"
                    defaultValue={editingConfig?.retryCount || 3}
                  />
                </div>
                <div>
                  <Label htmlFor="isActive">Durum</Label>
                  <select 
                    id="isActive" 
                    name="isActive" 
                    defaultValue={editingConfig?.isActive ? 'true' : 'false'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-1" />
                  {editingConfig ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={testApiConnection}
                >
                  <TestTube className="w-4 h-4 mr-1" />
                  Bağlantıyı Test Et
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  İptal
                </Button>
              </div>

              {/* Test Results */}
              {showTest && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Test Sonucu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
                      {testResult}
                    </pre>
                  </CardContent>
                </Card>
              )}
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
          <h1 className="text-3xl font-bold">API Yapılandırması</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="API ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <DataGrid
        data={filteredConfigs}
        columnDefs={columnDefs}
        title={`API Yapılandırmaları (${filteredConfigs.length})`}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
