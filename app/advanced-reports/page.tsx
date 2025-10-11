'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Table, 
  Download, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'chart' | 'table' | 'dashboard'
  category: string
  dataSource: string
  isPublic: boolean
  createdAt: string
  lastUsed?: string
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Satış Trend Analizi',
    description: 'Aylık satış trendlerini gösteren detaylı analiz raporu',
    type: 'chart',
    category: 'Satış',
    dataSource: 'Pinebi API',
    isPublic: true,
    createdAt: '2025-10-01'
  },
  {
    id: '2',
    name: 'Müşteri Segmentasyonu',
    description: 'Müşterileri gelir seviyesine göre segmentlere ayıran rapor',
    type: 'chart',
    category: 'Müşteri',
    dataSource: 'Pinebi API',
    isPublic: false,
    createdAt: '2025-09-28'
  },
  {
    id: '3',
    name: 'Finansal Özet',
    description: 'Gelir, gider ve kar analizi tablosu',
    type: 'table',
    category: 'Finans',
    dataSource: 'Pinebi API',
    isPublic: true,
    createdAt: '2025-09-25'
  }
]

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="w-4 h-4" /> },
  { value: 'line', label: 'Line Chart', icon: <LineChart className="w-4 h-4" /> },
  { value: 'pie', label: 'Pie Chart', icon: <PieChart className="w-4 h-4" /> },
  { value: 'table', label: 'Data Table', icon: <Table className="w-4 h-4" /> }
]

const dataSources = [
  'Pinebi API',
  'Satış Veritabanı',
  'Müşteri Veritabanı',
  'Finansal Sistem'
]

export default function AdvancedReportsPage() {
  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: 'chart' as const,
    category: '',
    dataSource: 'Pinebi API',
    isPublic: false
  })

  const handleCreateReport = () => {
    console.log('Creating new report:', newReport)
    // Burada yeni rapor oluşturma logic'i olacak
  }

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setActiveTab('builder')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Gelişmiş Raporlar
        </h1>
        <p className="text-gray-600">
          Dinamik rapor oluşturucu ile özel raporlarınızı tasarlayın
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Şablonlar
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Rapor Oluştur
          </TabsTrigger>
          <TabsTrigger value="my-reports" className="flex items-center gap-2">
            <Table className="w-4 h-4" />
            Raporlarım
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ayarlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {template.type === 'chart' && <BarChart3 className="w-4 h-4 text-blue-600" />}
                      {template.type === 'table' && <Table className="w-4 h-4 text-green-600" />}
                      {template.type === 'dashboard' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Kategori:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {template.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Veri Kaynağı:</span>
                      <span>{template.dataSource}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Oluşturulma:</span>
                      <span>{template.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Rapor Oluştur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rapor Adı</label>
                    <Input
                      placeholder="Rapor adını girin"
                      value={newReport.name}
                      onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Açıklama</label>
                    <Input
                      placeholder="Rapor açıklaması"
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kategori</label>
                    <Select value={newReport.category} onValueChange={(value) => setNewReport({...newReport, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="satis">Satış</SelectItem>
                        <SelectItem value="musteri">Müşteri</SelectItem>
                        <SelectItem value="finans">Finans</SelectItem>
                        <SelectItem value="operasyon">Operasyon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rapor Türü</label>
                    <div className="grid grid-cols-2 gap-2">
                      {chartTypes.map((type) => (
                        <Button
                          key={type.value}
                          variant={newReport.type === type.value ? "default" : "outline"}
                          className="flex items-center gap-2"
                          onClick={() => setNewReport({...newReport, type: type.value as any})}
                        >
                          {type.icon}
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Veri Kaynağı</label>
                    <Select value={newReport.dataSource} onValueChange={(value) => setNewReport({...newReport, dataSource: value})}>
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={newReport.isPublic}
                      onChange={(e) => setNewReport({...newReport, isPublic: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm">Herkes tarafından görülebilir</label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={handleCreateReport} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Rapor Oluştur
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Şablon İndir
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Raporlarım</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportTemplates.filter(t => !t.isPublic).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
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
              <CardTitle>Rapor Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Varsayılan Ayarlar</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Otomatik güncelleme</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>E-posta bildirimleri</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Veri sıkıştırma</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Güvenlik</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Şifreli raporlar</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>IP kısıtlaması</span>
                    <input type="checkbox" className="rounded" />
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













