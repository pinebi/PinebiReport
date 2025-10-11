'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  Database,
  Calendar,
  Filter,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Table,
  Mail,
  Share2
} from 'lucide-react'

interface ExportJob {
  id: string
  name: string
  type: 'excel' | 'pdf' | 'csv' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  dataSource: string
  dateRange: string
  createdAt: string
  completedAt?: string
  fileSize?: string
  downloadUrl?: string
}

const exportJobs: ExportJob[] = [
  {
    id: '1',
    name: 'Satış Raporu - Ekim 2025',
    type: 'excel',
    status: 'completed',
    dataSource: 'Pinebi API',
    dateRange: '2025-10-01 - 2025-10-31',
    createdAt: '2025-10-04 14:30',
    completedAt: '2025-10-04 14:32',
    fileSize: '2.4 MB',
    downloadUrl: '/downloads/sales-report-oct-2025.xlsx'
  },
  {
    id: '2',
    name: 'Müşteri Analizi',
    type: 'pdf',
    status: 'processing',
    dataSource: 'Pinebi API',
    dateRange: '2025-09-01 - 2025-09-30',
    createdAt: '2025-10-04 15:15'
  },
  {
    id: '3',
    name: 'Finansal Özet',
    type: 'csv',
    status: 'pending',
    dataSource: 'Pinebi API',
    dateRange: '2025-10-01 - 2025-10-04',
    createdAt: '2025-10-04 15:45'
  }
]

const exportTypes = [
  { value: 'excel', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />, description: 'Tablo verileri için ideal' },
  { value: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5 text-red-600" />, description: 'Rapor ve grafikler için' },
  { value: 'csv', label: 'CSV', icon: <FileText className="w-5 h-5 text-blue-600" />, description: 'Veri analizi için' },
  { value: 'json', label: 'JSON', icon: <Database className="w-5 h-5 text-yellow-600" />, description: 'API entegrasyonu için' }
]

const dataSources = [
  'Pinebi API',
  'Satış Veritabanı',
  'Müşteri Veritabanı',
  'Finansal Sistem',
  'Dashboard Verileri'
]

export default function DataExportPage() {
  const [activeTab, setActiveTab] = useState('export')
  const [selectedType, setSelectedType] = useState('excel')
  const [exportSettings, setExportSettings] = useState({
    name: '',
    dataSource: 'Pinebi API',
    dateRange: 'last30days',
    customStartDate: '',
    customEndDate: '',
    includeCharts: true,
    includeMetadata: true,
    compression: false,
    emailNotification: false,
    emailAddress: ''
  })

  const handleExport = () => {
    console.log('Starting export with settings:', exportSettings)
    // Burada export logic'i olacak
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Download className="h-8 w-8 text-green-600" />
          Veri Dışa Aktarma
        </h1>
        <p className="text-gray-600">
          Raporlarınızı ve verilerinizi farklı formatlarda dışa aktarın
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Dışa Aktar
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Geçmiş
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ayarlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Export Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Dosya Adı</label>
                    <Input
                      placeholder="Export dosya adını girin"
                      value={exportSettings.name}
                      onChange={(e) => setExportSettings({...exportSettings, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Veri Kaynağı</label>
                    <Select value={exportSettings.dataSource} onValueChange={(value) => setExportSettings({...exportSettings, dataSource: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map((source) => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tarih Aralığı</label>
                    <Select value={exportSettings.dateRange} onValueChange={(value) => setExportSettings({...exportSettings, dateRange: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Bugün</SelectItem>
                        <SelectItem value="yesterday">Dün</SelectItem>
                        <SelectItem value="last7days">Son 7 Gün</SelectItem>
                        <SelectItem value="last30days">Son 30 Gün</SelectItem>
                        <SelectItem value="last90days">Son 90 Gün</SelectItem>
                        <SelectItem value="thisMonth">Bu Ay</SelectItem>
                        <SelectItem value="lastMonth">Geçen Ay</SelectItem>
                        <SelectItem value="custom">Özel Tarih</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {exportSettings.dateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Başlangıç Tarihi</label>
                        <Input
                          type="date"
                          value={exportSettings.customStartDate}
                          onChange={(e) => setExportSettings({...exportSettings, customStartDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
                        <Input
                          type="date"
                          value={exportSettings.customEndDate}
                          onChange={(e) => setExportSettings({...exportSettings, customEndDate: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-medium">Ek Seçenekler</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="includeCharts"
                          checked={exportSettings.includeCharts}
                          onChange={(e) => setExportSettings({...exportSettings, includeCharts: e.target.checked})}
                          className="rounded"
                        />
                        <label htmlFor="includeCharts" className="text-sm">Grafikleri dahil et</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="includeMetadata"
                          checked={exportSettings.includeMetadata}
                          onChange={(e) => setExportSettings({...exportSettings, includeMetadata: e.target.checked})}
                          className="rounded"
                        />
                        <label htmlFor="includeMetadata" className="text-sm">Metadata bilgilerini dahil et</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="compression"
                          checked={exportSettings.compression}
                          onChange={(e) => setExportSettings({...exportSettings, compression: e.target.checked})}
                          className="rounded"
                        />
                        <label htmlFor="compression" className="text-sm">Dosyayı sıkıştır</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Bildirim</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="emailNotification"
                          checked={exportSettings.emailNotification}
                          onChange={(e) => setExportSettings({...exportSettings, emailNotification: e.target.checked})}
                          className="rounded"
                        />
                        <label htmlFor="emailNotification" className="text-sm">Tamamlandığında e-posta gönder</label>
                      </div>
                      {exportSettings.emailNotification && (
                        <div>
                          <label className="block text-sm font-medium mb-2">E-posta Adresi</label>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            value={exportSettings.emailAddress}
                            onChange={(e) => setExportSettings({...exportSettings, emailAddress: e.target.value})}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Formatı</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exportTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedType(type.value)}
                    >
                      <div className="flex items-center gap-3">
                        {type.icon}
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hızlı Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard Verileri
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Table className="w-4 h-4 mr-2" />
                    Son Raporlar
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Tüm Veriler
                  </Button>
                </CardContent>
              </Card>

              <Button onClick={handleExport} className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Export Başlat
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-medium">{job.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{job.type.toUpperCase()}</span>
                          <span>{job.dataSource}</span>
                          <span>{job.dateRange}</span>
                          {job.fileSize && <span>{job.fileSize}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status === 'completed' && 'Tamamlandı'}
                        {job.status === 'processing' && 'İşleniyor'}
                        {job.status === 'pending' && 'Bekliyor'}
                        {job.status === 'failed' && 'Başarısız'}
                      </span>
                      {job.status === 'completed' && job.downloadUrl && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Varsayılan Ayarlar</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Otomatik dosya adlandırma</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Export tamamlandığında bildirim</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dosyaları otomatik temizle (30 gün)</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Güvenlik</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Şifreli export dosyaları</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Export loglarını sakla</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}













