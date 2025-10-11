'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Globe, 
  Server,
  Key,
  Clock,
  FileText,
  Mail,
  Smartphone,
  Monitor,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Save,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

interface SystemInfo {
  version: string
  buildDate: string
  uptime: string
  memory: {
    used: string
    total: string
    percentage: number
  }
  disk: {
    used: string
    total: string
    percentage: number
  }
  cpu: {
    usage: number
    cores: number
  }
}

const systemInfo: SystemInfo = {
  version: '1.2.0',
  buildDate: '2025-10-04',
  uptime: '7 gün, 14 saat',
  memory: {
    used: '2.4 GB',
    total: '8 GB',
    percentage: 30
  },
  disk: {
    used: '45 GB',
    total: '500 GB',
    percentage: 9
  },
  cpu: {
    usage: 25,
    cores: 8
  }
}

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // Genel Ayarlar
    siteName: 'Pinebi Report',
    siteDescription: 'Gelişmiş raporlama ve analiz sistemi',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24',
    
    // API Ayarları
    apiTimeout: 30,
    maxRetries: 3,
    cacheEnabled: true,
    cacheTTL: 300,
    
    // Güvenlik Ayarları
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
    ipWhitelist: '',
    
    // Bildirim Ayarları
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    notificationSound: true,
    
    // Performans Ayarları
    enableCompression: true,
    enableCaching: true,
    maxConcurrentUsers: 100,
    rateLimitPerMinute: 60,
    
    // Backup Ayarları
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: 'local'
  })

  const [showPassword, setShowPassword] = useState(false)
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@pinebi.com',
    fromName: 'Pinebi Report'
  })

  const handleSave = () => {
    console.log('Saving settings:', settings)
    // Burada ayarları kaydetme logic'i olacak
  }

  const handleTestConnection = () => {
    console.log('Testing connection...')
    // Burada bağlantı test logic'i olacak
  }

  const handleResetSettings = () => {
    console.log('Resetting settings...')
    // Burada ayarları sıfırlama logic'i olacak
  }

  const handleBackupNow = () => {
    console.log('Creating backup...')
    // Burada backup oluşturma logic'i olacak
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          Sistem Ayarları
        </h1>
        <p className="text-gray-600">
          Sistem konfigürasyonunu yönetin ve performansı izleyin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Genel
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Veritabanı
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performans
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Adı</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Site Açıklaması</label>
                  <Input
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dil</label>
                  <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarih ve Saat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Zaman Dilimi</label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Istanbul">İstanbul (GMT+3)</SelectItem>
                      <SelectItem value="Europe/London">Londra (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tarih Formatı</label>
                  <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Saat Formatı</label>
                  <Select value={settings.timeFormat} onValueChange={(value) => setSettings({...settings, timeFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 Saat</SelectItem>
                      <SelectItem value="12">12 Saat (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bağlantı Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Veritabanı Host</label>
                  <Input defaultValue="localhost" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Port</label>
                  <Input defaultValue="5432" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Veritabanı Adı</label>
                  <Input defaultValue="pinebi_report" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
                  <Input defaultValue="postgres" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Şifre</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      defaultValue="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleTestConnection}>
                  <Activity className="w-4 h-4 mr-2" />
                  Bağlantıyı Test Et
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Maksimum Bağlantı</label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bağlantı Timeout (saniye)</label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pool Size</label>
                  <Input type="number" defaultValue="20" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Query Cache</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Connection Pooling</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kimlik Doğrulama</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Oturum Süresi (dakika)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maksimum Giriş Denemesi</label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Şifre Uzunluğu</label>
                  <Input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>İki Faktörlü Kimlik Doğrulama</span>
                  <input
                    type="checkbox"
                    checked={settings.requireTwoFactor}
                    onChange={(e) => setSettings({...settings, requireTwoFactor: e.target.checked})}
                    className="rounded"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IP Güvenliği</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">IP Beyaz Liste</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={4}
                    placeholder="192.168.1.1&#10;10.0.0.0/8"
                    value={settings.ipWhitelist}
                    onChange={(e) => setSettings({...settings, ipWhitelist: e.target.value})}
                  />
                  <p className="text-sm text-gray-500 mt-1">Her satıra bir IP adresi</p>
                </div>
                <div className="flex items-center justify-between">
                  <span>IP Kısıtlaması</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Geolocation Kontrolü</span>
                  <input type="checkbox" className="rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>E-posta Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Host</label>
                  <Input
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Port</label>
                  <Input
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
                  <Input
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Şifre</label>
                  <Input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gönderen E-posta</label>
                  <Input
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bildirim Türleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>E-posta Bildirimleri</span>
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => setSettings({...settings, emailEnabled: e.target.checked})}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS Bildirimleri</span>
                  <input
                    type="checkbox"
                    checked={settings.smsEnabled}
                    onChange={(e) => setSettings({...settings, smsEnabled: e.target.checked})}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Push Bildirimleri</span>
                  <input
                    type="checkbox"
                    checked={settings.pushEnabled}
                    onChange={(e) => setSettings({...settings, pushEnabled: e.target.checked})}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Bildirim Sesi</span>
                  <input
                    type="checkbox"
                    checked={settings.notificationSound}
                    onChange={(e) => setSettings({...settings, notificationSound: e.target.checked})}
                    className="rounded"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  CPU
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{systemInfo.cpu.usage}%</div>
                  <div className="text-sm text-gray-600">Kullanım</div>
                  <div className="mt-2 text-sm text-gray-500">{systemInfo.cpu.cores} Core</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  Bellek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{systemInfo.memory.percentage}%</div>
                  <div className="text-sm text-gray-600">Kullanım</div>
                  <div className="mt-2 text-sm text-gray-500">
                    {systemInfo.memory.used} / {systemInfo.memory.total}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Disk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{systemInfo.disk.percentage}%</div>
                  <div className="text-sm text-gray-600">Kullanım</div>
                  <div className="mt-2 text-sm text-gray-500">
                    {systemInfo.disk.used} / {systemInfo.disk.total}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performans Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Maksimum Eşzamanlı Kullanıcı</label>
                  <Input
                    type="number"
                    value={settings.maxConcurrentUsers}
                    onChange={(e) => setSettings({...settings, maxConcurrentUsers: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rate Limit (dakika)</label>
                  <Input
                    type="number"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => setSettings({...settings, rateLimitPerMinute: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Veri Sıkıştırma</span>
                <input
                  type="checkbox"
                  checked={settings.enableCompression}
                  onChange={(e) => setSettings({...settings, enableCompression: e.target.checked})}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Önbellekleme</span>
                <input
                  type="checkbox"
                  checked={settings.enableCaching}
                  onChange={(e) => setSettings({...settings, enableCaching: e.target.checked})}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Otomatik Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Otomatik Backup</span>
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                    className="rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Backup Sıklığı</label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({...settings, backupFrequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Saatlik</SelectItem>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="weekly">Haftalık</SelectItem>
                      <SelectItem value="monthly">Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Saklama Süresi (gün)</label>
                  <Input
                    type="number"
                    value={settings.backupRetention}
                    onChange={(e) => setSettings({...settings, backupRetention: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Backup Konumu</label>
                  <Select value={settings.backupLocation} onValueChange={(value) => setSettings({...settings, backupLocation: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Yerel</SelectItem>
                      <SelectItem value="cloud">Bulut</SelectItem>
                      <SelectItem value="ftp">FTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manuel Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button onClick={handleBackupNow} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Şimdi Backup Al
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Backup Geri Yükle
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eski Backupları Temizle
                  </Button>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Son Backup</h4>
                  <p className="text-sm text-gray-600">2025-10-04 14:30:00</p>
                  <p className="text-sm text-gray-600">Boyut: 245 MB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline" onClick={handleResetSettings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Sıfırla
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Ayarları Kaydet
        </Button>
      </div>
    </div>
  )
}













